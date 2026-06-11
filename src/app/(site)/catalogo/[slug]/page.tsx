import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductPurchase } from "@/components/checkout/ProductPurchase";
import { PageContainer } from "@/components/layout/PageContainer";
import { getProductBySlug } from "@/lib/data/products";
import { formatCurrency } from "@/lib/utils/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto" };
  return {
    title: `${product.brand} ${product.name}`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <PageContainer className="py-8 md:py-14">
        <Link
          href="/catalogo"
          className="mb-6 inline-flex min-h-11 items-center text-sm text-zinc-600 hover:text-zinc-900"
        >
          Voltar ao catálogo
        </Link>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-zinc-100">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={`${product.brand} ${product.name}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">
                Sem imagem
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                {product.brand}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
                {product.name}
              </h1>
              {product.volume_ml && (
                <p className="mt-2 text-sm text-zinc-500">{product.volume_ml} ml</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {product.gender && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                  {product.gender}
                </span>
              )}
              {product.family && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                  {product.family}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-base leading-relaxed text-zinc-600">
                {product.description}
              </p>
            )}

            <div className="flex items-baseline gap-3">
              <span className="font-mono text-2xl font-semibold text-zinc-900 md:text-3xl">
                {formatCurrency(product.price_cents)}
              </span>
              {product.compare_at_price_cents && (
                <span className="font-mono text-lg text-zinc-400 line-through">
                  {formatCurrency(product.compare_at_price_cents)}
                </span>
              )}
            </div>

            <div className="hidden md:block">
              <ProductPurchase product={product} />
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-200/60 bg-white p-6 md:hidden">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            Finalizar pedido
          </h2>
          <ProductPurchase product={product} />
        </div>
    </PageContainer>
  );
}
