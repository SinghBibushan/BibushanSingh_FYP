import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell grid min-h-[calc(100vh-5rem)] items-center py-14 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden space-y-5 pr-8 lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            New accounts
          </p>
          <h1 className="text-5xl leading-none">
            Registration, verification, loyalty, and profile setup in one flow.
          </h1>
          <p className="max-w-xl text-base leading-8 text-muted-foreground">
            This page is ready for React Hook Form + Zod once the auth routes and
            email verification service are implemented.
          </p>
        </div>

        <Card className="mx-auto w-full max-w-xl">
          <CardContent className="space-y-6 p-8">
            <div className="space-y-2">
              <h2 className="text-4xl leading-none">Create account</h2>
              <p className="text-sm text-muted-foreground">
                Customer onboarding scaffold with clean visual language for the live build.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Bibushan Singh" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="bibushan@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" />
              </div>
            </div>
            <Button className="w-full">Create account</Button>
            <p className="text-sm text-muted-foreground">
              Already registered?{" "}
              <Link href="/login" className="font-semibold text-secondary">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
