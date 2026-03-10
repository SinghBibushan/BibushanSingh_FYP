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
        <AuthPanel
          eyebrow="Registration"
          title="Create an account that is ready for bookings and loyalty rewards."
          description="New users are signed in immediately, then guided into email verification through a mock-safe flow that still works without SMTP."
        />
        <RegisterForm />
      </main>
    </div>
  );
}
