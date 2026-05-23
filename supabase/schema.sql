-- GlobalBiz — Supabase schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Idempotent: safe to run multiple times.

-- ============================================================
-- 0) shared updated_at trigger function (used by both tables)
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 1) profiles — one row per auth user, populated on signup
-- ============================================================
create table if not exists public.profiles (
  id                 uuid references auth.users(id) on delete cascade primary key,
  full_name          text not null,
  business_name      text,
  preferred_language text not null default 'he',
  created_at         timestamp with time zone not null default now(),
  updated_at         timestamp with time zone not null default now()
);

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Server-side safety net for new signups
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, business_name, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'business_name',
    coalesce(new.raw_user_meta_data->>'preferred_language', 'he')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2) waitlist_users — Phase 2 early-access onboarding
--    Each authed user fills out the waitlist form once;
--    can update later. Admin grades them out-of-band by
--    setting onboarding_status / early_access_priority in
--    the dashboard or via SQL.
-- ============================================================

-- enums (drop & recreate cleanly if shape changes — safe via DO block)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'business_type') then
    create type business_type as enum (
      'developer', 'designer', 'consultant', 'copywriter',
      'translator', 'marketing', 'accounting', 'other'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'monthly_income_range') then
    create type monthly_income_range as enum (
      'lt_1k', '1k_5k', '5k_20k', 'gt_20k'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'onboarding_status') then
    create type onboarding_status as enum (
      'pending', 'reviewing', 'approved', 'rejected'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'early_access_priority') then
    create type early_access_priority as enum (
      'low', 'normal', 'high'
    );
  end if;
end$$;

create table if not exists public.waitlist_users (
  id                     uuid references auth.users(id) on delete cascade primary key,
  full_name              text not null,
  email                  text not null,
  country                text not null,
  business_type          business_type not null,
  works_internationally  boolean not null,
  monthly_income_range   monthly_income_range not null,
  current_tools          text[] not null default '{}',
  referral_source        text,
  onboarding_status      onboarding_status not null default 'pending',
  early_access_priority  early_access_priority not null default 'normal',
  created_at             timestamp with time zone not null default now(),
  updated_at             timestamp with time zone not null default now()
);

drop trigger if exists waitlist_users_touch_updated_at on public.waitlist_users;
create trigger waitlist_users_touch_updated_at
  before update on public.waitlist_users
  for each row execute function public.touch_updated_at();

alter table public.waitlist_users enable row level security;

-- Users can only see + edit their own row.
-- onboarding_status + early_access_priority are admin-controlled —
-- a user CAN set them on first insert, but in the client we never do.
-- Admins update via service_role (bypasses RLS).
drop policy if exists "Users can read own waitlist" on public.waitlist_users;
create policy "Users can read own waitlist"
  on public.waitlist_users for select
  using (auth.uid() = id);

drop policy if exists "Users can insert own waitlist" on public.waitlist_users;
create policy "Users can insert own waitlist"
  on public.waitlist_users for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own waitlist" on public.waitlist_users;
create policy "Users can update own waitlist"
  on public.waitlist_users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Useful indexes for admin filtering / CSV export
create index if not exists waitlist_users_status_idx
  on public.waitlist_users (onboarding_status, early_access_priority, created_at desc);
create index if not exists waitlist_users_country_idx
  on public.waitlist_users (country);

-- ============================================================
-- 3) admin_users — explicit whitelist for the /admin/waitlist UI.
--    Grant access by inserting a row manually in SQL Editor:
--      insert into public.admin_users (user_id)
--      values ('<UUID from auth.users>');
--    Revoke by deleting the row.
-- ============================================================
create table if not exists public.admin_users (
  user_id    uuid references auth.users(id) on delete cascade primary key,
  granted_at timestamp with time zone not null default now()
);

alter table public.admin_users enable row level security;

-- is_admin() is SECURITY DEFINER so it bypasses RLS during the lookup
-- itself — that breaks the policy-recursion cycle. Callable by any
-- authenticated user; just returns boolean, no data leak.
-- Admin = the founder email OR any row in admin_users. The founder
-- email is the primary gate (matches the client useIsAdmin check).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(
      (select lower(au.email) = 'edrishahar25@gmail.com'
         from auth.users au where au.id = auth.uid()),
      false
    )
    or exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to authenticated;

-- Only admins can see who else is an admin.
drop policy if exists "Admins can read admin_users" on public.admin_users;
create policy "Admins can read admin_users"
  on public.admin_users for select
  using (public.is_admin());

-- Admin escalation policies — admins see/update all waitlist + all profiles.
-- Regular per-user policies above still apply for non-admins.
drop policy if exists "Admins read all waitlist" on public.waitlist_users;
create policy "Admins read all waitlist"
  on public.waitlist_users for select
  using (public.is_admin());

drop policy if exists "Admins update any waitlist" on public.waitlist_users;
create policy "Admins update any waitlist"
  on public.waitlist_users for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Force PostgREST to refresh its schema cache so the new table is
-- visible immediately (avoids PGRST205 right after migration).
notify pgrst, 'reload schema';
