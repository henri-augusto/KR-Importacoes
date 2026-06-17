create type public.payment_status as enum (
  'awaiting_payment',
  'paid',
  'failed',
  'refunded'
);

alter table public.orders
  add column if not exists payment_status public.payment_status,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists paid_at timestamptz;

create unique index if not exists orders_stripe_session_idx
  on public.orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);
