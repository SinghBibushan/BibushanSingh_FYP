import Link from "next/link";

const footerGroups = [
  {
    title: "Platform",
    links: [
      { href: "/events", label: "Events" },
      { href: "/register", label: "Get Started" },
      { href: "/login", label: "Log In" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/bookings", label: "Bookings" },
      { href: "/tickets", label: "Tickets" },
    ],
  },
  {
    title: "Operations",
    links: [
      { href: "/admin", label: "Admin" },
      { href: "/organizer", label: "Organizer" },
      { href: "/staff", label: "Staff" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-white/80">
      <div className="container-shell grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="space-y-4">
          <div>
            <p className="text-xl font-semibold text-foreground">EventEase</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              A curated event discovery and ticketing platform built for Nepal, with
              role-based operations for attendees, organizers, staff, and administrators.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Final Year Project Submission
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {group.title}
              </p>
              <div className="space-y-2">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm font-medium text-foreground/80 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
