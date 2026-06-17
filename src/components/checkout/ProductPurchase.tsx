"use client";

import { useState } from "react";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import type { Product } from "@/lib/types/database";
import { formatCurrency } from "@/lib/utils/format";

export function ProductPurchase({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const maxQty = Math.min(product.stock_quantity || 1, 10);

  return (
    <div id="checkout" className="flex flex-col gap-6">
      <div className="flex items-center justify-between rounded-2xl border border-zinc-200/60 bg-white p-4">
        <span className="text-sm font-medium text-zinc-700">Quantidade</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-zinc-200 text-lg transition-transform active:scale-[0.98]"
            aria-label="Diminuir quantidade"
          >
            -
          </button>
          <span className="min-w-8 text-center font-mono text-lg">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-zinc-200 text-lg transition-transform active:scale-[0.98]"
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>
      </div>

      <p className="font-mono text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
        {formatCurrency(product.price_cents * quantity)}
      </p>

      <CheckoutForm product={product} quantity={quantity} />
    </div>
  );
}
