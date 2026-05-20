"use client";

import Link from "next/link";

export function StickyWhatsAppCta({ href }: { href: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200/80 bg-[#faf9f7]/95 p-4 backdrop-blur-md md:hidden">
      <Link
        href={href}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-rose-900 text-base font-medium text-white transition-transform active:scale-[0.98]"
      >
        Comprar no WhatsApp
      </Link>
    </div>
  );
}
