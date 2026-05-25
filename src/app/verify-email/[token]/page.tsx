import { VerifyEmailCard } from "@/components/forms/verify-email-card";
import { AuthPanel } from "@/components/layout/auth-panel";
import { SiteHeader } from "@/components/layout/site-header";

export default async function VerifyEmailPage({
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
          eyebrow="Email verification"
          title="Verification is built into the product flow, not treated as an afterthought."
          description="Verification works through SMTP when configured, or through the built-in mock mail flow for local testing."
        />
        <div className="flex justify-center lg:justify-end">
          <VerifyEmailCard token={token} />
        </div>
      </main>
    </div>
  );
}
