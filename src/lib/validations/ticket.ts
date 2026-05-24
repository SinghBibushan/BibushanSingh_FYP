import { z } from "zod";

export const ticketCheckInSchema = z.object({
  scanInput: z.string().trim().min(1, "Paste a QR payload or ticket code."),
  gate: z.string().trim().max(50).default(""),
});

export type TicketCheckInInput = z.infer<typeof ticketCheckInSchema>;
