"use client";

import { Funnel } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

const genders = [
  { value: "", label: "Todos" },
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "unissex", label: "Unissex" },
];

export function CatalogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const currentGender = searchParams.get("genero") ?? "";
  const currentSearch = searchParams.get("q") ?? "";
  const [selectedGender, setSelectedGender] = useState(currentGender);
  const [lastGender, setLastGender] = useState(currentGender);

  if (lastGender !== currentGender) {
    setLastGender(currentGender);
    setSelectedGender(currentGender);
  }

  function applyFilters(formData: FormData) {
    const params = new URLSearchParams();
    const q = (formData.get("q") as string)?.trim();
    const genero = formData.get("genero") as string;

    if (q) params.set("q", q);
    if (genero) params.set("genero", genero);

    startTransition(() => {
      router.push(`/catalogo?${params.toString()}`);
      setOpen(false);
    });
  }

  const form = (
    <form action={applyFilters} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="q" className="text-sm font-medium text-zinc-700">
          Buscar
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={currentSearch}
          placeholder="Marca ou perfume..."
          className="min-h-11 rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-900 outline-none focus:border-rose-900/40 focus:ring-2 focus:ring-rose-900/10"
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700">Gênero</span>
        <div className="flex flex-wrap gap-2">
          {genders.map((g) => {
            const isSelected = selectedGender === g.value;

            return (
              <label
                key={g.value}
                className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-colors ${
                  isSelected
                    ? "border-rose-900 bg-rose-900 text-white shadow-sm"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-rose-900/30 hover:bg-rose-50"
                }`}
              >
                <input
                  type="radio"
                  name="genero"
                  value={g.value}
                  checked={isSelected}
                  onChange={() => setSelectedGender(g.value)}
                  className="sr-only"
                />
                {g.label}
              </label>
            );
          })}
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-zinc-900 text-sm font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Aplicando..." : "Aplicar filtros"}
      </button>
    </form>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white text-sm font-medium text-zinc-800 md:hidden"
      >
        <Funnel size={18} weight="bold" />
        Filtros
      </button>

      <div className="hidden md:block md:rounded-2xl md:border md:border-zinc-200/60 md:bg-white md:p-5">
        <p className="mb-4 text-sm font-semibold text-zinc-900">Filtros</p>
        {form}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-zinc-950/50 md:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-[#faf9f7] p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Filtros</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-zinc-500"
              >
                Fechar
              </button>
            </div>
            {form}
          </div>
        </div>
      )}
    </>
  );
}
