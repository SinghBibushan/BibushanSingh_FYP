import { AdminPreviewSection } from "@/components/sections/admin-preview";
import { EventGridSection } from "@/components/sections/event-grid";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { FlowGrid } from "@/components/sections/flow-grid";
import { HeroSection } from "@/components/sections/hero";
import { SiteHeader } from "@/components/layout/site-header";

export default function HomePage() {
  return (
    <div className="pb-12">
      <SiteHeader />
      <main>
        <HeroSection />
        <FeatureGrid />
        <FlowGrid />
        <EventGridSection />
        <AdminPreviewSection />
      </main>
    </div>
  );
}
