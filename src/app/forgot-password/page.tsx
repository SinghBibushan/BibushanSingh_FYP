import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { AuthPanel } from "@/components/layout/auth-panel";
import { SiteHeader } from "@/components/layout/site-header";

export default function ForgotPasswordPage() {
  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell grid min-h-[calc(100vh-5rem)] items-center gap-8 py-14 lg:grid-cols-[0.95fr_1.05fr]">
        <AuthPanel
          eyebrow="Recovery"
          title="Password reset that works with SMTP or the local mock mail flow."
          description="If SMTP is not configured, the generated reset link is surfaced in the interface so the flow remains testable during development."
        />
        <div className="flex justify-center lg:justify-end">
          <ForgotPasswordForm />
        </div>
      </main>
    </div>
  );
}
