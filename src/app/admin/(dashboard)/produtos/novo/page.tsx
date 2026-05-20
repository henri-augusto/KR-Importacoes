import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Novo produto" };

export default function NewProductPage() {
  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-zinc-900">Cadastrar produto</h2>
      <ProductForm />
    </div>
  );
}
