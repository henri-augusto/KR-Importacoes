import type { createServiceClient } from "@/lib/supabase/server";
import type { Customer, OrderItem } from "@/lib/types/database";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import { buildPaidOrderWhatsAppMessage } from "@/lib/utils/whatsapp";

type ServiceClient = NonNullable<ReturnType<typeof createServiceClient>>;

export async function markOrderAsPaid(
  supabase: ServiceClient,
  params: {
    orderId: string;
    paymentIntentId: string | null;
  },
): Promise<boolean> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      id,
      total_cents,
      payment_status,
      customer:customers(name, phone, city, state),
      order_items(product_name_snapshot, quantity, unit_price_cents)
    `,
    )
    .eq("id", params.orderId)
    .single();

  if (orderError || !order) {
    if (orderError) console.error("[payment] markOrderAsPaid fetch", orderError);
    return false;
  }

  if (order.payment_status === "paid") {
    return true;
  }

  const customerRaw = order.customer;
  const customer = (Array.isArray(customerRaw)
    ? customerRaw[0]
    : customerRaw) as Pick<Customer, "name" | "phone" | "city" | "state"> | null;
  const itemsRaw = order.order_items;
  const items = (Array.isArray(itemsRaw) ? itemsRaw : itemsRaw ? [itemsRaw] : []) as Pick<
    OrderItem,
    "product_name_snapshot" | "quantity" | "unit_price_cents"
  >[];

  const firstItem = items[0];
  const productName = firstItem?.product_name_snapshot ?? "Produto";
  const quantity = firstItem?.quantity ?? 1;

  const message = buildPaidOrderWhatsAppMessage({
    orderId: order.id,
    customerName: customer?.name ?? "Cliente",
    customerPhone: customer?.phone
      ? formatPhoneDisplay(customer.phone)
      : "",
    city: customer?.city ?? undefined,
    state: customer?.state ?? undefined,
    productName,
    quantity,
    totalCents: order.total_cents,
  });

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "confirmed",
      stripe_payment_intent_id: params.paymentIntentId,
      paid_at: new Date().toISOString(),
      whatsapp_message: message,
    })
    .eq("id", params.orderId);

  if (updateError) {
    console.error("[payment] markOrderAsPaid update", updateError);
    return false;
  }

  return true;
}
