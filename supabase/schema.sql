-- Whereabouts PWA schema (run in Supabase SQL Editor)
-- Replaces anonymous single-user setup with auth + optional partner sharing.

-- If migrating from old schema, back up data first. This drops open anon access.

drop policy if exists "Allow anonymous access" on entries;

alter table entries add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table entries drop constraint if exists entries_date_key;
drop index if exists entries_user_date_unique;
create unique index if not exists entries_user_date_unique on entries(user_id, date);

alter table entries enable row level security;

drop policy if exists "Users manage own entries" on entries;
drop policy if exists "Partners can view shared entries" on entries;

create policy "Users manage own entries"
on entries for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Partners can view shared entries"
on entries for select
to authenticated
using (
  exists (
    select 1 from data_shares
    where data_shares.owner_id = entries.user_id
      and data_shares.partner_id = auth.uid()
      and data_shares.status = 'accepted'
  )
);

create table if not exists data_shares (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  owner_email text,
  partner_id uuid references auth.users(id) on delete cascade,
  invitee_email text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now(),
  unique (owner_id, invitee_email)
);

alter table data_shares add column if not exists owner_email text;

alter table data_shares enable row level security;

drop policy if exists "Owners manage shares" on data_shares;
drop policy if exists "Invitees read shares" on data_shares;
drop policy if exists "Invitees accept shares" on data_shares;

create policy "Owners manage shares"
on data_shares for all
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Invitees read shares"
on data_shares for select
to authenticated
using (
  partner_id = auth.uid()
  or lower(invitee_email) = lower(auth.jwt() ->> 'email')
);

create policy "Invitees accept shares"
on data_shares for update
to authenticated
using (lower(invitee_email) = lower(auth.jwt() ->> 'email'))
with check (partner_id = auth.uid() and status in ('accepted', 'declined'));

-- Per-user place names (defaults: India / Australia)
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  place_a text not null default 'India',
  place_b text not null default 'Australia',
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Users manage own profile" on profiles;
drop policy if exists "Partners can view shared profiles" on profiles;

create policy "Users manage own profile"
on profiles for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Partners can view shared profiles"
on profiles for select
to authenticated
using (
  exists (
    select 1 from data_shares
    where data_shares.owner_id = profiles.user_id
      and data_shares.partner_id = auth.uid()
      and data_shares.status = 'accepted'
  )
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, place_a, place_b)
  values (new.id, 'India', 'Australia')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
