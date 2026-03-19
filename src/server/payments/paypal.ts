import { env, isPayPalEnabled } from "@/lib/env";
import { AppError } from "@/lib/errors";

type PayPalAccessTokenResponse = {
  access_token?: string;
};

type PayPalCreateOrderResponse = {
  id?: string;
  status?: string;
};

type PayPalCaptureResponse = {
  id?: string;
  status?: string;
  payer?: {
    payer_id?: string;
    email_address?: string;
  };
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
      }>;
    };
  }>;
};

export type PayPalChargeDetails = {
  bookingAmount: number;
  bookingCurrency: string;
  payableAmount: string;
  payableCurrency: string;
  exchangeRate: number;
};

function getPayPalApiBaseUrl() {
  return env.PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function requirePayPalConfig() {
  if (!isPayPalEnabled || !env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new AppError("PayPal checkout is not configured.", 501, "NOT_IMPLEMENTED");
  }
}

function normalizeCurrency(value: string) {
  return value.trim().toUpperCase();
}

function formatAmount(value: number) {
  return value.toFixed(2);
}

export function getPayPalChargeDetails(input: {
  amount: number;
  currency: string;
}): PayPalChargeDetails {
  const bookingCurrency = normalizeCurrency(input.currency);
  const payableCurrency = normalizeCurrency(env.PAYPAL_CURRENCY);

  if (bookingCurrency === payableCurrency) {
    return {
      bookingAmount: input.amount,
      bookingCurrency,
      payableAmount: formatAmount(input.amount),
      payableCurrency,
      exchangeRate: 1,
    };
  }

  const exchangeRate = Number(env.PAYPAL_EXCHANGE_RATE);

  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    throw new AppError(
      `PayPal currency conversion is required from ${bookingCurrency} to ${payableCurrency}. Set PAYPAL_EXCHANGE_RATE first.`,
      400,
      "PAYPAL_EXCHANGE_RATE_REQUIRED",
    );
  }

  const converted = Number(formatAmount(input.amount * exchangeRate));

  if (converted <= 0) {
    throw new AppError("Converted PayPal amount must be greater than zero.", 400, "INVALID_AMOUNT");
  }

  return {
    bookingAmount: input.amount,
    bookingCurrency,
    payableAmount: formatAmount(converted),
    payableCurrency,
    exchangeRate,
  };
}

async function getAccessToken() {
  requirePayPalConfig();

  const credentials = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(`${getPayPalApiBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AppError("Could not authenticate with PayPal.", 502, "PAYPAL_AUTH_FAILED");
  }

  const data = (await response.json()) as PayPalAccessTokenResponse;

  if (!data.access_token) {
    throw new AppError("PayPal access token was missing.", 502, "PAYPAL_AUTH_FAILED");
  }

  return data.access_token;
}

export async function createPayPalOrder(input: {
  bookingCode: string;
  title: string;
  charge: PayPalChargeDetails;
}) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${getPayPalApiBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: input.bookingCode,
          description: `${input.title} (${input.bookingCode})`,
          amount: {
            currency_code: input.charge.payableCurrency,
            value: input.charge.payableAmount,
          },
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AppError("PayPal order creation failed.", 502, "PAYPAL_ORDER_CREATE_FAILED");
  }

  const data = (await response.json()) as PayPalCreateOrderResponse;

  if (!data.id) {
    throw new AppError("PayPal order response was incomplete.", 502, "PAYPAL_ORDER_CREATE_FAILED");
  }

  return {
    orderId: data.id,
    status: data.status ?? "CREATED",
  };
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${getPayPalApiBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new AppError("PayPal payment capture failed.", 502, "PAYPAL_CAPTURE_FAILED");
  }

  const data = (await response.json()) as PayPalCaptureResponse;
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];

  if (data.status !== "COMPLETED" || !capture?.id) {
    throw new AppError("PayPal payment was not completed.", 400, "PAYPAL_CAPTURE_INCOMPLETE");
  }

  return {
    orderId: data.id ?? orderId,
    orderStatus: data.status,
    captureId: capture.id,
    captureStatus: capture.status ?? "COMPLETED",
    payerId: data.payer?.payer_id ?? "",
    payerEmail: data.payer?.email_address ?? "",
  };
}
