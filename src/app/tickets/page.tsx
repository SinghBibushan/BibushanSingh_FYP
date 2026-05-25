import Image from "next/image";
import Link from "next/link";
import { Ticket as TicketIcon } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth";
import { userNavItems } from "@/lib/user-nav";
import { formatDate } from "@/lib/utils";
import { getCurrentUserTickets } from "@/server/tickets/service";

export default async function TicketsPage() {
  await requireUser();
  const tickets = await getCurrentUserTickets();

  return (
    <AppShell
      badge="My tickets"
      title="Ticket vault"
      description="Confirmed bookings generate QR-backed tickets and downloadable PDFs in a more polished delivery screen."
      navItems={userNavItems}
    >
      {tickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No tickets yet"
          description="Complete a booking and payment to populate this vault with issued tickets."
        />
      ) : (
        <div className="space-y-5">
          <SectionHeader
            badge="Issued Tickets"
            title={`${tickets.length} active ticket${tickets.length === 1 ? "" : "s"}`}
            description="QR-backed tickets are grouped here for quick access during event entry."
          />

          <div className="grid gap-5 lg:grid-cols-2">
            {tickets.map((ticket) => (
              <Card key={ticket.ticketCode} className="overflow-hidden bg-white/90 hover-lift">
                <CardContent>
                  <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge tone="info">
                          {ticket.ticketTypeName}
                        </StatusBadge>
                        <StatusBadge tone={ticket.status === "ACTIVE" ? "success" : "warning"}>
                          {ticket.status}
                        </StatusBadge>
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
                        {ticket.checkedInAt ? (
                          <p className="text-sm font-medium text-emerald-700">
                            Checked in {formatDate(ticket.checkedInAt)}
                            {ticket.checkInGate ? ` at ${ticket.checkInGate}` : ""}
                          </p>
                        ) : null}
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
