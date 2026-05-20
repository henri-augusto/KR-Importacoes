import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/data/products";

export const metadata = { title: "Editar produto" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-zinc-900">
        Editar: {product.name}
      </h2>
      <ProductForm product={product} />
    </div>
  );
}
