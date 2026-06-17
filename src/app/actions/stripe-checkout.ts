"use server";

import { revalidatePath } from "next/cache";
import { upsertCustomerByPhone } from "@/lib/orders/customer";
import { checkoutSchema } from "@/lib/orders/checkout-schema";
import { markOrderAsPaid } from "@/lib/orders/payment";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getAppUrl, getStripe, isStripeConfigured } from "@/lib/stripe/server";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";

export type StripeCheckoutState = {
  ok: boolean;
  error?: string;
  orderId?: string;
  productSlug?: string;
};

export type PaymentOrderSummary = {
  orderId: string;
  productName: string;
  quantity: number;
  totalCents: number;
  customerName: string;
};

export type VerifyCheckoutResult = {
  ok: boolean;
  error?: string;
  whatsappUrl?: string;
  orderId?: string;
};

export async function createStripeCheckout(
  _prev: StripeCheckoutState,
  formData: FormData,
): Promise<StripeCheckoutState> {
  if (!isStripeConfigured()) {
    return { ok: false, error: "Pagamento online indisponível no momento" };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Banco de dados indisponível" };
  }

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
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, error: "Banco de dados indisponível" };
  }

  try {
    const isMockProduct = data.productId.startsWith("mock-");

    let unitPriceCents = data.unitPriceCents;
    let productName = `${data.productBrand} - ${data.productName}`;

    if (!isMockProduct) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, name, brand, price_cents, stock_quantity, is_active")
        .eq("id", data.productId)
        .eq("is_active", true)
        .single();

      if (productError || !product) {
        return { ok: false, error: "Produto indisponível" };
      }

      if (product.stock_quantity < data.quantity) {
        return { ok: false, error: "Estoque insuficiente para esta quantidade" };
      }

      unitPriceCents = product.price_cents;
      productName = `${product.brand} - ${product.name}`;
    }

    const totalCents = unitPriceCents * data.quantity;

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
        payment_status: "awaiting_payment",
        total_cents: totalCents,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      if (orderError) console.error("[stripe] createStripeCheckout order", orderError);
      return { ok: false, error: "Não foi possível registrar o pedido" };
    }

    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: isMockProduct ? null : data.productId,
      product_name_snapshot: productName,
      quantity: data.quantity,
      unit_price_cents: unitPriceCents,
    });

    if (itemError) {
      console.error("[stripe] createStripeCheckout item", itemError);
      return { ok: false, error: "Não foi possível registrar os itens" };
    }

    const stripe = getStripe();
    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "payment",
      customer_email: data.customerEmail,
      line_items: [
        {
          quantity: data.quantity,
          price_data: {
            currency: "brl",
            unit_amount: unitPriceCents,
            product_data: {
              name: productName,
            },
          },
        },
      ],
      metadata: {
        order_id: order.id,
      },
      return_url: `${appUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    });

    if (!session.client_secret) {
      return { ok: false, error: "Não foi possível iniciar o pagamento" };
    }

    const { error: sessionError } = await supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);

    if (sessionError) {
      console.error("[stripe] createStripeCheckout session id", sessionError);
      return { ok: false, error: "Não foi possível vincular o pagamento ao pedido" };
    }

    revalidatePath("/admin/pedidos");

    return {
      ok: true,
      orderId: order.id,
      productSlug: data.productSlug,
    };
  } catch (error) {
    console.error("[stripe] createStripeCheckout", error);
    return {
      ok: false,
      error: "Não foi possível iniciar o pagamento. Tente novamente em instantes.",
    };
  }
}

export async function getCheckoutClientSecret(orderId: string): Promise<string> {
  if (!isStripeConfigured() || !isSupabaseConfigured()) {
    throw new Error("Pagamento indisponível");
  }

  const supabase = createServiceClient();
  if (!supabase) {
    throw new Error("Banco de dados indisponível");
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("stripe_checkout_session_id, payment_status")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    throw new Error("Pedido não encontrado");
  }

  if (order.payment_status !== "awaiting_payment") {
    throw new Error("Este pedido não está aguardando pagamento");
  }

  if (!order.stripe_checkout_session_id) {
    throw new Error("Sessão de pagamento não encontrada");
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(
    order.stripe_checkout_session_id,
  );

  if (session.status === "expired") {
    await supabase
      .from("orders")
      .update({ payment_status: "failed" })
      .eq("id", orderId);
    throw new Error("Sessão de pagamento expirada. Refaça o pedido.");
  }

  if (!session.client_secret) {
    throw new Error("Não foi possível carregar o pagamento");
  }

  return session.client_secret;
}

export async function getPaymentOrderSummary(
  orderId: string,
): Promise<PaymentOrderSummary | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      total_cents,
      payment_status,
      customer:customers(name),
      order_items(product_name_snapshot, quantity)
    `,
    )
    .eq("id", orderId)
    .single();

  if (error || !order) return null;
  if (order.payment_status !== "awaiting_payment") return null;

  const customerRaw = order.customer;
  const customer = Array.isArray(customerRaw) ? customerRaw[0] : customerRaw;
  const itemsRaw = order.order_items;
  const items = (Array.isArray(itemsRaw) ? itemsRaw : itemsRaw ? [itemsRaw] : null) as
    | { product_name_snapshot: string; quantity: number }[]
    | null;
  const firstItem = items?.[0];

  if (!firstItem) return null;

  return {
    orderId: order.id,
    productName: firstItem.product_name_snapshot,
    quantity: firstItem.quantity,
    totalCents: order.total_cents,
    customerName: customer?.name ?? "Cliente",
  };
}

export async function verifyCheckoutSession(
  sessionId: string,
): Promise<VerifyCheckoutResult> {
  if (!isStripeConfigured() || !isSupabaseConfigured()) {
    return { ok: false, error: "Pagamento indisponível" };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, error: "Banco de dados indisponível" };
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (session.payment_status !== "paid") {
      return { ok: false, error: "Pagamento ainda não confirmado" };
    }

    const orderId = session.metadata?.order_id;
    if (!orderId) {
      return { ok: false, error: "Pedido não encontrado" };
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    await markOrderAsPaid(supabase, { orderId, paymentIntentId });

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, whatsapp_message")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return { ok: false, error: "Pedido não encontrado" };
    }

    if (!order.whatsapp_message) {
      return { ok: false, error: "Mensagem do pedido indisponível" };
    }

    return {
      ok: true,
      orderId: order.id,
      whatsappUrl: buildWhatsAppUrl(order.whatsapp_message),
    };
  } catch (error) {
    console.error("[stripe] verifyCheckoutSession", error);
    return { ok: false, error: "Não foi possível verificar o pagamento" };
  }
}
