import { CreatePromoForm } from "@/components/admin/create-promo-form";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { adminNavItems } from "@/lib/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { listAdminPromoCodes } from "@/server/admin/service";

export default async function AdminPromoCodesPage() {
  await requireAdmin();
  const promoCodes = await listAdminPromoCodes();

  return (
    <AppShell
      badge="Admin promos"
      title="Promo code management"
      description="Create and inspect promotional discount rules used by the checkout engine."
      navItems={adminNavItems}
      currentPath="/admin/promo-codes"
    >
      <div className="space-y-5">
        <CreatePromoForm />
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-3xl leading-none">Existing promo codes</h2>
            <div className="space-y-3">
              {promoCodes.map((promo) => (
                <div
                  key={promo.id}
                  className="grid gap-3 rounded-2xl bg-muted p-4 md:grid-cols-[1fr_0.8fr_0.7fr_0.7fr]"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{promo.code}</p>
                      <Badge>{promo.discountType}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{promo.description}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold">{promo.discountValue}</p>
                    <p className="text-muted-foreground">Min subtotal: {promo.minimumSubtotal}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Used {promo.usedCount}</p>
                    <p>Limit {promo.usageLimit}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{new Date(promo.validUntil).toLocaleDateString()}</p>
                    <p>{promo.isActive ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
