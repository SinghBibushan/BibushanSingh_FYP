import { z } from "zod";

export const bookingSelectionSchema = z.object({
  ticketTypeId: z.string().min(1),
  quantity: z.number().int().min(0).max(10),
});

export const bookingQuoteSchema = z.object({
  eventSlug: z.string().min(1),
  selections: z.array(bookingSelectionSchema).min(1),
  promoCode: z.string().trim().optional().or(z.literal("")),
  useStudentDiscount: z.boolean().default(false),
  loyaltyPointsToRedeem: z.number().int().min(0).default(0),
});

export const createBookingSchema = bookingQuoteSchema;

export const mockPaymentConfirmSchema = z.object({
  bookingCode: z.string().min(1),
  outcome: z.enum(["success", "failed"]),
});

export type BookingQuoteInput = z.infer<typeof bookingQuoteSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type MockPaymentConfirmInput = z.infer<typeof mockPaymentConfirmSchema>;
