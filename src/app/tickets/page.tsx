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
  { href: "/wishlist", label: "Wishlist" },
];

export default async function TicketsPage() {
  await requireUser();
  const tickets = await getCurrentUserTickets();

  return (
    <AppShell
      badge="My tickets"
      title="Ticket vault"
      description="Confirmed bookings generate QR-backed tickets and downloadable PDFs in a more polished delivery screen."
      navItems={userNavItems}
      currentPath="/tickets"
    >
      {tickets.length === 0 ? (
        <Card className="bg-white/78">
          <CardContent className="space-y-4 p-10 text-center">
            <h2 className="text-3xl leading-none">No tickets yet</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Complete a booking and payment to populate this vault with issued tickets.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          <div className="rounded-[28px] border border-border bg-white/72 px-6 py-4">
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
              Issued tickets
            </p>
            <p className="mt-2 text-3xl font-semibold leading-none text-foreground">
              {tickets.length}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {tickets.map((ticket) => (
              <Card key={ticket.ticketCode} className="overflow-hidden bg-white/78 hover-lift">
                <CardContent>
                  <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className="bg-primary text-primary-foreground">
                          {ticket.ticketTypeName}
                        </Badge>
                        <Badge
                          className={
                            ticket.status === "ACTIVE"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : ""
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-2xl font-semibold leading-tight text-foreground">
                          {ticket.eventTitle}
                        </h2>
                        <p className="text-sm leading-7 text-muted-foreground">
                          {ticket.eventVenue}
                        </p>
                        <p className="text-sm font-medium text-muted-foreground">
                          {formatDate(ticket.eventStartsAt)}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[22px] border border-border bg-white/82 p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            Ticket code
                          </p>
                          <p className="mt-2 font-mono text-sm font-semibold text-foreground">
                            {ticket.ticketCode}
                          </p>
                        </div>
                        <div className="rounded-[22px] border border-border bg-white/82 p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            Booking code
                          </p>
                          <p className="mt-2 font-mono text-sm font-semibold text-foreground">
                            {ticket.bookingCode}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-1">
                        <Link
                          href={`/api/tickets/${ticket.ticketCode}/pdf`}
                          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                        >
                          Download PDF
                        </Link>
                        {ticket.eventSlug ? (
                          <Link
                            href={`/events/${ticket.eventSlug}`}
                            className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-foreground"
                          >
                            View event
                          </Link>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="rounded-[24px] border border-border bg-white/82 p-4">
                        <Image
                          src={ticket.qrCodeDataUrl}
                          alt={`QR code for ${ticket.ticketCode}`}
                          width={180}
                          height={180}
                          unoptimized
                          className="h-[180px] w-[180px] rounded-2xl bg-white p-3 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
