import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "NPR") {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string) {
  if (!date) return "N/A";
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-NP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getTicketSaleWindow(startsAt: Date | string, endsAt?: Date | string) {
  const eventStart = new Date(startsAt);
  const eventEnd = endsAt ? new Date(endsAt) : new Date(eventStart);
  const ninetyDaysMs = 1000 * 60 * 60 * 24 * 90;

  // Keep seeded/demo events bookable well ahead of time so the viva flow is reliable.
  const saleStartsAt = new Date(eventStart.getTime() - ninetyDaysMs);
  const saleEndsAt = new Date(eventEnd);

  return {
    saleStartsAt,
    saleEndsAt,
  };
}
