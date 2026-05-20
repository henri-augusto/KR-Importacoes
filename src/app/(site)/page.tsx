import Image from "next/image";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getActiveProducts } from "@/lib/data/products";

export default async function HomePage() {
  const products = await getActiveProducts();
  const featured = products.filter((p) => p.is_featured).slice(0, 3);
  const display = featured.length > 0 ? featured : products.slice(0, 3);

  return (
    <>
      <section className="min-h-[100dvh] border-b border-zinc-200/60">
        <PageContainer className="grid min-h-[100dvh] grid-cols-1 items-center gap-10 py-12 md:grid-cols-2 md:gap-16 md:py-20">
          <div className="flex flex-col gap-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-rose-900">
              KR Servicos e Importacoes
            </p>
            <h1 className="text-3xl font-semibold leading-[1.05] tracking-tighter text-zinc-900 md:text-6xl">
              Perfumes importados com identidade e presenca.
            </h1>
            <p className="max-w-[65ch] text-base leading-relaxed text-zinc-600">
              Curadoria de fragrancias originais para quem busca sofisticacao.
              Escolha no catalogo e finalize seu pedido direto no WhatsApp.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/catalogo"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-rose-900 px-8 text-base font-medium text-white transition-transform active:scale-[0.98] sm:w-auto"
              >
                Explorar catalogo
              </Link>
              <Link
                href="/catalogo"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-base font-medium text-zinc-800 sm:w-auto"
              >
                Comprar pelo WhatsApp
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-zinc-200 md:aspect-[3/4]">
            <Image
              src="https://picsum.photos/seed/kr-hero/800/1000"
              alt="Colecao de perfumes importados"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent" />
            <p className="absolute bottom-6 left-6 right-6 text-sm font-medium text-white/90">
              Entrega combinada apos confirmacao no WhatsApp
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                Selecao
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
                Destaques da semana
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="text-sm font-medium text-rose-900 hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {display.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="border-t border-zinc-200/60 bg-white py-16 md:py-20">
        <PageContainer>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
                Como funciona a compra
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-600">
                Sem cadastro obrigatorio. Voce informa dados basicos, registramos
                o pedido e abrimos o WhatsApp com a mensagem pronta para enviar.
              </p>
            </div>
            <ol className="flex flex-col gap-6">
              {[
                { step: "01", text: "Escolha o perfume no catalogo" },
                { step: "02", text: "Informe nome, telefone e cidade" },
                { step: "03", text: "Finalize no WhatsApp com nossa equipe" },
              ].map((item) => (
                <li
                  key={item.step}
                  className="flex gap-4 border-t border-zinc-100 pt-6 first:border-0 first:pt-0"
                >
                  <span className="font-mono text-sm text-rose-900">{item.step}</span>
                  <span className="text-base text-zinc-800">{item.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
