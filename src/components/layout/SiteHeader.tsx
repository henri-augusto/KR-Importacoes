import Link from "next/link";
import { MobileNav } from "@/components/layout/MobileNav";

const links = [
  { href: "/", label: "Início" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-[#faf9f7]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16">
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            Importação premium
          </span>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 md:text-base">
            KR Imports
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/catalogo"
            className="inline-flex min-h-11 items-center rounded-full bg-rose-900 px-5 text-sm font-medium text-white transition-transform active:scale-[0.98]"
          >
            Ver catálogo
          </Link>
        </nav>

        <MobileNav links={links} />
      </div>
    </header>
  );
}
