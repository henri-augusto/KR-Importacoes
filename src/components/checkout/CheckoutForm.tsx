"use client";

import { useActionState, useEffect } from "react";
import {
  createWhatsAppOrder,
  type CheckoutState,
} from "@/app/actions/orders";
import type { Product } from "@/lib/types/database";
import { formatCurrency } from "@/lib/utils/format";

const initialState: CheckoutState = { ok: false };

export function CheckoutForm({
  product,
  quantity,
}: {
  product: Product;
  quantity: number;
}) {
  const [state, formAction, pending] = useActionState(
    createWhatsAppOrder,
    initialState,
  );

  useEffect(() => {
    if (state.ok && state.whatsappUrl) {
      window.open(state.whatsappUrl, "_blank", "noopener,noreferrer");
    }
  }, [state]);

  const total = product.price_cents * quantity;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="productSlug" value={product.slug} />
      <input type="hidden" name="productName" value={product.name} />
      <input type="hidden" name="productBrand" value={product.brand} />
      <input type="hidden" name="unitPriceCents" value={product.price_cents} />
      <input type="hidden" name="quantity" value={quantity} />

      <div className="flex flex-col gap-2">
        <label htmlFor="customerName" className="text-sm font-medium text-zinc-700">
          Nome completo
        </label>
        <input
          id="customerName"
          name="customerName"
          required
          autoComplete="name"
          className="min-h-12 rounded-xl border border-zinc-200 bg-white px-4 text-base outline-none focus:border-rose-900/40 focus:ring-2 focus:ring-rose-900/10"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="customerPhone" className="text-sm font-medium text-zinc-700">
          WhatsApp / Telefone
        </label>
        <input
          id="customerPhone"
          name="customerPhone"
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          placeholder="(11) 98765-4321"
          className="min-h-12 rounded-xl border border-zinc-200 bg-white px-4 text-base outline-none focus:border-rose-900/40 focus:ring-2 focus:ring-rose-900/10"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="customerEmail" className="text-sm font-medium text-zinc-700">
          E-mail (opcional)
        </label>
        <input
          id="customerEmail"
          name="customerEmail"
          type="email"
          inputMode="email"
          autoComplete="email"
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
            className="min-h-12 rounded-xl border border-zinc-200 bg-white px-4 text-base uppercase outline-none focus:border-rose-900/40 focus:ring-2 focus:ring-rose-900/10"
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <p className="text-sm text-zinc-600">
        Total: <span className="font-mono font-semibold text-zinc-900">{formatCurrency(total)}</span>
      </p>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-rose-900 text-base font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Registrando..." : "Finalizar no WhatsApp"}
      </button>
    </form>
  );
}
