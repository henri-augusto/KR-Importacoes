import { OrdersList } from "@/components/admin/OrdersList";
import { getOrdersAdmin } from "@/lib/data/orders";

export const metadata = { title: "Pedidos" };

export default async function AdminOrdersPage() {
  const orders = await getOrdersAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">Pedidos</h2>
        <p className="text-sm text-zinc-600">
          Pedidos recebidos pelo fluxo de compra via WhatsApp.
        </p>
      </div>
      <OrdersList orders={orders} />
    </div>
  );
}
