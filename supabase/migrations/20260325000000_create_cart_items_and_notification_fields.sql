-- =============================================================================
-- UniLife: cart + notification support
-- - Creates `cart_items` (food + laundry) as the single cart table
-- - Extends `notifications` with fields needed for order/cart events
-- - Adds RLS policies so users only access their own rows
-- =============================================================================

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- 1) cart_items (single table for food + laundry cart lines)
-- -----------------------------------------------------------------------------
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),

  user_id integer not null references public.users(id) on delete cascade,

  -- 'food' for food ordering, 'laundry' for laundry service ordering
  cart_type text not null check (cart_type in ('food', 'laundry')),

  -- References are stored as TEXT to support either UUID or numeric ids
  -- from `food_stalls`/`food_items` and `laundry_shops`/`laundry_services`.
  shop_ref text not null,
  item_ref text not null,

  qty integer not null check (qty > 0),
  unit_price numeric not null default 0,

  -- Denormalized fields for fast rendering in the cart UI
  item_name text not null,
  item_description text,
  item_emoji text,

  status text not null default 'active' check (status in ('active', 'checked_out', 'removed')),

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  unique (user_id, cart_type, shop_ref, item_ref)
);

create index if not exists idx_cart_items_user_cart
  on public.cart_items (user_id, cart_type);

create index if not exists idx_cart_items_user_shop
  on public.cart_items (user_id, cart_type, shop_ref);

create index if not exists idx_cart_items_updated_at
  on public.cart_items (updated_at desc);

-- Update updated_at automatically
create or replace function public.set_cart_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_cart_items_updated_at on public.cart_items;
create trigger trg_cart_items_updated_at
before update on public.cart_items
for each row
execute function public.set_cart_items_updated_at();

-- -----------------------------------------------------------------------------
-- RLS for cart_items
-- -----------------------------------------------------------------------------
alter table public.cart_items enable row level security;

drop policy if exists "cart_items_select_own" on public.cart_items;
create policy "cart_items_select_own"
on public.cart_items
for select
to authenticated
using (
  user_id = (
    select u.id
    from public.users u
    where u.auth_id = auth.uid()
    limit 1
  )
);

drop policy if exists "cart_items_insert_own" on public.cart_items;
create policy "cart_items_insert_own"
on public.cart_items
for insert
to authenticated
with check (
  user_id = (
    select u.id
    from public.users u
    where u.auth_id = auth.uid()
    limit 1
  )
);

drop policy if exists "cart_items_update_own" on public.cart_items;
create policy "cart_items_update_own"
on public.cart_items
for update
to authenticated
using (
  user_id = (
    select u.id
    from public.users u
    where u.auth_id = auth.uid()
    limit 1
  )
)
with check (
  user_id = (
    select u.id
    from public.users u
    where u.auth_id = auth.uid()
    limit 1
  )
);

drop policy if exists "cart_items_delete_own" on public.cart_items;
create policy "cart_items_delete_own"
on public.cart_items
for delete
to authenticated
using (
  user_id = (
    select u.id
    from public.users u
    where u.auth_id = auth.uid()
    limit 1
  )
);

-- Allow service_role full access
drop policy if exists "cart_items_service_role_all" on public.cart_items;
create policy "cart_items_service_role_all"
on public.cart_items
for all
to service_role
using (true)
with check (true);

-- -----------------------------------------------------------------------------
-- 2) Extend notifications table (order/cart events)
-- -----------------------------------------------------------------------------
alter table public.notifications add column if not exists type text;
alter table public.notifications add column if not exists entity_type text;
alter table public.notifications add column if not exists entity_id text;
alter table public.notifications add column if not exists action_url text;
alter table public.notifications add column if not exists metadata jsonb;

-- -----------------------------------------------------------------------------
-- RLS for notifications (user can only access their own notifications)
-- -----------------------------------------------------------------------------
alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (
  user_id = (
    select u.id
    from public.users u
    where u.auth_id = auth.uid()
    limit 1
  )
);

drop policy if exists "notifications_insert_own" on public.notifications;
create policy "notifications_insert_own"
on public.notifications
for insert
to authenticated
with check (
  user_id = (
    select u.id
    from public.users u
    where u.auth_id = auth.uid()
    limit 1
  )
);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (
  user_id = (
    select u.id
    from public.users u
    where u.auth_id = auth.uid()
    limit 1
  )
)
with check (
  user_id = (
    select u.id
    from public.users u
    where u.auth_id = auth.uid()
    limit 1
  )
);

drop policy if exists "notifications_service_role_all" on public.notifications;
create policy "notifications_service_role_all"
on public.notifications
for all
to service_role
using (true)
with check (true);

