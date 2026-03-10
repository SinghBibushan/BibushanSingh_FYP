import Image from "next/image";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { getCurrentUserTickets } from "@/server/tickets/service";

const userNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/profile", label: "Profile" },
  { href: "/tickets", label: "Tickets" },
  { href: "/loyalty", label: "Loyalty" },
];

export default async function TicketsPage() {
  await requireUser();
  const tickets = await getCurrentUserTickets();

  return (
    <AppShell
      badge="My tickets"
      title="Ticket vault"
      description="Confirmed bookings now issue ticket records with QR payloads and downloadable PDFs ready for viva demonstration."
      navItems={userNavItems}
      currentPath="/tickets"
    >
      {tickets.length === 0 ? (
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <h2 className="text-3xl leading-none">No tickets yet</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Complete a booking payment to issue tickets here with QR codes and PDF downloads.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {tickets.map((ticket) => (
            <Card key={ticket.ticketCode} className="overflow-hidden">
              <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_220px]">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge>{ticket.ticketTypeName}</Badge>
                    <Badge className={ticket.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : ""}>
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl leading-none">{ticket.eventTitle}</h2>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {ticket.eventVenue}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(ticket.eventStartsAt)}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-muted p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        Ticket code
                      </p>
                      <p className="mt-2 font-semibold">{ticket.ticketCode}</p>
                    </div>
                    <div className="rounded-2xl bg-muted p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        Booking code
                      </p>
                      <p className="mt-2 font-semibold">{ticket.bookingCode}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/api/tickets/${ticket.ticketCode}/pdf`}
                      className="inline-flex rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground"
                    >
                      Download PDF
                    </Link>
                    {ticket.eventSlug ? (
                      <Link
                        href={`/events/${ticket.eventSlug}`}
                        className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground"
                      >
                        View event
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center justify-center rounded-[28px] bg-muted p-4">
                  <Image
                    src={ticket.qrCodeDataUrl}
                    alt={`QR code for ${ticket.ticketCode}`}
                    width={180}
                    height={180}
                    unoptimized
                    className="h-[180px] w-[180px] rounded-2xl bg-white p-2"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
