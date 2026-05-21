import Image from "next/image";
import Link from "next/link";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";

const WHATSAPP_MESSAGE =
  "Olá! Vi que o site está em manutenção e gostaria de mais informações.";

export function MaintenanceState() {
  const whatsappHref = buildWhatsAppUrl(WHATSAPP_MESSAGE);

  return (
    <section className="flex min-h-[70dvh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-zinc-200/70 bg-white p-8 text-center shadow-[0_24px_70px_-45px_rgba(24,24,27,0.35)] md:p-10">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center overflow-hidden rounded-2xl bg-zinc-50">
          <Image
            src="/krservimpor_logo.png"
            alt="KR Serviços e Importações"
            width={72}
            height={72}
            className="object-contain"
            priority
          />
        </div>
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500">
          Em breve
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 md:text-4xl">
          Estamos em manutenção
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-600 md:text-base">
          Estamos atualizando nosso catálogo e melhorando a experiência de
          compra. Volte em breve ou fale conosco pelo WhatsApp.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-rose-900 px-6 text-sm font-medium text-white transition-transform active:scale-[0.98]"
          >
            Falar no WhatsApp
          </a>
          <Link
            href="/admin/login"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-medium text-zinc-800"
          >
            Área administrativa
          </Link>
        </div>
      </div>
    </section>
  );
}
