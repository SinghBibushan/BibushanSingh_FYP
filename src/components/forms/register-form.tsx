"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { readJson } from "@/lib/api";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

type RegisterResponse = {
  message: string;
  verifyUrl?: string;
};

export function RegisterForm() {
  const router = useRouter();
  const googleAuthEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: RegisterInput) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = await readJson<RegisterResponse>(response);
    setRegistrationSuccess(true);
    toast.success(data.message);

    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 2000);
  }

  return (
    <Card className="mx-auto w-full max-w-xl bg-white/78 shadow-[0_26px_70px_rgba(24,34,53,0.1)]">
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
            Create account
          </p>
          <h2 className="text-4xl leading-none">Set up your EventEase access</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Register once to manage bookings, receive event updates, and move into the
            loyalty and ticketing flows without friction.
          </p>
        </div>

        {googleAuthEnabled ? (
          <>
            <GoogleSignInButton />
            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Or register with email
              </span>
              <Separator className="flex-1" />
            </div>
          </>
        ) : null}

        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await onSubmit(values);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Registration failed.");
            }
          })}
        >
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Your full name" {...form.register("name")} />
            {errors.name ? <p className="text-sm text-red-600">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="you@example.com" {...form.register("email")} />
            {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              {...form.register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat password"
              {...form.register("confirmPassword")}
            />
            {errors.confirmPassword ? (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <Button className="w-full" disabled={isSubmitting || registrationSuccess}>
              {isSubmitting
                ? "Creating account..."
                : registrationSuccess
                  ? "Account created. Check your email..."
                  : "Create account"}
            </Button>
          </div>
        </form>

        {registrationSuccess ? (
          <div className="rounded-[24px] border border-accent/20 bg-accent/8 p-4 text-sm">
            <p className="mb-1 font-semibold text-foreground">Registration successful.</p>
            <p className="text-muted-foreground">
              Check your inbox for the verification link before continuing into the full
              platform experience.
            </p>
          </div>
        ) : null}

        <div className="rounded-[24px] border border-border bg-white/66 p-4 text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
