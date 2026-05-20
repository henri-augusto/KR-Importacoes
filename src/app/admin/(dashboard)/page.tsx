import Link from "next/link";
import { getOrdersAdmin } from "@/lib/data/orders";
import { getAllProductsAdmin } from "@/lib/data/products";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [products, orders] = await Promise.all([
    getAllProductsAdmin(),
    getOrdersAdmin(),
  ]);

  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "whatsapp_sent",
  );

  return (
    <div className="flex flex-col gap-8">
      {!isSupabaseConfigured() && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Supabase nao configurado. Configure as variaveis de ambiente para persistir dados.
          O catalogo publico usa produtos de demonstracao.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Produtos" value={products.length} href="/admin/produtos" />
        <StatCard label="Pedidos" value={orders.length} href="/admin/pedidos" />
        <StatCard label="Pendentes" value={pendingOrders.length} href="/admin/pedidos" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/admin/produtos/novo"
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-zinc-900 text-sm font-medium text-white"
        >
          Novo produto
        </Link>
        <Link
          href="/admin/pedidos"
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-medium text-zinc-800"
        >
          Ver pedidos
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-zinc-200/60 bg-white p-5 transition-transform active:scale-[0.99]"
    >
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold text-zinc-900">{value}</p>
    </Link>
  );
}
