"use client";

import { List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

export function MobileNav({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-800 transition-transform active:scale-[0.98]"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
      >
        {open ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40" onClick={() => setOpen(false)}>
          <nav
            className="absolute right-0 top-0 flex h-full w-[min(100%,320px)] flex-col gap-1 bg-[#faf9f7] p-6 pt-20 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="min-h-12 rounded-xl px-4 py-3 text-base font-medium text-zinc-800 transition-colors hover:bg-zinc-100"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/catalogo"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-rose-900 text-base font-medium text-white"
            >
              Ver catalogo
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
