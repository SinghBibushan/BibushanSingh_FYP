import type {
  BOOKING_STATUSES,
  EVENT_STATUSES,
  LOYALTY_TIERS,
  PAYMENT_STATUSES,
  STUDENT_VERIFICATION_STATUSES,
  TICKET_STATUSES,
  USER_ROLES,
} from "@/lib/constants";

export type UserRole = (typeof USER_ROLES)[number];
export type LoyaltyTier = (typeof LOYALTY_TIERS)[number];
export type EventStatus = (typeof EVENT_STATUSES)[number];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type StudentVerificationStatus =
  (typeof STUDENT_VERIFICATION_STATUSES)[number];
