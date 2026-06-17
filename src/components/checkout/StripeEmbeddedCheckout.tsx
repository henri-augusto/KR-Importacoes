"use client";

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { useCallback } from "react";
import { getCheckoutClientSecret } from "@/app/actions/stripe-checkout";
import { stripePromise } from "@/lib/stripe/client";

export function StripeEmbeddedCheckout({ orderId }: { orderId: string }) {
  const fetchClientSecret = useCallback(
    () => getCheckoutClientSecret(orderId),
    [orderId],
  );

  if (!stripePromise) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
        Pagamento online indisponível. Verifique a configuração do Stripe.
      </p>
    );
  }

  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{ fetchClientSecret }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
