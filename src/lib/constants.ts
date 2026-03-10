export const USER_ROLES = ["USER", "ADMIN"] as const;
export const LOYALTY_TIERS = ["BRONZE", "SILVER", "GOLD"] as const;
export const EVENT_STATUSES = ["DRAFT", "PUBLISHED", "CANCELLED"] as const;
export const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "EXPIRED",
] as const;
export const PAYMENT_STATUSES = [
  "INITIATED",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
] as const;
export const TICKET_STATUSES = ["ACTIVE", "USED", "CANCELLED"] as const;
export const STUDENT_VERIFICATION_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;

export const LOYALTY_TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 1500,
  GOLD: 4000,
} as const;

export const DISCOUNT_RULES = {
  studentPercentage: 10,
  groupThreshold: 4,
  groupPercentage: 12,
  maxLoyaltyRedemptionPercentage: 20,
  pointsPerCurrencyUnit: 0.1,
  loyaltyRedemptionValuePerPoint: 1,
} as const;

export const SESSION_COOKIE_NAME = "eventease_session";
