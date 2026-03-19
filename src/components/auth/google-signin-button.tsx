"use client";

import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

type GoogleCredentialResponse = {
  credential: string;
};

type GoogleIdConfiguration = {
  callback: (response: GoogleCredentialResponse) => void;
  client_id: string;
};

type GoogleButtonOptions = {
  size: "large";
  text?: "continue_with";
  theme: "outline";
  width: string;
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

export function GoogleSignInButton() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const buttonId = useId().replace(/:/g, "");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!clientId) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        const container = document.getElementById(buttonId);
        if (container) {
          window.google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            text: "continue_with",
            width: "100%",
          });
          setReady(true);
        }
      }
    };

    return () => {
      script.remove();
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
