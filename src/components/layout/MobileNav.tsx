"use client";

import { List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const linkClassName =
  "flex min-h-12 w-full items-center rounded-xl px-4 text-base font-medium text-zinc-800 transition-colors hover:bg-zinc-100";

export function MobileNav({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const close = () => setOpen(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const menu =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
          >
            <button
              type="button"
              className="absolute inset-0 bg-zinc-950/40"
              aria-label="Fechar menu"
              onClick={close}
            />
            <nav
              id="mobile-nav-menu"
              className="absolute right-0 top-0 flex h-full w-[min(100%,320px)] flex-col bg-[#faf9f7] shadow-xl"
            >
              <div className="flex min-h-14 shrink-0 items-center justify-between border-b border-zinc-200/80 px-4">
                <span className="text-sm font-semibold text-zinc-900">Menu</span>
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-800 transition-transform active:scale-[0.98]"
                  aria-label="Fechar menu"
                >
                  <X size={22} weight="bold" />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-2 px-4 py-6">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className={linkClassName}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="mt-auto pt-4">
                  <Link
                    href="/catalogo"
                    onClick={close}
                    className="flex min-h-12 w-full items-center justify-center rounded-full bg-rose-900 text-base font-medium text-white transition-transform active:scale-[0.98]"
                  >
                    Ver catálogo
                  </Link>
                </div>
              </div>
            </nav>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative z-[1] inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-800 transition-transform active:scale-[0.98]"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
      >
        {open ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
      </button>
      {menu}
    </div>
  );
}
