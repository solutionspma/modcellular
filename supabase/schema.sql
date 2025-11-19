-- Mod Cellular Database Schema
-- Supabase PostgreSQL

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table users (
  id uuid primary key default gen_random_uuid(),
  phone_number text unique,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Devices table
create table devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  device_fingerprint text unique not null,
  device_name text,
  platform text,
  last_seen timestamp with time zone default now(),
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Messages table
create table messages (
  id uuid primary key default gen_random_uuid(),
  sender uuid references users(id) on delete cascade,
  receiver uuid references users(id) on delete cascade,
  content text,
  media_url text,
  media_type text,
  created_at timestamp with time zone default now(),
  delivered boolean default false,
  read boolean default false,
  delivered_at timestamp with time zone,
  read_at timestamp with time zone,
  encrypted_payload text,
  transport_method text -- 'direct', 'mesh', 'dtn', 'satellite'
);

-- Calls table
create table calls (
  id uuid primary key default gen_random_uuid(),
  caller uuid references users(id) on delete cascade,
  callee uuid references users(id) on delete cascade,
  offer_sdp text,
  answer_sdp text,
  ice_candidates jsonb,
  started_at timestamp with time zone default now(),
  answered_at timestamp with time zone,
  ended_at timestamp with time zone,
  duration integer, -- seconds
  call_type text default 'audio', -- 'audio', 'video'
  quality_metrics jsonb,
  transport_log jsonb -- track signal switches during call
);

-- Stories table
create table stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  media_url text not null,
  media_type text not null,
  caption text,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone default now() + interval '24 hours',
  views_count integer default 0
);

-- Story views table
create table story_views (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories(id) on delete cascade,
  viewer_id uuid references users(id) on delete cascade,
  viewed_at timestamp with time zone default now(),
  unique(story_id, viewer_id)
);

-- Mesh relay nodes table
create table mesh_nodes (
  id uuid primary key default gen_random_uuid(),
  device_id uuid references devices(id) on delete cascade,
  location point,
  signal_strength integer,
  available_bandwidth integer, -- kbps
  is_relay_enabled boolean default false,
  last_heartbeat timestamp with time zone default now(),
  relay_stats jsonb
);

-- DTN message queue (delay-tolerant networking)
create table dtn_queue (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages(id) on delete cascade,
  next_hop_device uuid references devices(id),
  priority integer default 0,
  retry_count integer default 0,
  max_retries integer default 10,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone default now() + interval '7 days'
);

-- Signal logs (for analytics)
create table signal_logs (
  id uuid primary key default gen_random_uuid(),
  device_id uuid references devices(id) on delete cascade,
  signal_type text, -- 'wifi', 'bluetooth', 'mesh', 'cellular', 'satellite'
  signal_strength integer,
  location point,
  metadata jsonb,
  logged_at timestamp with time zone default now()
);

-- Indexes for performance
create index idx_messages_sender on messages(sender);
create index idx_messages_receiver on messages(receiver);
create index idx_messages_created_at on messages(created_at desc);
create index idx_calls_caller on calls(caller);
create index idx_calls_callee on calls(callee);
create index idx_devices_user_id on devices(user_id);
create index idx_mesh_nodes_last_heartbeat on mesh_nodes(last_heartbeat desc);
create index idx_dtn_queue_priority on dtn_queue(priority desc);
create index idx_stories_user_id on stories(user_id);
create index idx_stories_expires_at on stories(expires_at);

-- Row Level Security (RLS)
alter table users enable row level security;
alter table devices enable row level security;
alter table messages enable row level security;
alter table calls enable row level security;
alter table stories enable row level security;
alter table story_views enable row level security;

-- RLS Policies
create policy "Users can view their own profile"
  on users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on users for update
  using (auth.uid() = id);

create policy "Users can view messages they sent or received"
  on messages for select
  using (auth.uid() = sender or auth.uid() = receiver);

create policy "Users can insert messages"
  on messages for insert
  with check (auth.uid() = sender);

create policy "Users can view their calls"
  on calls for select
  using (auth.uid() = caller or auth.uid() = callee);

create policy "Users can insert calls"
  on calls for insert
  with check (auth.uid() = caller);

-- Realtime subscriptions
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table calls;
alter publication supabase_realtime add table mesh_nodes;
