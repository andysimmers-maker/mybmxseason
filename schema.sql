-- Run this in the Supabase SQL editor for your project

create table user_rounds (
  user_id uuid references auth.users(id) on delete cascade not null,
  weekend_id text not null,
  created_at timestamptz default now(),
  primary key (user_id, weekend_id)
);
alter table user_rounds enable row level security;
create policy "own rows" on user_rounds for all using (auth.uid() = user_id);

create table user_bookings (
  user_id uuid references auth.users(id) on delete cascade not null,
  weekend_id text not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now(),
  primary key (user_id, weekend_id)
);
alter table user_bookings enable row level security;
create policy "own rows" on user_bookings for all using (auth.uid() = user_id);

create table user_checklist (
  user_id uuid references auth.users(id) on delete cascade not null,
  weekend_id text not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now(),
  primary key (user_id, weekend_id)
);
alter table user_checklist enable row level security;
create policy "own rows" on user_checklist for all using (auth.uid() = user_id);

create table user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  email text,
  email_notifications boolean not null default false,
  updated_at timestamptz default now()
);
alter table user_settings enable row level security;
create policy "own rows" on user_settings for all using (auth.uid() = user_id);
