"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteProduct, reorderProduct } from "@/app/actions/products";
import type { Product } from "@/lib/types/database";
import { formatCurrency } from "@/lib/utils/format";

type ReorderDirection = "up" | "down";

export function ProductsTable({ products }: { products: Product[] }) {
  const [error, setError] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  async function handleDeleteProduct(id: string) {
    setError(null);

    try {
      const result = await deleteProduct(id);
      if (!result.ok) {
        setError(result.error ?? "Não foi possível excluir o produto.");
      }
    } catch (error) {
      console.error("[products] deleteProduct", error);
      setError("Não foi possível excluir o produto. Tente novamente.");
    }
  }

  async function handleReorder(productId: string, direction: ReorderDirection) {
    setError(null);
    setReorderingId(productId);

    try {
      const result = await reorderProduct(productId, direction);
      if (!result.ok) {
        setError(result.error ?? "Não foi possível reordenar o produto.");
      }
    } catch (error) {
      console.error("[products] reorderProduct", error);
      setError("Não foi possível reordenar o produto. Tente novamente.");
    } finally {
      setReorderingId(null);
    }
  }

  function renderOrderControls(
    product: Product,
    index: number,
    className = "",
  ) {
    const isFirst = index === 0;
    const isLast = index === products.length - 1;
    const isBusy = reorderingId === product.id;

    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <button
          type="button"
          disabled={isFirst || isBusy}
          onClick={() => void handleReorder(product.id, "up")}
          className="inline-flex size-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Subir ${product.name}`}
        >
          ↑
        </button>
        <button
          type="button"
          disabled={isLast || isBusy}
          onClick={() => void handleReorder(product.id, "down")}
          className="inline-flex size-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Descer ${product.name}`}
        >
          ↓
        </button>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 p-10 text-center">
        <p className="mb-4 text-sm text-zinc-600">Nenhum produto cadastrado.</p>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex min-h-11 items-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white"
        >
          Cadastrar primeiro produto
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200/60 md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50/80">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-600">Ordem</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Produto</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Preço</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Estoque</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, index) => (
              <tr key={p.id} className="border-b border-zinc-50">
                <td className="px-4 py-3">
                  {renderOrderControls(p, index)}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.brand}</p>
                </td>
                <td className="px-4 py-3 font-mono">{formatCurrency(p.price_cents)}</td>
                <td className="px-4 py-3 font-mono">{p.stock_quantity}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      p.is_active
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {p.is_active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/produtos/${p.id}/editar`}
                      className="text-zinc-700 hover:text-zinc-900"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDeleteProduct(p.id)}
                      className="text-red-700 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {products.map((p, index) => (
          <article
            key={p.id}
            className="rounded-2xl border border-zinc-200/60 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-zinc-900">{p.name}</p>
                <p className="text-xs text-zinc-500">{p.brand}</p>
              </div>
              {renderOrderControls(p, index)}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-sm font-semibold">
                {formatCurrency(p.price_cents)}
              </span>
              <span className="font-mono text-xs text-zinc-500">
                Estoque: {p.stock_quantity}
              </span>
            </div>
            <div className="mt-4 flex gap-3">
              <Link
                href={`/admin/produtos/${p.id}/editar`}
                className="min-h-10 flex-1 rounded-full border border-zinc-200 text-center text-sm leading-10"
              >
                Editar
              </Link>
              <button
                type="button"
                onClick={() => void handleDeleteProduct(p.id)}
                className="min-h-10 flex-1 rounded-full border border-red-200 text-center text-sm text-red-700 leading-10"
              >
                Excluir
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
