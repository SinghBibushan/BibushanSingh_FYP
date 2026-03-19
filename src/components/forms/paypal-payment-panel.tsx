"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { readJson } from "@/lib/api";

type PayPalButtonsInstance = {
  close?: () => Promise<void>;
  render: (container: HTMLElement) => Promise<void>;
};

type PayPalNamespace = {
  Buttons: (options: {
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onCancel?: () => void;
    onError?: (error: unknown) => void;
    style?: {
      color?: "gold";
      label?: "pay";
      layout?: "vertical";
      shape?: "pill";
    };
  }) => PayPalButtonsInstance;
};

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

export function PayPalPaymentPanel({
  bookingCode,
  currency,
  disabled,
}: {
  bookingCode: string;
  currency: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const containerId = useId().replace(/:/g, "");
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!clientId || disabled) {
      return;
    }

    const container = document.getElementById(containerId);

    if (!container) {
      return;
    }

    let buttons: PayPalButtonsInstance | null = null;
    let cancelled = false;

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[data-paypal-sdk="true"][data-currency="${currency}"]`,
    );

    const renderButtons = async () => {
      if (!window.paypal || cancelled) {
        return;
      }

      container.innerHTML = "";

      buttons = window.paypal.Buttons({
        style: {
          color: "gold",
          label: "pay",
          layout: "vertical",
          shape: "pill",
        },
        createOrder: async () => {
          const response = await fetch("/api/payments/paypal/order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ bookingCode }),
          });

          const data = await readJson<{ orderId: string }>(response);
          return data.orderId;
        },
        onApprove: async (data) => {
          const response = await fetch("/api/payments/paypal/capture", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookingCode,
              orderId: data.orderID,
            }),
          });

          const result = await readJson<{ message: string }>(response);
          toast.success(result.message);
          router.refresh();
        },
        onCancel: () => {
          toast.message("PayPal checkout was cancelled.");
        },
        onError: (error) => {
          const message = error instanceof Error ? error.message : "PayPal checkout failed.";
          toast.error(message);
        },
      });

      await buttons.render(container);
      setReady(true);
    };

    const handleLoad = () => {
      void renderButtons();
    };

    if (existingScript) {
      if (window.paypal) {
        void renderButtons();
      } else {
        existingScript.addEventListener("load", handleLoad, { once: true });
      }
    } else {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture`;
      script.async = true;
      script.defer = true;
      script.dataset.paypalSdk = "true";
      script.dataset.currency = currency;
      script.addEventListener("load", handleLoad, { once: true });
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      setReady(false);
      container.innerHTML = "";
      void buttons?.close?.();
    };
  }, [bookingCode, clientId, containerId, currency, disabled, router]);

  if (disabled) {
    return (
      <p className="text-sm text-muted-foreground">
        This booking is already confirmed.
      </p>
    );
  }

  if (!clientId) {
    return (
      <p className="text-sm text-muted-foreground">
        PayPal client configuration is missing.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div id={containerId} className="min-h-12" />
      {!ready ? (
        <p className="text-xs text-muted-foreground">Loading PayPal checkout...</p>
      ) : null}
    </div>
  );
}
