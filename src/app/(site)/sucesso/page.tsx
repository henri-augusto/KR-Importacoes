import Link from "next/link";
import { verifyCheckoutSession } from "@/app/actions/stripe-checkout";
import { SuccessWhatsAppButton } from "@/components/checkout/SuccessWhatsAppButton";
import { PageContainer } from "@/components/layout/PageContainer";

export const metadata = {
  title: "Pagamento confirmado",
};

export default async function SucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <PageContainer className="py-16 md:py-24">
        <div className="mx-auto max-w-lg rounded-3xl border border-zinc-200/60 bg-white p-8 text-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] md:p-12">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
            Sessão inválida
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-600">
            Não foi possível verificar seu pagamento. Volte ao catálogo e tente
            novamente.
          </p>
          <div className="mt-8">
            <Link
              href="/catalogo"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-rose-900 px-8 text-base font-medium text-white"
            >
              Voltar ao catálogo
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  const result = await verifyCheckoutSession(sessionId);

  if (!result.ok || !result.whatsappUrl) {
    return (
      <PageContainer className="py-16 md:py-24">
        <div className="mx-auto max-w-lg rounded-3xl border border-zinc-200/60 bg-white p-8 text-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] md:p-12">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
            Pagamento pendente
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-600">
            {result.error ??
              "Seu pagamento ainda está sendo processado. Aguarde alguns instantes e atualize a página."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/catalogo"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-rose-900 px-8 text-base font-medium text-white"
            >
              Voltar ao catálogo
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-16 md:py-24">
      <div className="mx-auto max-w-lg rounded-3xl border border-zinc-200/60 bg-white p-8 text-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] md:p-12">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-700">
          ✓
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Pagamento confirmado!
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-600">
          Abrimos o WhatsApp para você combinar a entrega ou envio do seu
          pedido.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Se a janela não abriu, verifique se o navegador bloqueou pop-ups ou
          use o botão abaixo.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/catalogo"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-rose-900 px-8 text-base font-medium text-white transition-transform active:scale-[0.98]"
          >
            Voltar ao catálogo
          </Link>
          <SuccessWhatsAppButton whatsappUrl={result.whatsappUrl} />
        </div>
      </div>
    </PageContainer>
  );
}
