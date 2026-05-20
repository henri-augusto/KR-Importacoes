-- KR Servicos e Importacoes - schema inicial

create extension if not exists "pgcrypto";

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  brand text not null,
  description text,
  gender text check (gender in ('masculino', 'feminino', 'unissex')),
  family text,
  volume_ml integer,
  price_cents integer not null check (price_cents >= 0),
  compare_at_price_cents integer check (compare_at_price_cents is null or compare_at_price_cents >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  image_url text,
  category_id uuid references public.product_categories (id) on delete set null,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_idx on public.products (is_active);
create index if not exists products_featured_idx on public.products (is_featured);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  city text,
  state text,
  created_at timestamptz not null default now()
);

create type public.order_status as enum (
  'pending',
  'whatsapp_sent',
  'confirmed',
  'cancelled'
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete restrict,
  status public.order_status not null default 'pending',
  total_cents integer not null check (total_cents >= 0),
  notes text,
  whatsapp_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name_snapshot text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admin_profiles enable row level security;

create policy "Public read active products"
  on public.products for select
  using (is_active = true);

create policy "Public read categories"
  on public.product_categories for select
  using (true);

create policy "Public insert customers"
  on public.customers for insert
  with check (true);

create policy "Public insert orders"
  on public.orders for insert
  with check (true);

create policy "Public insert order items"
  on public.order_items for insert
  with check (true);

create policy "Admin manage products"
  on public.products for all
  using (
    exists (
      select 1 from public.admin_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin manage categories"
  on public.product_categories for all
  using (
    exists (
      select 1 from public.admin_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin read customers"
  on public.customers for select
  using (
    exists (
      select 1 from public.admin_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin manage orders"
  on public.orders for all
  using (
    exists (
      select 1 from public.admin_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin manage order items"
  on public.order_items for all
  using (
    exists (
      select 1 from public.admin_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin read own profile"
  on public.admin_profiles for select
  using (id = auth.uid());

insert into public.product_categories (name, slug)
values ('Importados', 'importados')
on conflict (slug) do nothing;
