"use client";

import { useActionState } from "react";
import { upsertProduct, type ProductFormState } from "@/app/actions/products";
import type { Product } from "@/lib/types/database";

const initial: ProductFormState = { ok: false };

export function ProductForm({ product }: { product?: Product }) {
  const [state, formAction, pending] = useActionState(upsertProduct, initial);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <Field label="Nome" name="name" defaultValue={product?.name} required />
      <Field label="Marca" name="brand" defaultValue={product?.brand} required />
      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="text-sm font-medium text-zinc-700">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className="min-h-24 rounded-xl border border-zinc-200 px-4 py-3 text-base outline-none focus:border-zinc-400"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="gender" className="text-sm font-medium text-zinc-700">
          Gênero
        </label>
        <select
          id="gender"
          name="gender"
          defaultValue={product?.gender ?? ""}
          className="min-h-12 rounded-xl border border-zinc-200 px-4 text-base"
        >
          <option value="">—</option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="unissex">Unissex</option>
        </select>
      </div>
      <Field label="Família olfativa" name="family" defaultValue={product?.family ?? ""} />
      <Field
        label="Volume (ml)"
        name="volume_ml"
        type="number"
        defaultValue={product?.volume_ml?.toString() ?? ""}
      />
      <Field
        label="Preço (centavos)"
        name="price_cents"
        type="number"
        defaultValue={product?.price_cents?.toString() ?? ""}
        required
      />
      <Field
        label="Preço comparativo (centavos)"
        name="compare_at_price_cents"
        type="number"
        defaultValue={product?.compare_at_price_cents?.toString() ?? ""}
      />
      <Field
        label="Estoque"
        name="stock_quantity"
        type="number"
        defaultValue={product?.stock_quantity?.toString() ?? "0"}
        required
      />
      <Field
        label="URL da imagem"
        name="image_url"
        type="url"
        defaultValue={product?.image_url ?? ""}
      />

      <label className="flex min-h-11 items-center gap-3">
        <input
          type="checkbox"
          name="is_featured"
          defaultChecked={product?.is_featured}
          className="h-5 w-5 rounded border-zinc-300"
        />
        <span className="text-sm text-zinc-700">Destaque</span>
      </label>
      <label className="flex min-h-11 items-center gap-3">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={product?.is_active ?? true}
          className="h-5 w-5 rounded border-zinc-300"
        />
        <span className="text-sm text-zinc-700">Ativo</span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Salvando..." : product ? "Atualizar" : "Cadastrar"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="min-h-12 rounded-xl border border-zinc-200 px-4 text-base outline-none focus:border-zinc-400"
      />
    </div>
  );
}
