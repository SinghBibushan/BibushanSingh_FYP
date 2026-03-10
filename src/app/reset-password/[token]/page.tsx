import { AuthPanel } from "@/components/layout/auth-panel";
import { SiteHeader } from "@/components/layout/site-header";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell grid min-h-[calc(100vh-5rem)] items-center gap-8 py-14 lg:grid-cols-[0.95fr_1.05fr]">
        <AuthPanel
          eyebrow="Reset password"
          title="Choose a new password and continue straight back into the app."
          description="This reset view is part of the Phase 3 auth cycle and signs the user in automatically after a successful password update."
        />
        <div className="flex justify-center lg:justify-end">
          <ResetPasswordForm token={token} />
        </div>
      </main>
    </div>
  );
}
