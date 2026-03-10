import { z } from "zod";

export const adminTicketTypeSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  price: z.coerce.number().min(0),
  quantityTotal: z.coerce.number().int().min(1),
  perUserLimit: z.coerce.number().int().min(1).max(10).default(6),
});

export const adminEventSchema = z.object({
  title: z.string().trim().min(3),
  summary: z.string().trim().min(10),
  description: z.string().trim().min(20),
  category: z.string().trim().min(2),
  city: z.string().trim().min(2),
  venueName: z.string().trim().min(2),
  venueAddress: z.string().trim().min(5),
  organizerName: z.string().trim().min(2),
  organizerEmail: z.email(),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  tags: z.string().trim().default(""),
  featured: z.coerce.boolean().default(false),
  posterTone: z.string().trim().default("from-[#11213f] via-[#224d61] to-[#d97706]"),
  ticketTypes: z.array(adminTicketTypeSchema).min(1),
});

export const adminPromoCodeSchema = z.object({
  code: z.string().trim().min(3).max(20).transform((value) => value.toUpperCase()),
  description: z.string().trim().min(3),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.coerce.number().min(0),
  maxDiscountAmount: z.coerce.number().min(0).nullable().optional(),
  minimumSubtotal: z.coerce.number().min(0).default(0),
  usageLimit: z.coerce.number().int().min(0).default(0),
  validFrom: z.string().min(1),
  validUntil: z.string().min(1),
  isActive: z.coerce.boolean().default(true),
});

export const studentReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().trim().default(""),
});

export type AdminEventInput = z.infer<typeof adminEventSchema>;
export type AdminPromoCodeInput = z.infer<typeof adminPromoCodeSchema>;
export type StudentReviewInput = z.infer<typeof studentReviewSchema>;
