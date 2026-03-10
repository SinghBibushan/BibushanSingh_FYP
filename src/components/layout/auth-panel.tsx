import { ShieldCheck, Sparkles, Ticket } from "lucide-react";

const benefits = [
  {
    title: "Session-based security",
    description: "JWT cookies keep the demo simple while preserving role-aware access control.",
    icon: ShieldCheck,
  },
  {
    title: "Mock-friendly verification",
    description: "Email verification and password resets work even without SMTP during viva.",
    icon: Sparkles,
  },
  {
    title: "Booking-ready accounts",
    description: "Users can move directly from authentication into events, tickets, and loyalty flows.",
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
    <div className="hidden rounded-[32px] bg-secondary p-8 text-secondary-foreground lg:block">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-5xl leading-none">{title}</h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-white/72">
        {description}
      </p>
      <div className="mt-10 space-y-4">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="rounded-[24px] border border-white/10 bg-white/6 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
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
