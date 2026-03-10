import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional().default(""),
  avatarUrl: z.string().trim().optional().default(""),
  notificationPreferences: z.object({
    emailBookings: z.boolean().default(true),
    emailReminders: z.boolean().default(true),
    marketingOptIn: z.boolean().default(false),
  }),
});

export const adminUserUpdateSchema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  loyaltyPoints: z.number().int().min(0).optional(),
  studentVerificationStatus: z
    .enum(["PENDING", "APPROVED", "REJECTED"])
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
