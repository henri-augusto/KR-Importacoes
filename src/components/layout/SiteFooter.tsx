import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white">
      <PageContainer className="py-10 md:py-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              KR Imports
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-600">
              Perfumes importados com curadoria. Compra facilitada pelo WhatsApp.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <Link href="/catalogo" className="text-zinc-600 hover:text-zinc-900">
              Catálogo
            </Link>
            <Link href="/admin" className="text-zinc-600 hover:text-zinc-900">
              Área administrativa
            </Link>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-zinc-100 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {new Date().getFullYear()} KR Imports. Todos os direitos reservados.
          </p>
          <p>Desenvolvido por Logos Agency.</p>
        </div>
      </PageContainer>
    </footer>
  );
}
