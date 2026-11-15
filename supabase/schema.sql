-- IRONCLAD MINDSET — SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Run this in your Supabase SQL Editor to enable live cloud sync

create extension if not exists "uuid-ossp";

-- 1. User Sobriety & Forge Profiles
create table public.forge_profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  sobriety_start_date date default current_date,
  streak_days integer default 1,
  weekly_booze_spend_gbp numeric(10,2) default 65.00,
  weekly_units_avoided integer default 28,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Daily Check-Ins & Non-Negotiables
create table public.daily_checkins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  checkin_date date default current_date not null,
  mood_score integer check (mood_score between 1 and 10),
  sleep_score integer check (sleep_score between 1 and 10),
  craving_score integer check (craving_score between 1 and 10),
  cooked_real_meal boolean default false,
  walk_or_breathwork boolean default false,
  held_the_line_zero_booze boolean default true,
  reflection_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. HALT & CBT Trigger Logs
create table public.halt_trigger_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  trigger_event text not null,
  halt_states text[] default '{}',
  automatic_negative_thought text,
  ironclad_reframe text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. The Locker Room Community Posts
create table public.locker_room_posts (
  id uuid default uuid_generate_v4() primary key,
  author_name text not null,
  author_badge text default 'Day 1 Starter',
  channel text not null check (channel in ('day-1-starters', 'kitchen-and-shift-workers', 'matchday-sober', 'business-owners')),
  content text not null,
  iron_fist_bumps integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. B2B Corporate Wellness Leads
create table public.b2b_wellness_leads (
  id uuid default uuid_generate_v4() primary key,
  company_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  industry_sector text,
  employee_count integer not null,
  estimated_annual_savings_gbp numeric(12,2),
  package_interest text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.forge_profiles enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.halt_trigger_logs enable row level security;
alter table public.locker_room_posts enable row level security;
alter table public.b2b_wellness_leads enable row level security;

-- Policies
create policy "Users can view and update own profile" on public.forge_profiles for all using (auth.uid() = id);
create policy "Users manage own checkins" on public.daily_checkins for all using (auth.uid() = user_id);
create policy "Users manage own HALT logs" on public.halt_trigger_logs for all using (auth.uid() = user_id);
create policy "Anyone can read Locker Room posts" on public.locker_room_posts for select using (true);
create policy "Anyone can insert Locker Room posts" on public.locker_room_posts for insert with check (true);
create policy "Anyone can submit B2B leads" on public.b2b_wellness_leads for insert with check (true);
