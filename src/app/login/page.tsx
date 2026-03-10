import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell grid min-h-[calc(100vh-5rem)] items-center py-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden space-y-5 pr-8 lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            Authentication
          </p>
          <h1 className="text-5xl leading-none">
            Secure login for customers and administrators.
          </h1>
          <p className="max-w-xl text-base leading-8 text-muted-foreground">
            JWT cookie auth, forgot/reset password, and email verification will
            be layered onto this interface in the authentication phase.
          </p>
        </div>

        <Card className="mx-auto w-full max-w-lg">
          <CardContent className="space-y-6 p-8">
            <div className="space-y-2">
              <h2 className="text-4xl leading-none">Log in</h2>
              <p className="text-sm text-muted-foreground">
                Scaffolded UI placeholder for the upcoming auth flow.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="bibushan@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
            </div>
            <Button className="w-full">Continue</Button>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <Link href="/forgot-password">Forgot password?</Link>
              <Link href="/register">Create account</Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
