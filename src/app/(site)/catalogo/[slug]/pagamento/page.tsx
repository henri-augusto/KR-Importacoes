import Link from "next/link";
import { notFound } from "next/navigation";
import { getPaymentOrderSummary } from "@/app/actions/stripe-checkout";
import { StripeEmbeddedCheckout } from "@/components/checkout/StripeEmbeddedCheckout";
import { PageContainer } from "@/components/layout/PageContainer";
import { getProductBySlug } from "@/lib/data/products";
import { formatCurrency } from "@/lib/utils/format";

export const metadata = {
  title: "Pagamento",
};

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { slug } = await params;
  const { order: orderId } = await searchParams;

  if (!orderId) notFound();

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const summary = await getPaymentOrderSummary(orderId);
  if (!summary) notFound();

  return (
    <PageContainer className="py-8 md:py-14">
      <Link
        href={`/catalogo/${slug}#checkout`}
        className="mb-6 inline-flex min-h-11 items-center text-sm text-zinc-600 hover:text-zinc-900"
      >
        Voltar ao produto
      </Link>

      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Pagamento
        </h1>
        <p className="mt-2 text-base text-zinc-600">
          Finalize com cartão ou PIX sem sair do site.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-200/60 bg-white p-6">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-zinc-500">
            Resumo do pedido
          </h2>
          <p className="mt-3 text-base font-semibold text-zinc-900">
            {summary.productName}
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Cliente: {summary.customerName} · Qtd: {summary.quantity}
          </p>
          <p className="mt-4 font-mono text-xl font-semibold text-zinc-900">
            {formatCurrency(summary.totalCents)}
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-4 md:p-6">
          <StripeEmbeddedCheckout orderId={orderId} />
        </div>
      </div>
    </PageContainer>
  );
}
