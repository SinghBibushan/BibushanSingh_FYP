import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const cards = [
  {
    title: "Loyalty tier",
    value: "Bronze",
    note: "Silver and Gold thresholds will update automatically from booking history.",
  },
  {
    title: "Points balance",
    value: "480",
    note: "Redeemable during checkout with a capped maximum discount.",
  },
  {
    title: "Upcoming tickets",
    value: "3",
    note: "QR and PDF delivery will surface in the tickets phase.",
  },
];

export default function DashboardPage() {
  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell space-y-8 py-14">
        <div className="space-y-3">
          <Badge>User workspace</Badge>
          <h1 className="text-5xl leading-none">Customer dashboard scaffold</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            This area will hold profile controls, notification preferences,
            verification status, loyalty analytics, and booking shortcuts.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.title}>
              <CardContent className="space-y-4 p-6">
                <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-4xl leading-none">{card.value}</p>
                <p className="text-sm leading-7 text-muted-foreground">{card.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
