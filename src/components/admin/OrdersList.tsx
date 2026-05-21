"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/app/actions/products";
import type { Order } from "@/lib/types/database";
import { formatCurrency, formatOrderStatus } from "@/lib/utils/format";

export function OrdersList({ orders }: { orders: Order[] }) {
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(
    orderId: string,
    status: "pending" | "whatsapp_sent" | "confirmed" | "cancelled",
  ) {
    setError(null);

    try {
      const result = await updateOrderStatus(orderId, status);
      if (!result.ok) {
        setError(result.error ?? "Não foi possível atualizar o pedido.");
      }
    } catch (error) {
      console.error("[orders] updateOrderStatus", error);
      setError("Não foi possível atualizar o pedido. Tente novamente.");
    }
  }

  if (!orders.length) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 p-10 text-center">
        <p className="text-sm text-zinc-600">Nenhum pedido registrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {orders.map((order) => (
        <article
          key={order.id}
          className="rounded-2xl border border-zinc-200/60 bg-white p-4 md:p-5"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-mono text-xs text-zinc-500">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="mt-1 text-base font-semibold text-zinc-900">
                {order.customer?.name ?? "Cliente"}
              </p>
              <p className="text-sm text-zinc-600">
                {order.customer?.phone}
                {order.customer?.city && ` · ${order.customer.city}`}
                {order.customer?.state && `/${order.customer.state}`}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="font-mono text-lg font-semibold text-zinc-900">
                {formatCurrency(order.total_cents)}
              </p>
              <p className="text-sm text-zinc-500">
                {formatOrderStatus(order.status)}
              </p>
            </div>
          </div>

          {order.order_items && order.order_items.length > 0 && (
            <ul className="mt-4 divide-y divide-zinc-100 border-t border-zinc-100 pt-3">
              {order.order_items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between py-2 text-sm text-zinc-700"
                >
                  <span>
                    {item.product_name_snapshot} x{item.quantity}
                  </span>
                  <span className="font-mono">
                    {formatCurrency(item.unit_price_cents * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {(["pending", "whatsapp_sent", "confirmed", "cancelled"] as const).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => void handleStatusChange(order.id, status)}
                  className={`min-h-10 rounded-full px-3 text-xs font-medium transition-colors ${
                    order.status === status
                      ? "bg-zinc-900 text-white"
                      : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {formatOrderStatus(status)}
                </button>
              ),
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
