import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types/database";
import { formatCurrency } from "@/lib/utils/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/60 bg-white transition-transform active:scale-[0.99] md:rounded-3xl">
      <Link href={`/catalogo/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-zinc-100 md:aspect-[3/4]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={`${product.brand} ${product.name}`}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            Sem imagem
          </div>
        )}
        {product.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-rose-900 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
            Destaque
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3 md:p-5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 md:text-[11px]">
          {product.brand}
        </p>
        <Link href={`/catalogo/${product.slug}`}>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900 md:text-lg">
            {product.name}
          </h3>
        </Link>
        {product.volume_ml && (
          <p className="text-[11px] text-zinc-500 md:text-xs">{product.volume_ml} ml</p>
        )}
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-mono text-base font-semibold text-zinc-900 md:text-lg">
            {formatCurrency(product.price_cents)}
          </span>
          {product.compare_at_price_cents && (
            <span className="font-mono text-xs text-zinc-400 line-through md:text-sm">
              {formatCurrency(product.compare_at_price_cents)}
            </span>
          )}
        </div>
        <Link
          href={`/catalogo/${product.slug}`}
          className="mt-2 inline-flex min-h-10 w-full items-center justify-center rounded-full border border-zinc-200 px-3 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-300 md:min-h-11 md:w-auto md:px-6 md:text-sm"
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}
