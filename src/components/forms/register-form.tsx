"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { readJson } from "@/lib/api";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

type RegisterResponse = {
  message: string;
  verifyUrl?: string;
};

export function RegisterForm() {
  const router = useRouter();
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

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 2000);
  }

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardContent className="space-y-6 p-8">
        <div className="space-y-2">
          <h2 className="text-4xl leading-none">Create account</h2>
          <p className="text-sm text-muted-foreground">
            Register once and move directly into event booking and loyalty flows.
          </p>
        </div>

        <GoogleSignInButton />

        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-sm text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>

        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await onSubmit(values);
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Registration failed.",
              );
            }
          })}
        >
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Bibushan Singh" {...form.register("name")} />
            {errors.name ? (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="bibushan@example.com"
              {...form.register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            ) : null}
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
              placeholder="Repeat your password"
              {...form.register("confirmPassword")}
            />
            {errors.confirmPassword ? (
              <p className="text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <Button className="w-full" disabled={isSubmitting || registrationSuccess}>
              {isSubmitting ? "Creating account..." : registrationSuccess ? "Account created! Check your email..." : "Create account"}
            </Button>
          </div>
        </form>

        {registrationSuccess && (
          <div className="rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 p-4 text-sm">
            <p className="font-semibold text-green-800 mb-1">✅ Registration Successful!</p>
            <p className="text-gray-700">
              Please check your email inbox for a verification link to complete your registration.
            </p>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-secondary">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
