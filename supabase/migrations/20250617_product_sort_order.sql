-- Manual product ordering for catalog and homepage highlights

alter table public.products
  add column if not exists sort_order integer not null default 0;

-- Backfill: preserve current visual order (featured first, then newest)
with ranked as (
  select
    id,
    row_number() over (
      order by is_featured desc, created_at desc
    ) - 1 as new_sort_order
  from public.products
)
update public.products p
set sort_order = ranked.new_sort_order
from ranked
where p.id = ranked.id;

create index if not exists products_active_sort_idx
  on public.products (is_active, sort_order);
