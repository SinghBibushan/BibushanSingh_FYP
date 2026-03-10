"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { readJson } from "@/lib/api";

type VerificationState = "loading" | "success" | "error";

export function VerifyEmailCard({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<VerificationState>("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await readJson<{ message: string }>(response);

        if (cancelled) {
          return;
        }

        setState("success");
        setMessage(data.message);
        router.refresh();
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState("error");
        setMessage(
          error instanceof Error ? error.message : "Could not verify email.",
        );
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [router, token]);

  return (
    <Card className="w-full max-w-lg">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        {state === "loading" ? (
          <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        ) : null}
        {state === "success" ? (
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        ) : null}
        {state === "error" ? (
          <XCircle className="h-12 w-12 text-red-600" />
        ) : null}
        <h1 className="text-4xl leading-none">
          {state === "loading"
            ? "Verifying email"
            : state === "success"
              ? "Email verified"
              : "Verification failed"}
        </h1>
        <p className="text-sm leading-7 text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
