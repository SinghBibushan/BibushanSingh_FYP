import { QrCode, ReceiptText } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";

const userNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/profile", label: "Profile" },
  { href: "/tickets", label: "Tickets" },
];

const ticketStates = [
  {
    title: "QR-backed entry",
    description: "Each issued ticket will store a unique QR payload and ticket code.",
    icon: QrCode,
  },
  {
    title: "PDF downloads",
    description: "Confirmed bookings will expose downloadable PDF tickets here.",
    icon: ReceiptText,
  },
];

export default async function TicketsPage() {
  await requireUser();

  return (
    <AppShell
      badge="My tickets"
      title="Ticket vault"
      description="This area is now protected behind login and will become the home for issued QR tickets and downloadable PDFs after the booking flow is built."
      navItems={userNavItems}
      currentPath="/tickets"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {ticketStates.map((item) => (
          <Card key={item.title}>
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl leading-none">{item.title}</h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
