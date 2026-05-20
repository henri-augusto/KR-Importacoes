import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white">
      <PageContainer className="py-10 md:py-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              KR Servicos e Importacoes
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-600">
              Perfumes importados com curadoria. Compra facilitada pelo WhatsApp.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <Link href="/catalogo" className="text-zinc-600 hover:text-zinc-900">
              Catalogo
            </Link>
            <Link href="/admin" className="text-zinc-600 hover:text-zinc-900">
              Area administrativa
            </Link>
          </div>
        </div>
        <p className="mt-10 border-t border-zinc-100 pt-6 text-xs text-zinc-500">
          {new Date().getFullYear()} KR Servicos e Importacoes. Todos os direitos reservados.
        </p>
      </PageContainer>
    </footer>
  );
}
