import { QrCode, ReceiptText } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const ticketStates = [
  {
    title: "QR-backed entry",
    description: "Each issued ticket will store a unique QR payload and ticket code.",
    icon: QrCode,
  },
  {
    title: "PDF downloads",
    description: "Users will be able to download printable ticket PDFs after payment confirmation.",
    icon: ReceiptText,
  },
];

export default function TicketsPage() {
  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell space-y-8 py-14">
        <div className="space-y-3">
          <Badge>My tickets</Badge>
          <h1 className="text-5xl leading-none">Ticket vault scaffold</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            The ticket issuance, QR, and PDF workflow will be connected after mock
            payment and booking confirmation are implemented.
          </p>
        </div>
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
      </main>
    </div>
  );
}
