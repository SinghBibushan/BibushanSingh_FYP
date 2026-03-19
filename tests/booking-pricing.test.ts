import assert from "node:assert/strict";
import test from "node:test";

import { AppError } from "../src/lib/errors";
import {
  buildValidatedSelections,
  type QuoteTicket,
} from "../src/server/bookings/pricing";

const baseTicket: QuoteTicket = {
  id: "ticket-1",
  name: "VIP Pass",
  price: 2500,
  quantityRemaining: 5,
  perUserLimit: 2,
  saleStartsAt: "2026-03-01T00:00:00.000Z",
  saleEndsAt: "2026-03-30T00:00:00.000Z",
};

test("builds validated selections with computed line totals", () => {
  const result = buildValidatedSelections(
    [baseTicket],
    [{ ticketTypeId: "ticket-1", quantity: 2 }],
    Date.parse("2026-03-15T00:00:00.000Z"),
  );

  assert.deepEqual(result, [
    {
      ticketTypeId: "ticket-1",
      name: "VIP Pass",
      unitPrice: 2500,
      quantity: 2,
      lineTotal: 5000,
    },
  ]);
});

test("rejects selections above the per-user limit", () => {
  assert.throws(
    () =>
      buildValidatedSelections(
        [baseTicket],
        [{ ticketTypeId: "ticket-1", quantity: 3 }],
        Date.parse("2026-03-15T00:00:00.000Z"),
      ),
    (error: unknown) =>
      error instanceof AppError && error.code === "PER_USER_LIMIT_EXCEEDED",
  );
});

test("rejects selections before sales open", () => {
  assert.throws(
    () =>
      buildValidatedSelections(
        [baseTicket],
        [{ ticketTypeId: "ticket-1", quantity: 1 }],
        Date.parse("2026-02-15T00:00:00.000Z"),
      ),
    (error: unknown) =>
      error instanceof AppError && error.code === "SALE_NOT_STARTED",
  );
});

test("rejects selections after sales close", () => {
  assert.throws(
    () =>
      buildValidatedSelections(
        [baseTicket],
        [{ ticketTypeId: "ticket-1", quantity: 1 }],
        Date.parse("2026-04-15T00:00:00.000Z"),
      ),
    (error: unknown) =>
      error instanceof AppError && error.code === "SALE_ENDED",
  );
});

test("rejects empty selections", () => {
  assert.throws(
    () =>
      buildValidatedSelections(
        [baseTicket],
        [{ ticketTypeId: "ticket-1", quantity: 0 }],
        Date.parse("2026-03-15T00:00:00.000Z"),
      ),
    (error: unknown) => error instanceof AppError && error.code === "EMPTY_SELECTION",
  );
});
