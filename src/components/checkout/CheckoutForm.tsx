"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { lookupCustomerByPhone } from "@/app/actions/orders";
import {
  createStripeCheckout,
  type StripeCheckoutState,
} from "@/app/actions/stripe-checkout";
import type { Product } from "@/lib/types/database";
import { formatCurrency } from "@/lib/utils/format";
import {
  formatPhoneDisplay,
  isValidBrazilianPhone,
  normalizePhone,
} from "@/lib/utils/phone";

const initialState: StripeCheckoutState = { ok: false };

type LookupStatus = "idle" | "loading" | "found" | "not_found";

export function CheckoutForm({
  product,
  quantity,
}: {
  product: Product;
  quantity: number;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createStripeCheckout,
    initialState,
  );

  const [phone, setPhone] = useState("");
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerState, setCustomerState] = useState("");

  const lastLookupPhone = useRef<string | null>(null);
  const redirected = useRef(false);

  const normalizedPhone = normalizePhone(phone);
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneReady = isValidBrazilianPhone(normalizedPhone);
  const phoneError =
    phoneDigits.length >= 8 && !phoneReady
      ? "Informe um telefone válido (10 ou 11 dígitos)"
      : null;

  useEffect(() => {
    if (!phoneReady) return;

    if (lastLookupPhone.current === normalizedPhone) {
      return;
    }

    let ignore = false;

    const timeout = setTimeout(async () => {
      setLookupStatus("loading");
      try {
        const result = await lookupCustomerByPhone(normalizedPhone);
        if (ignore) return;

        lastLookupPhone.current = normalizedPhone;

        if (result.found && result.customer) {
          setCustomerName(result.customer.name);
          setCustomerEmail(result.customer.email ?? "");
          setCustomerCity(result.customer.city ?? "");
          setCustomerState(result.customer.state ?? "");
          setLookupStatus("found");
        } else {
          setLookupStatus("not_found");
        }
      } catch (error) {
        console.error("[checkout] lookupCustomerByPhone", error);
        if (!ignore) {
          setLookupStatus("not_found");
        }
      }
    }, 450);

    return () => {
      ignore = true;
      clearTimeout(timeout);
    };
  }, [phone, phoneReady, normalizedPhone]);

  useEffect(() => {
    if (
      state.ok &&
      state.orderId &&
      state.productSlug &&
      !redirected.current
    ) {
      redirected.current = true;
      router.push(
        `/catalogo/${state.productSlug}/pagamento?order=${state.orderId}`,
      );
    }
  }, [state, router]);

  const total = product.price_cents * quantity;
  const showLookupHint = phoneReady && lookupStatus !== "loading";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="productSlug" value={product.slug} />
      <input type="hidden" name="productName" value={product.name} />
      <input type="hidden" name="productBrand" value={product.brand} />
      <input type="hidden" name="unitPriceCents" value={product.price_cents} />
      <input type="hidden" name="quantity" value={quantity} />
      <input
        type="hidden"
        name="customerPhone"
        value={phoneReady ? normalizedPhone : ""}
      />

      <div className="flex flex-col gap-2">
        <label
          htmlFor="customerPhone"
          className="text-sm font-medium text-zinc-700"
        >
          WhatsApp / Telefone
        </label>
        <input
          id="customerPhone"
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          placeholder="(11) 98765-4321"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            lastLookupPhone.current = null;
            if (!isValidBrazilianPhone(normalizePhone(e.target.value))) {
              setLookupStatus("idle");
            }
          }}
          aria-invalid={phoneError ? true : undefined}
          aria-describedby={phoneError ? "customerPhone-error" : undefined}
          className={`min-h-12 rounded-xl border bg-white px-4 text-base outline-none focus:ring-2 ${
            phoneError
              ? "border-red-300 focus:border-red-400 focus:ring-red-900/10"
              : "border-zinc-200 focus:border-rose-900/40 focus:ring-rose-900/10"
          }`}
        />
        {phoneError && (
          <p id="customerPhone-error" className="text-sm text-red-700">
            {phoneError}
          </p>
        )}
        {lookupStatus === "loading" && (
          <p className="text-sm text-zinc-500">Verificando cadastro...</p>
        )}
        {lookupStatus === "found" && (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Cliente encontrado — dados preenchidos automaticamente.
          </p>
        )}
        {lookupStatus === "not_found" && showLookupHint && (
          <p className="text-sm text-zinc-500">
            Primeira compra? Preencha seus dados abaixo.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="customerName" className="text-sm font-medium text-zinc-700">
          Nome completo
        </label>
        <input
          id="customerName"
          name="customerName"
          required
          autoComplete="name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="min-h-12 rounded-xl border border-zinc-200 bg-white px-4 text-base outline-none focus:border-rose-900/40 focus:ring-2 focus:ring-rose-900/10"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="customerEmail" className="text-sm font-medium text-zinc-700">
          E-mail
        </label>
        <input
          id="customerEmail"
          name="customerEmail"
          type="email"
          inputMode="email"
          required
          autoComplete="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          className="min-h-12 rounded-xl border border-zinc-200 bg-white px-4 text-base outline-none focus:border-rose-900/40 focus:ring-2 focus:ring-rose-900/10"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="customerCity" className="text-sm font-medium text-zinc-700">
            Cidade
          </label>
          <input
            id="customerCity"
            name="customerCity"
            value={customerCity}
            onChange={(e) => setCustomerCity(e.target.value)}
            className="min-h-12 rounded-xl border border-zinc-200 bg-white px-4 text-base outline-none focus:border-rose-900/40 focus:ring-2 focus:ring-rose-900/10"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="customerState" className="text-sm font-medium text-zinc-700">
            UF
          </label>
          <input
            id="customerState"
            name="customerState"
            maxLength={2}
            placeholder="SP"
            value={customerState}
            onChange={(e) => setCustomerState(e.target.value.toUpperCase())}
            className="min-h-12 rounded-xl border border-zinc-200 bg-white px-4 text-base uppercase outline-none focus:border-rose-900/40 focus:ring-2 focus:ring-rose-900/10"
          />
        </div>
      </div>

      {phoneReady && (
        <p className="text-xs text-zinc-500">
          Telefone: {formatPhoneDisplay(normalizedPhone)}
        </p>
      )}

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <p className="text-sm text-zinc-600">
        Total:{" "}
        <span className="font-mono font-semibold text-zinc-900">
          {formatCurrency(total)}
        </span>
      </p>

      <button
        type="submit"
        disabled={pending || !phoneReady}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-rose-900 text-base font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Preparando pagamento..." : "Continuar para pagamento"}
      </button>
    </form>
  );
}
