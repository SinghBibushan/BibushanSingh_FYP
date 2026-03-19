import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/forms/register-form";
import { AuthPanel } from "@/components/layout/auth-panel";
import { SiteHeader } from "@/components/layout/site-header";
import { getSession } from "@/lib/auth";

export default async function RegisterPage() {
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
            eyebrow="Registration"
            title="Create an account that is immediately ready for live booking flows."
            description="New users move into a polished onboarding path with verification, account security, and direct access to tickets, loyalty, and future event activity."
          />
        </div>
        <div className="opacity-0 animate-slide-in-right delay-200">
          <RegisterForm />
        </div>
      </main>
    </div>
  );
}
