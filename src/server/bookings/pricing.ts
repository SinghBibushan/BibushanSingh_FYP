import { AppError } from "../../lib/errors";

export type QuoteTicket = {
  id: string;
  name: string;
  price: number;
  quantityRemaining: number;
  perUserLimit: number;
  saleStartsAt?: string;
  saleEndsAt?: string;
};

export type QuoteSelectionInput = {
  ticketTypeId: string;
  quantity: number;
};

export type ValidatedSelection = {
  ticketTypeId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export function buildValidatedSelections(
  tickets: QuoteTicket[],
  selections: QuoteSelectionInput[],
  currentTime = Date.now(),
) {
  const validatedSelections = selections
    .filter((item) => item.quantity > 0)
    .map((item) => {
      const ticket = tickets.find((type) => type.id === item.ticketTypeId);

      if (!ticket) {
        throw new AppError("Invalid ticket selection.", 400, "INVALID_TICKET");
      }

      if (item.quantity > ticket.quantityRemaining) {
        throw new AppError(
          `Only ${ticket.quantityRemaining} seat(s) remain for ${ticket.name}.`,
          409,
          "INSUFFICIENT_AVAILABILITY",
        );
      }

      if (item.quantity > ticket.perUserLimit) {
        throw new AppError(
          `${ticket.name} is limited to ${ticket.perUserLimit} ticket(s) per booking.`,
          400,
          "PER_USER_LIMIT_EXCEEDED",
        );
      }

      if (ticket.saleStartsAt && new Date(ticket.saleStartsAt).getTime() > currentTime) {
        throw new AppError(`${ticket.name} is not on sale yet.`, 400, "SALE_NOT_STARTED");
      }

      if (ticket.saleEndsAt && new Date(ticket.saleEndsAt).getTime() < currentTime) {
        throw new AppError(`${ticket.name} is no longer on sale.`, 400, "SALE_ENDED");
      }

      return {
        ticketTypeId: ticket.id,
        name: ticket.name,
        unitPrice: ticket.price,
        quantity: item.quantity,
        lineTotal: ticket.price * item.quantity,
      } satisfies ValidatedSelection;
    });

  if (validatedSelections.length === 0) {
    throw new AppError("Select at least one ticket.", 400, "EMPTY_SELECTION");
  }

  return validatedSelections;
}
