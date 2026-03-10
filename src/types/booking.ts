export type BookingSelectionInput = {
  ticketTypeId: string;
  quantity: number;
};

export type BookingPriceLine = {
  type: string;
  label: string;
  amount: number;
};

export type BookingQuote = {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  currency: string;
  selections: Array<{
    ticketTypeId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  subtotal: number;
  discounts: BookingPriceLine[];
  totalDiscount: number;
  finalAmount: number;
  promoCode: string | null;
  studentDiscountApplied: boolean;
  groupDiscountApplied: boolean;
  loyaltyPointsRedeemed: number;
  loyaltyPointsEarned: number;
};
