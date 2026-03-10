import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell flex min-h-[calc(100vh-5rem)] items-center justify-center py-14">
        <Card className="w-full max-w-lg">
          <CardContent className="space-y-6 p-8">
            <div className="space-y-2">
              <h1 className="text-4xl leading-none">Reset access</h1>
              <p className="text-sm text-muted-foreground">
                Mock email mode will log reset links locally when SMTP is not configured.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Account email</Label>
              <Input id="email" placeholder="bibushan@example.com" />
            </div>
            <Button className="w-full">Send reset link</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
