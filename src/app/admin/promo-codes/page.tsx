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
  const activeCount = promoCodes.filter((promo) => promo.isActive).length;

  return (
    <AppShell
      badge="Admin promos"
      title="Promo code management"
      description="Create and review discount rules with the same cleaner operational presentation as the rest of admin."
      navItems={adminNavItems}
      currentPath="/admin/promo-codes"
    >
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Total promo codes
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">
                {promoCodes.length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Active promo codes
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">
                {activeCount}
              </p>
            </CardContent>
          </Card>
        </div>

        <CreatePromoForm />

        <Card className="bg-white/78">
          <CardContent className="space-y-4">
            <h2 className="text-3xl leading-none">Existing promo codes</h2>
            <div className="space-y-3">
              {promoCodes.map((promo) => (
                <div
                  key={promo.id}
                  className="grid gap-4 rounded-[24px] border border-border bg-white/82 p-4 md:grid-cols-[1fr_0.85fr_0.75fr_0.8fr]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-foreground">{promo.code}</p>
                      <Badge>{promo.discountType}</Badge>
                      <Badge
                        className={
                          promo.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""
                        }
                      >
                        {promo.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{promo.description}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">{promo.discountValue}</p>
                    <p className="text-muted-foreground">
                      Min subtotal: {promo.minimumSubtotal}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Used {promo.usedCount}</p>
                    <p>Limit {promo.usageLimit}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{new Date(promo.validUntil).toLocaleDateString()}</p>
                    <p>Expires on the listed date</p>
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
