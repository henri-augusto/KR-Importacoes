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
              KR Imports
            </p>
            <h1 className="text-3xl font-semibold leading-[1.05] tracking-tighter text-zinc-900 md:text-6xl">
              Perfumes importados com identidade e presença.
            </h1>
            <p className="max-w-[65ch] text-base leading-relaxed text-zinc-600">
              Curadoria de fragrâncias originais para quem busca sofisticação.
              Escolha no catálogo e finalize seu pedido direto no WhatsApp.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="#como-funciona"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-rose-900 px-8 text-base font-medium text-white transition-transform active:scale-[0.98] sm:w-auto"
              >
                Como funciona
              </Link>
              <Link
                href="/catalogo"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-base font-medium text-zinc-800 sm:w-auto"
              >
                Acesse o catálogo
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-zinc-200 md:aspect-[3/4]">
            <Image
              src="https://plus.unsplash.com/premium_photo-1679106770086-f4355693be1b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Coleção de perfumes importados"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent" />
            <p className="absolute bottom-6 left-6 right-6 text-sm font-medium text-white/90">
              Entrega combinada após confirmação no WhatsApp
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                Seleção
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
          {display.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center">
              <p className="text-base font-medium text-zinc-900">
                Não há produtos no momento
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                Estamos atualizando o catálogo. Volte em breve.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-8">
              {display.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </PageContainer>
      </section>

      <section
        id="entrega"
        className="border-t border-zinc-200/60 py-16 md:py-24"
      >
        <PageContainer>
          <div className="mb-10 flex flex-col gap-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              Entrega
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
              Entrega grátis na região
            </h2>
            <p className="max-w-[65ch] text-base leading-relaxed text-zinc-600">
              Nas cidades abaixo, a entrega é por nossa conta — sem custo
              adicional após a confirmação do pedido.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
            {[
              "Piracicaba - SP",
              "Rio das Pedras - SP",
              "Saltinho - SP",
            ].map((city) => (
              <li
                key={city}
                className="rounded-2xl border border-zinc-200/70 bg-white px-6 py-5 text-base font-medium text-zinc-900"
              >
                {city}
              </li>
            ))}
          </ul>
        </PageContainer>
      </section>

      <section
        id="como-funciona"
        className="border-t border-zinc-200/60 bg-white py-16 md:py-20"
      >
        <PageContainer>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
                Como funciona a compra
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-600">
                Sem cadastro obrigatório. Compre pelo nosso parceiro STRIPE e combine a entrega pelo nosso WhatsApp.
              </p>
            </div>
            <ol className="flex flex-col gap-6">
              {[
                { step: "01", text: "Escolha o perfume no catálogo" },
                { step: "02", text: "Realize a compra de forma segura na página" },
                { step: "03", text: "Combine a entrega pelo nosso WhatsApp" },
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

      <section
        id="sobre-nos"
        className="border-t border-zinc-200/60 bg-[#faf9f7] py-20 md:py-28"
      >
        <PageContainer>
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-16 lg:gap-20">
            <div
              className="animate-fade-up md:col-span-5 md:col-start-1 md:row-start-1"
              style={{ animationDelay: "80ms" }}
            >
              <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-[#faf9f7] p-6 shadow-[0_24px_60px_-36px_rgba(136,19,55,0.32)] md:-mt-6 md:p-8">
                <Image
                  src="/krservimpor_logomarca.png"
                  alt="Logomarca KR Serviços e Importações"
                  width={640}
                  height={360}
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>

            <div className="flex flex-col gap-8 md:col-span-7 md:col-start-6 md:pt-4">
              <div
                className="animate-fade-up flex flex-col gap-4"
                style={{ animationDelay: "160ms" }}
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-rose-900">
                  Sobre nós
                </p>
                <h2 className="text-3xl font-semibold tracking-tighter text-zinc-950 md:text-5xl">
                  Kaiky Ruslan
                </h2>
                <div className="flex items-center gap-3" aria-hidden="true">
                  <span className="h-px flex-1 max-w-[4.5rem] bg-gradient-to-r from-transparent via-rose-900/30 to-rose-900/60" />
                  <span className="size-1.5 rotate-45 bg-rose-900" />
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent via-zinc-900/20 to-zinc-900/40" />
                </div>
              </div>

              <div
                className="animate-fade-up flex flex-col gap-6"
                style={{ animationDelay: "240ms" }}
              >
                <p className="max-w-[65ch] text-lg leading-relaxed text-zinc-900 md:text-xl">
                  Sou Kaiky Ruslan, e é um prazer receber você por aqui.
                </p>
                <p className="max-w-[65ch] text-base leading-relaxed text-zinc-700">
                  Desde{" "}
                  <span className="font-mono text-sm font-semibold text-rose-900">
                    2025
                  </span>
                  , atuo com curadoria e venda de perfumes importados,
                  selecionando fragrâncias com presença, qualidade e identidade.
                </p>
                <p className="max-w-[65ch] text-base leading-relaxed text-zinc-700">
                  Aqui, apresento as tendências de{" "}
                  <span className="font-semibold text-zinc-950">2026</span> para
                  ajudar você a escolher perfumes que combinam com seu estilo e
                  com cada momento.
                </p>
              </div>

              <p
                className="animate-fade-up text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500"
                style={{ animationDelay: "320ms" }}
              >
                Confiança que gera resultado
              </p>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
