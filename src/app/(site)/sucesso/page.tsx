import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export const metadata = {
  title: "Pedido enviado",
};

export default function SucessoPage() {
  return (
    <PageContainer className="py-16 md:py-24">
      <div className="mx-auto max-w-lg rounded-3xl border border-zinc-200/60 bg-white p-8 text-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] md:p-12">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-700">
          ✓
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Pedido registrado!
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-600">
          Abrimos o WhatsApp com sua mensagem pronta. Envie a conversa para
          confirmarmos seu pedido.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Se a janela não abriu, verifique se o navegador bloqueou pop-ups.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/catalogo"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-rose-900 px-8 text-base font-medium text-white transition-transform active:scale-[0.98]"
          >
            Voltar ao catálogo
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-base font-medium text-zinc-800"
          >
            Página inicial
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
