"use client";

import Link from "next/link";
import { deleteProduct } from "@/app/actions/products";
import type { Product } from "@/lib/types/database";
import { formatCurrency } from "@/lib/utils/format";

export function ProductsTable({ products }: { products: Product[] }) {
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
      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200/60 md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50/80">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-600">Produto</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Preco</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Estoque</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-zinc-50">
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
                      onClick={() => deleteProduct(p.id)}
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
        {products.map((p) => (
          <article
            key={p.id}
            className="rounded-2xl border border-zinc-200/60 bg-white p-4"
          >
            <p className="font-medium text-zinc-900">{p.name}</p>
            <p className="text-xs text-zinc-500">{p.brand}</p>
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
                onClick={() => deleteProduct(p.id)}
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
