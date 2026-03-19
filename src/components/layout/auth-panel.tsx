import { ShieldCheck, Sparkles, Ticket } from "lucide-react";

const benefits = [
  {
    title: "Session-based security",
    description: "JWT cookies keep the flow simple while preserving role-aware access control.",
    icon: ShieldCheck,
  },
  {
    title: "Verification that fits the demo",
    description: "Email verification and password resets remain reliable with or without SMTP.",
    icon: Sparkles,
  },
  {
    title: "Ready for booking flows",
    description: "Users move directly from authentication into events, tickets, and loyalty.",
    icon: Ticket,
  },
];

export function AuthPanel({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="hidden rounded-[34px] bg-[linear-gradient(160deg,#182235_0%,#24314d_62%,#43506b_100%)] p-8 text-white shadow-[0_28px_70px_rgba(24,34,53,0.22)] lg:block">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/58">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-5xl leading-[0.95]">{title}</h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-white/72">{description}</p>

      <div className="mt-10 space-y-4">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="rounded-[26px] border border-white/10 bg-white/7 p-5 backdrop-blur-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
              <benefit.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-2xl leading-none">{benefit.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
