"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  formatPhoneDisplay,
  isValidBrazilianPhone,
  normalizePhone,
} from "@/lib/utils/phone";
import { buildOrderWhatsAppMessage, buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import type { Customer, Product } from "@/lib/types/database";

const phoneSchema = z
  .string()
  .min(1, "Informe um telefone válido")
  .transform(normalizePhone)
  .refine(isValidBrazilianPhone, {
    message: "Informe um telefone válido (10 ou 11 dígitos)",
  });

const checkoutSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  productName: z.string().min(1),
  productBrand: z.string().min(1),
  unitPriceCents: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(99),
  customerName: z.string().min(2, "Informe seu nome"),
  customerPhone: phoneSchema,
  customerEmail: z
    .string()
    .optional()
    .transform((v) => (v === "" || !v ? undefined : v))
    .pipe(z.string().email("E-mail inválido").optional()),
  customerCity: z.string().optional(),
  customerState: z.string().max(2).optional(),
});

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

async function upsertCustomerByPhone(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerCity?: string;
    customerState?: string;
  },
): Promise<{ id: string } | null> {
  const phone = data.customerPhone;

  try {
    const { data: existing, error: lookupError } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (lookupError) {
      console.error("[orders] upsertCustomerByPhone lookup", lookupError);
      return null;
    }

    const payload = {
      name: data.customerName,
      phone,
      email: data.customerEmail || null,
      city: data.customerCity || null,
      state: data.customerState?.toUpperCase() || null,
    };

    if (existing) {
      const { data: updated, error } = await supabase
        .from("customers")
        .update(payload)
        .eq("id", existing.id)
        .select("id")
        .single();

      if (error || !updated) {
        if (error) console.error("[orders] upsertCustomerByPhone update", error);
        return null;
      }
      return updated;
    }

    const { data: created, error } = await supabase
      .from("customers")
      .insert(payload)
      .select("id")
      .single();

    if (error || !created) {
      if (error) console.error("[orders] upsertCustomerByPhone insert", error);
      return null;
    }
    return created;
  } catch (error) {
    console.error("[orders] upsertCustomerByPhone", error);
    return null;
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
