"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAdmin } from "@/app/actions/auth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/pedidos", label: "Pedidos" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 border-b border-zinc-200 pb-4 md:flex-row md:items-center md:justify-between md:border-0 md:pb-0">
      <div className="flex flex-col gap-1 md:flex-row md:gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`min-h-11 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:min-h-0 md:px-0 md:py-0 ${
              pathname === link.href
                ? "bg-zinc-100 text-zinc-900 md:bg-transparent"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <form action={signOutAdmin}>
        <button
          type="submit"
          className="mt-2 min-h-11 w-full rounded-lg border border-zinc-200 px-4 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 md:mt-0 md:w-auto"
        >
          Sair
        </button>
      </form>
    </nav>
  );
}
