"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readJson } from "@/lib/api";

const selectClassName =
  "flex h-12 w-full rounded-2xl border border-border bg-white/70 px-4 text-sm text-foreground outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus-visible:ring-2 focus-visible:ring-ring";

export function CreatePromoForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "10",
    maxDiscountAmount: "500",
    minimumSubtotal: "1000",
    usageLimit: "100",
    validFrom: "",
    validUntil: "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: form.code,
          description: form.description,
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          maxDiscountAmount: Number(form.maxDiscountAmount),
          minimumSubtotal: Number(form.minimumSubtotal),
          usageLimit: Number(form.usageLimit),
          validFrom: form.validFrom,
          validUntil: form.validUntil,
          isActive: true,
        }),
      });

      const data = await readJson<{ message: string }>(response);
      toast.success(data.message);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create promo code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-white/78">
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-3 md:col-span-2">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
              Create promo code
            </p>
            <h2 className="text-3xl leading-none">Launch a discount rule</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Admin-facing promo creation for discount and checkout demonstrations.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Code</Label>
            <Input value={form.code} onChange={(e) => update("code", e.target.value.toUpperCase())} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => update("description", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <select
              className={selectClassName}
              value={form.discountType}
              onChange={(e) => update("discountType", e.target.value)}
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input type="number" value={form.discountValue} onChange={(e) => update("discountValue", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Max discount</Label>
            <Input type="number" value={form.maxDiscountAmount} onChange={(e) => update("maxDiscountAmount", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Minimum subtotal</Label>
            <Input type="number" value={form.minimumSubtotal} onChange={(e) => update("minimumSubtotal", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Usage limit</Label>
            <Input type="number" value={form.usageLimit} onChange={(e) => update("usageLimit", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Valid from</Label>
            <Input type="datetime-local" value={form.validFrom} onChange={(e) => update("validFrom", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Valid until</Label>
            <Input type="datetime-local" value={form.validUntil} onChange={(e) => update("validUntil", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Button disabled={loading}>{loading ? "Creating..." : "Create promo code"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
