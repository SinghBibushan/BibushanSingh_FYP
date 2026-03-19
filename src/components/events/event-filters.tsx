import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClassName =
  "flex h-12 w-full rounded-2xl border border-border bg-white/70 px-4 text-sm text-foreground outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus-visible:ring-2 focus-visible:ring-ring";

export function EventFilters({
  categories,
  cities,
  values,
}: {
  categories: string[];
  cities: string[];
  values: {
    q: string;
    category: string;
    city: string;
    featured: string;
  };
}) {
  return (
    <Card className="bg-white/76">
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
              Browse filters
            </p>
            <h2 className="mt-2 text-2xl leading-none">Refine the catalogue quickly</h2>
          </div>
          <Link href="/events" className="text-sm font-semibold text-primary">
            Clear all filters
          </Link>
        </div>

        <form className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr_0.9fr_0.7fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="q">Search events</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="q"
                name="q"
                defaultValue={values.q}
                placeholder="Search by title, city, category, or tag"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select id="category" name="category" defaultValue={values.category} className={selectClassName}>
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <select id="city" name="city" defaultValue={values.city} className={selectClassName}>
              <option value="all">All cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="featured">Featured</Label>
            <select
              id="featured"
              name="featured"
              defaultValue={values.featured}
              className={selectClassName}
            >
              <option value="all">All events</option>
              <option value="true">Featured only</option>
            </select>
          </div>

          <div className="flex items-end gap-3">
            <Button type="submit" className="w-full lg:w-auto">
              Apply
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
