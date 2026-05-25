import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/login-form";
import { AuthPanel } from "@/components/layout/auth-panel";
import { SiteHeader } from "@/components/layout/site-header";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell grid min-h-[calc(100vh-5rem)] items-center gap-8 py-14 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="opacity-0 animate-slide-in-left">
          <AuthPanel
            eyebrow="Authentication"
            title="Sign in for bookings, tickets, and platform operations."
            description="A clean login flow for attendees, staff, organizers, and administrators."
          />
        </div>
        <div className="opacity-0 animate-slide-in-right delay-200">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
