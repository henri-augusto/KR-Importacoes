"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { buildOrderWhatsAppMessage, buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import type { Product } from "@/lib/types/database";

const checkoutSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  productName: z.string().min(1),
  productBrand: z.string().min(1),
  unitPriceCents: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(99),
  customerName: z.string().min(2, "Informe seu nome"),
  customerPhone: z.string().min(10, "Informe um telefone valido"),
  customerEmail: z
    .string()
    .optional()
    .transform((v) => (v === "" || !v ? undefined : v))
    .pipe(z.string().email("E-mail invalido").optional()),
  customerCity: z.string().optional(),
  customerState: z.string().max(2).optional(),
});

export type CheckoutState = {
  ok: boolean;
  error?: string;
  whatsappUrl?: string;
};

export async function createWhatsAppOrder(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const parsed = checkoutSchema.safeParse({
    productId: formData.get("productId"),
    productSlug: formData.get("productSlug"),
    productName: formData.get("productName"),
    productBrand: formData.get("productBrand"),
    unitPriceCents: formData.get("unitPriceCents"),
    quantity: formData.get("quantity"),
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerEmail: formData.get("customerEmail"),
    customerCity: formData.get("customerCity"),
    customerState: formData.get("customerState"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados invalidos",
    };
  }

  const data = parsed.data;
  const totalCents = data.unitPriceCents * data.quantity;
  const product: Pick<Product, "name" | "brand"> = {
    name: data.productName,
    brand: data.productBrand,
  };

  if (!isSupabaseConfigured()) {
    const mockOrderId = crypto.randomUUID();
    const message = buildOrderWhatsAppMessage({
      orderId: mockOrderId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      city: data.customerCity,
      state: data.customerState,
      product,
      quantity: data.quantity,
      totalCents,
    });
    return { ok: true, whatsappUrl: buildWhatsAppUrl(message) };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Banco de dados indisponivel" };
  }

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert({
      name: data.customerName,
      phone: data.customerPhone,
      email: data.customerEmail || null,
      city: data.customerCity || null,
      state: data.customerState || null,
    })
    .select("id")
    .single();

  if (customerError || !customer) {
    return { ok: false, error: "Nao foi possivel registrar o cliente" };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customer.id,
      status: "pending",
      total_cents: totalCents,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { ok: false, error: "Nao foi possivel registrar o pedido" };
  }

  const message = buildOrderWhatsAppMessage({
    orderId: order.id,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    city: data.customerCity,
    state: data.customerState,
    product,
    quantity: data.quantity,
    totalCents,
  });

  await supabase
    .from("orders")
    .update({ status: "whatsapp_sent", whatsapp_message: message })
    .eq("id", order.id);

  const isMockProduct = data.productId.startsWith("mock-");

  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    product_id: isMockProduct ? null : data.productId,
    product_name_snapshot: `${data.productBrand} - ${data.productName}`,
    quantity: data.quantity,
    unit_price_cents: data.unitPriceCents,
  });

  if (itemError) {
    return { ok: false, error: "Nao foi possivel registrar os itens" };
  }

  revalidatePath("/admin/pedidos");

  return { ok: true, whatsappUrl: buildWhatsAppUrl(message) };
}
