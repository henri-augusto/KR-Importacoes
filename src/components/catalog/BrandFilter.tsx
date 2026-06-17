"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface BrandFilterProps {
  brands: string[];
}

export function BrandFilter({ brands }: BrandFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const currentBrand = searchParams.get("marca") ?? "";

  function selectBrand(brand: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (brand) {
      params.set("marca", brand);
    } else {
      params.delete("marca");
    }
    startTransition(() => {
      router.push(`/catalogo?${params.toString()}`);
    });
  }

  const items = [{ value: "", label: "Todas as marcas" }, ...brands.map((b) => ({ value: b, label: b }))];

  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const isActive = currentBrand === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => selectBrand(item.value)}
              disabled={pending}
              className={`inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                isActive
                  ? "border-rose-900 bg-rose-900 text-white shadow-sm"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-rose-900/30 hover:bg-rose-50 active:scale-[0.97]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#faf9f7] to-transparent md:hidden" />
    </div>
  );
}
