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
            title="Secure login for customers and administrators."
            description="This phase adds working JWT cookie auth, reset links, and email verification while keeping the setup demo-friendly on a fresh viva machine."
          />
        </div>
        <div className="opacity-0 animate-slide-in-right delay-200">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
