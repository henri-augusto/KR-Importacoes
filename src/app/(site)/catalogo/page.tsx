import { Suspense } from "react";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductCard } from "@/components/catalog/ProductCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { getActiveProducts } from "@/lib/data/products";

export const metadata = {
  title: "Catálogo",
};

function filterProducts(
  products: Awaited<ReturnType<typeof getActiveProducts>>,
  q?: string,
  genero?: string,
) {
  return products.filter((p) => {
    const matchQ =
      !q ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.brand.toLowerCase().includes(q.toLowerCase());
    const matchGender = !genero || p.gender === genero;
    return matchQ && matchGender;
  });
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genero?: string }>;
}) {
  const params = await searchParams;
  const products = await getActiveProducts();
  const filtered = filterProducts(products, params.q, params.genero);
  const hasProducts = products.length > 0;

  return (
    <PageContainer className="py-10 pb-24 md:py-14">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Catálogo
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
          Perfumes importados
        </h1>
        <p className="max-w-lg text-base text-zinc-600">
          {filtered.length}{" "}
          {filtered.length === 1 ? "fragrância disponível" : "fragrâncias disponíveis"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr] md:gap-10">
        <aside>
          <Suspense fallback={<div className="h-32 animate-pulse rounded-2xl bg-zinc-100" />}>
            <CatalogFilters />
          </Suspense>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center">
              <p className="text-base font-medium text-zinc-900">
                {hasProducts
                  ? "Nenhum perfume encontrado"
                  : "Não há produtos no momento"}
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                {hasProducts
                  ? "Tente outros filtros ou volte mais tarde."
                  : "Estamos atualizando o catálogo. Volte em breve."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
