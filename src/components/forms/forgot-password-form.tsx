"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readJson } from "@/lib/api";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

type ForgotPasswordResponse = {
  message: string;
  resetUrl?: string;
};

export function ForgotPasswordForm() {
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { errors, isSubmitting } = form.formState;

  return (
    <Card className="w-full max-w-lg">
      <CardContent className="space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-4xl leading-none">Reset access</h1>
          <p className="text-sm text-muted-foreground">
            If SMTP is missing, the reset link will be shown directly for demo use.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
              });

              const data = await readJson<ForgotPasswordResponse>(response);
              setResetUrl(data.resetUrl ?? null);
              toast.success(data.message);
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Could not prepare reset link.",
              );
            }
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Account email</Label>
            <Input id="email" placeholder="bibushan@example.com" {...form.register("email")} />
            {errors.email ? (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            ) : null}
          </div>
          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Preparing link..." : "Send reset link"}
          </Button>
        </form>

        {resetUrl ? (
          <div className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
            Mock reset link:
            <a className="mt-2 block font-semibold text-secondary" href={resetUrl}>
              {resetUrl}
            </a>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
