import Link from "next/link";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { getAllProductsAdmin } from "@/lib/data/products";

export const metadata = { title: "Produtos" };

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Produtos</h2>
          <p className="text-sm text-zinc-600">Cadastre e gerencie perfumes do catalogo.</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white"
        >
          Novo produto
        </Link>
      </div>
      <ProductsTable products={products} />
    </div>
  );
}
