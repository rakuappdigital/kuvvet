-- ============================================================
-- KUVVET - Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_id integer not null default 1 check (avatar_id between 1 and 20),
  created_at timestamptz default now()
);

-- Username immutability: only allow insert, not update on username
create or replace function prevent_username_change()
returns trigger as $$
begin
  if old.username is distinct from new.username then
    raise exception 'Username cannot be changed';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_username_immutable
before update on profiles
for each row execute function prevent_username_change();

-- Auto-create profile row on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  -- Profile is created during onboarding, not automatically
  return new;
end;
$$ language plpgsql security definer;

-- ============================================================
-- GROUPS
-- ============================================================
create table groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  created_by uuid references profiles(id) on delete set null,
  invite_code text unique default substr(md5(random()::text), 1, 8),
  created_at timestamptz default now()
);

-- ============================================================
-- GROUP MEMBERS
-- ============================================================
create type member_role as enum ('owner', 'admin', 'member');

create table group_members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role member_role default 'member',
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- ============================================================
-- WALL POSTS (last 2 days)
-- ============================================================
create table wall_posts (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 500),
  created_at timestamptz default now()
);

-- Index for efficient 2-day query
create index wall_posts_created_at_idx on wall_posts(group_id, created_at desc);

-- Auto-delete posts older than 2 days (via pg_cron or handled in app)
-- We'll filter in queries: where created_at > now() - interval '2 days'

-- ============================================================
-- POLLS (Anket)
-- ============================================================
create table polls (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade,
  created_by uuid references profiles(id) on delete cascade,
  question text not null,
  ends_at timestamptz,
  allow_multiple boolean default false,
  created_at timestamptz default now()
);

create table poll_options (
  id uuid default uuid_generate_v4() primary key,
  poll_id uuid references polls(id) on delete cascade,
  text text not null,
  position integer default 0
);

create table poll_votes (
  id uuid default uuid_generate_v4() primary key,
  poll_id uuid references polls(id) on delete cascade,
  option_id uuid references poll_options(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(poll_id, option_id, user_id)
);

-- ============================================================
-- MAP SHARES (Harita paylaşımı)
-- ============================================================
create table map_shares (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table wall_posts enable row level security;
alter table polls enable row level security;
alter table poll_options enable row level security;
alter table poll_votes enable row level security;
alter table map_shares enable row level security;

-- PROFILES
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile (except username)"
  on profiles for update using (auth.uid() = id);

-- GROUPS
create policy "Group members can view groups"
  on groups for select using (
    exists (select 1 from group_members where group_id = id and user_id = auth.uid())
  );

create policy "Authenticated users can create groups"
  on groups for insert with check (auth.uid() is not null);

create policy "Group owners/admins can update groups"
  on groups for update using (
    exists (select 1 from group_members where group_id = id and user_id = auth.uid() and role in ('owner','admin'))
  );

-- GROUP MEMBERS
create policy "Members can view group membership"
  on group_members for select using (
    exists (select 1 from group_members gm where gm.group_id = group_id and gm.user_id = auth.uid())
  );

create policy "Users can join groups"
  on group_members for insert with check (auth.uid() = user_id);

create policy "Owners can remove members"
  on group_members for delete using (
    user_id = auth.uid() or
    exists (select 1 from group_members gm where gm.group_id = group_id and gm.user_id = auth.uid() and gm.role = 'owner')
  );

-- WALL POSTS
create policy "Group members can view wall"
  on wall_posts for select using (
    exists (select 1 from group_members where group_id = wall_posts.group_id and user_id = auth.uid())
  );

create policy "Group members can post to wall"
  on wall_posts for insert with check (
    auth.uid() = user_id and
    exists (select 1 from group_members where group_id = wall_posts.group_id and user_id = auth.uid())
  );

create policy "Users can delete their own wall posts"
  on wall_posts for delete using (user_id = auth.uid());

-- POLLS
create policy "Group members can view polls"
  on polls for select using (
    exists (select 1 from group_members where group_id = polls.group_id and user_id = auth.uid())
  );

create policy "Group members can create polls"
  on polls for insert with check (
    auth.uid() = created_by and
    exists (select 1 from group_members where group_id = polls.group_id and user_id = auth.uid())
  );

-- POLL OPTIONS
create policy "Anyone can view poll options"
  on poll_options for select using (
    exists (
      select 1 from polls p
      join group_members gm on gm.group_id = p.group_id
      where p.id = poll_id and gm.user_id = auth.uid()
    )
  );

create policy "Poll creators can insert options"
  on poll_options for insert with check (
    exists (select 1 from polls where id = poll_id and created_by = auth.uid())
  );

-- POLL VOTES
create policy "Group members can view votes"
  on poll_votes for select using (
    exists (
      select 1 from polls p
      join group_members gm on gm.group_id = p.group_id
      where p.id = poll_id and gm.user_id = auth.uid()
    )
  );

create policy "Authenticated users can vote"
  on poll_votes for insert with check (auth.uid() = user_id);

create policy "Users can remove their vote"
  on poll_votes for delete using (user_id = auth.uid());

-- MAP SHARES
create policy "Group members can view map shares"
  on map_shares for select using (
    exists (select 1 from group_members where group_id = map_shares.group_id and user_id = auth.uid())
  );

create policy "Group members can add map shares"
  on map_shares for insert with check (
    auth.uid() = user_id and
    exists (select 1 from group_members where group_id = map_shares.group_id and user_id = auth.uid())
  );

create policy "Users can delete their own map shares"
  on map_shares for delete using (user_id = auth.uid());

-- ============================================================
-- REALTIME
-- Enable realtime for live wall and poll updates
-- ============================================================
-- Run in Supabase Dashboard > Database > Replication:
-- Enable for: wall_posts, poll_votes
