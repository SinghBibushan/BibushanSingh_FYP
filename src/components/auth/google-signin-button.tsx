"use client";

import { useEffect } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleSignInButton() {
  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInButton"),
          {
            theme: "outline",
            size: "large",
            width: "100%",
          }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) {
        throw new Error("Google sign-in failed");
      }

      toast.success("Signed in successfully!");
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <div id="googleSignInButton" className="w-full"></div>
    </div>
  );
}
