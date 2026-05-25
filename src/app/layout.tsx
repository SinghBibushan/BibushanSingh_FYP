import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: {
    default: "EventEase",
    template: "%s | EventEase",
  },
  description:
    "A polished event discovery and ticket booking platform built for Nepal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        {children}
        <SiteFooter />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
