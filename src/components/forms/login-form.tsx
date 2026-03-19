"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const googleAuthEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: LoginInput) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = await readJson<{ message: string }>(response);
    toast.success(data.message);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-lg bg-white/78 shadow-[0_26px_70px_rgba(24,34,53,0.1)]">
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
            Welcome back
          </p>
          <h2 className="text-4xl leading-none">Log in to continue</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Access bookings, loyalty activity, notifications, and admin operations from
            one account.
          </p>
        </div>

        {googleAuthEnabled ? (
          <>
            <GoogleSignInButton />
            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Or continue with email
              </span>
              <Separator className="flex-1" />
            </div>
          </>
        ) : null}

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await onSubmit(values);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Login failed.");
            }
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="you@example.com" {...form.register("email")} />
            {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm font-semibold text-primary">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...form.register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Continue to dashboard"}
          </Button>
        </form>

        <div className="rounded-[24px] border border-border bg-white/66 p-4 text-sm text-muted-foreground">
          New to EventEase?{" "}
          <Link href="/register" className="font-semibold text-primary">
            Create an account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
