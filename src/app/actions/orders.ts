"use server";

import { revalidatePath } from "next/cache";
import { checkoutSchema } from "@/lib/orders/checkout-schema";
import { upsertCustomerByPhone } from "@/lib/orders/customer";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  formatPhoneDisplay,
  isValidBrazilianPhone,
  normalizePhone,
} from "@/lib/utils/phone";
import { buildOrderWhatsAppMessage, buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import type { Customer, Product } from "@/lib/types/database";

export type CheckoutState = {
  ok: boolean;
  error?: string;
  whatsappUrl?: string;
};

export type CustomerLookupResult = {
  found: boolean;
  customer?: Pick<Customer, "name" | "email" | "city" | "state">;
};

export async function lookupCustomerByPhone(
  phone: string,
): Promise<CustomerLookupResult> {
  const normalized = normalizePhone(phone);
  if (!isValidBrazilianPhone(normalized)) {
    return { found: false };
  }

  if (!isSupabaseConfigured()) {
    return { found: false };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return { found: false };
  }

  try {
    const { data, error } = await supabase
      .from("customers")
      .select("name, email, city, state")
      .eq("phone", normalized)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error("[orders] lookupCustomerByPhone", error);
      return { found: false };
    }

    return {
      found: true,
      customer: {
        name: data.name,
        email: data.email,
        city: data.city,
        state: data.state,
      },
    };
  } catch (error) {
    console.error("[orders] lookupCustomerByPhone", error);
    return { found: false };
  }
}

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
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const data = parsed.data;
  const phoneDisplay = formatPhoneDisplay(data.customerPhone);
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
      customerPhone: phoneDisplay,
      city: data.customerCity,
      state: data.customerState,
      product,
      quantity: data.quantity,
      totalCents,
    });
    return { ok: true, whatsappUrl: buildWhatsAppUrl(message) };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, error: "Banco de dados indisponível" };
  }

  try {
    const customer = await upsertCustomerByPhone(supabase, {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      customerCity: data.customerCity,
      customerState: data.customerState,
    });

    if (!customer) {
      return { ok: false, error: "Não foi possível registrar o cliente" };
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
      if (orderError) console.error("[orders] createWhatsAppOrder order", orderError);
      return { ok: false, error: "Não foi possível registrar o pedido" };
    }

    const message = buildOrderWhatsAppMessage({
      orderId: order.id,
      customerName: data.customerName,
      customerPhone: phoneDisplay,
      city: data.customerCity,
      state: data.customerState,
      product,
      quantity: data.quantity,
      totalCents,
    });

    const { error: statusError } = await supabase
      .from("orders")
      .update({ status: "whatsapp_sent", whatsapp_message: message })
      .eq("id", order.id);

    if (statusError) {
      console.error("[orders] createWhatsAppOrder status", statusError);
    }

    const isMockProduct = data.productId.startsWith("mock-");

    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: isMockProduct ? null : data.productId,
      product_name_snapshot: `${data.productBrand} - ${data.productName}`,
      quantity: data.quantity,
      unit_price_cents: data.unitPriceCents,
    });

    if (itemError) {
      console.error("[orders] createWhatsAppOrder item", itemError);
      return { ok: false, error: "Não foi possível registrar os itens" };
    }

    revalidatePath("/admin/pedidos");

    return { ok: true, whatsappUrl: buildWhatsAppUrl(message) };
  } catch (error) {
    console.error("[orders] createWhatsAppOrder", error);
    return {
      ok: false,
      error: "Não foi possível finalizar agora. Tente novamente em instantes.",
    };
  }
}
