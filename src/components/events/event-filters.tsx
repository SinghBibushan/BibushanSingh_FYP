import Link from "next/link";
import { Filter, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";

const selectClassName =
  "flex h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-ring";

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
  const activeFilters = [
    values.q ? `Search: ${values.q}` : null,
    values.category !== "all" ? values.category : null,
    values.city !== "all" ? values.city : null,
    values.featured === "true" ? "Featured only" : null,
  ].filter(Boolean);

  return (
    <Card className="bg-white/88">
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="info">
                <Filter className="mr-1 h-3 w-3" />
                Filter events
              </StatusBadge>
              {values.featured === "true" ? (
                <StatusBadge tone="warning">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Featured
                </StatusBadge>
              ) : null}
            </div>
            <h2 className="mt-3 text-2xl leading-none">Find the right event faster</h2>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/events">Clear Filters</Link>
          </Button>
        </div>

        {activeFilters.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <StatusBadge key={filter} tone="neutral">
                {filter}
              </StatusBadge>
            ))}
          </div>
        ) : null}

        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.4fr_0.9fr_0.9fr_0.8fr_auto]">
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

          <div className="flex items-end gap-3 md:col-span-2 xl:col-span-1">
            <Button type="submit" className="w-full xl:w-auto">
              Apply Filters
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
