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
          title="Password reset that works online or fully in mock demo mode."
          description="If SMTP is absent, the generated reset link is exposed directly in the UI so the viva flow remains smooth and fully demonstrable."
        />
        <div className="flex justify-center lg:justify-end">
          <ForgotPasswordForm />
        </div>
      </main>
    </div>
  );
}
