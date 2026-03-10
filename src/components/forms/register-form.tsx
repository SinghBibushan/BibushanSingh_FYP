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
import { readJson } from "@/lib/api";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

type RegisterResponse = {
  message: string;
  verifyUrl?: string;
};

export function RegisterForm() {
  const router = useRouter();
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
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
    setVerifyUrl(data.verifyUrl ?? null);
    toast.success(data.message);
    router.push("/dashboard");
    router.refresh();
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
            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </div>
        </form>

        {verifyUrl ? (
          <div className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
            Mock email mode is active. Verification link:
            <a className="mt-2 block font-semibold text-secondary" href={verifyUrl}>
              {verifyUrl}
            </a>
          </div>
        ) : null}

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
