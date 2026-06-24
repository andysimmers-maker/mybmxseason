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

-- Community submissions (club races, training sessions, deadline corrections).
-- JSON files stay the canonical data source — admin reviews payload and pastes
-- it into the relevant file by hand, this table is just the review inbox.
create table submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('club_race', 'training_session', 'deadline_update')),
  target_key text,
  payload jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);
alter table submissions enable row level security;
create policy "insert own" on submissions for insert with check (auth.uid() = user_id);
-- Own rows always visible; pending rows visible to all signed-in users (dup-check
-- badge needs to know a correction is already proposed); admin sees everything.
create policy "select own, pending, or admin" on submissions for select using (
  auth.uid() = user_id
  or status = 'pending'
  or auth.jwt() ->> 'email' = 'andy.simmers@gmail.com'
);
create policy "admin review" on submissions for update using (auth.jwt() ->> 'email' = 'andy.simmers@gmail.com');

-- Notify the admin by email on new submissions, via the email-worker's
-- /notify-submission route. This is what the Database Webhooks UI does under
-- the hood — wiring it directly in SQL sidesteps needing to find that page.
-- Replace REPLACE_WITH_ADMIN_KEY below with the actual ADMIN_KEY secret value
-- you set with `wrangler secret put ADMIN_KEY` in email-worker/.
create extension if not exists pg_net;

create or replace function notify_new_submission()
returns trigger as $$
begin
  perform net.http_post(
    url := 'https://mybmxseason-reminders.andy-simmers.workers.dev/notify-submission?key=REPLACE_WITH_ADMIN_KEY',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object('type', 'INSERT', 'table', 'submissions', 'record', row_to_json(NEW))
  );
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_submission_insert
after insert on submissions
for each row execute function notify_new_submission();
