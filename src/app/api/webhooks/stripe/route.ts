import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { markOrderAsPaid } from "@/lib/orders/payment";
import { createServiceClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";

export const runtime = "nodejs";

async function isEventProcessed(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  eventId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("stripe_webhook_events")
    .select("event_id")
    .eq("event_id", eventId)
    .maybeSingle();

  return Boolean(data);
}

async function markEventProcessed(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  eventId: string,
): Promise<void> {
  await supabase.from("stripe_webhook_events").insert({ event_id: eventId });
}

async function handleCheckoutSessionCompleted(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const orderId = session.metadata?.order_id;
  if (!orderId) {
    console.error("[stripe webhook] missing order_id in session metadata");
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const updated = await markOrderAsPaid(supabase, { orderId, paymentIntentId });
  if (updated) {
    revalidatePath("/admin/pedidos");
  }
}

async function handleCheckoutSessionExpired(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const orderId = session.metadata?.order_id;
  if (!orderId) return;

  await supabase
    .from("orders")
    .update({ payment_status: "failed" })
    .eq("id", orderId)
    .eq("payment_status", "awaiting_payment");
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe webhook] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (await isEventProcessed(supabase, event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          supabase,
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "checkout.session.expired":
        await handleCheckoutSessionExpired(
          supabase,
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      default:
        break;
    }

    await markEventProcessed(supabase, event.id);
  } catch (error) {
    console.error("[stripe webhook] handler error", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
