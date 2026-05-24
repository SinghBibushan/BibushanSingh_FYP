"use client";

import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

type GoogleCredentialResponse = {
  credential: string;
};

type GoogleIdConfiguration = {
  callback: (response: GoogleCredentialResponse) => void;
  client_id: string;
  login_uri?: string;
  ux_mode?: "popup" | "redirect";
};

type GoogleButtonOptions = {
  size: "large";
  text?: "continue_with";
  theme: "outline";
  width: number;
};

type GoogleAccounts = {
  id: {
    initialize: (options: GoogleIdConfiguration) => void;
    renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void;
  };
};

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (window.google) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById("google-gsi-client");

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-client";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });

  return googleScriptPromise;
}

export function GoogleSignInButton() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const buttonId = useId().replace(/:/g, "");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleError = params.get("googleError");

    if (!googleError) {
      return;
    }

    toast.error(googleError);
    params.delete("googleError");
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, []);

  useEffect(() => {
    if (!clientId) {
      return;
    }

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled) {
          return;
        }

        if (window.google) {
          document.cookie = `google_auth_from=${encodeURIComponent(window.location.pathname)}; Path=/; Max-Age=600; SameSite=Lax`;
          const loginUri = `${window.location.origin}/api/auth/google`;
          const container = document.getElementById(buttonId);

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            login_uri: loginUri,
            ux_mode: "redirect",
          });

          if (container) {
            container.innerHTML = "";
            window.google.accounts.id.renderButton(container, {
              theme: "outline",
              size: "large",
              text: "continue_with",
              width: Math.min(container.clientWidth || 400, 400),
            });
            setReady(true);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Google sign-in could not be loaded.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [buttonId, clientId]);

  async function handleCredentialResponse(response: GoogleCredentialResponse) {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        throw new Error(data.message ?? "Google sign-in failed.");
      }

      toast.success("Signed in successfully!");
      window.location.assign("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed.");
    }
  }

  if (!clientId) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div id={buttonId} className="min-h-10 w-full" />
      {!ready ? (
        <p className="text-xs text-muted-foreground">
          Loading Google sign-in...
        </p>
      ) : null}
    </div>
  );
}
