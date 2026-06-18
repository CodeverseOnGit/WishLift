-- WishLift Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null,
  role text not null check (role in ('recipient', 'helper')),
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Wishes table
create table public.wishes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  image_url text,
  category text not null check (category in ('Education','Health','Business','Family','Travel','Emergency','Community','Other')),
  location text,
  status text default 'Open' check (status in ('Open','In Progress','Fulfilled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Contact Requests table
create table public.contact_requests (
  id uuid default uuid_generate_v4() primary key,
  wish_id uuid references public.wishes(id) on delete cascade not null,
  helper_id uuid references public.users(id) on delete cascade not null,
  recipient_id uuid references public.users(id) on delete cascade not null,
  message text,
  status text default 'Pending' check (status in ('Pending','Accepted','Declined')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Conversations table
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_one uuid references public.users(id) on delete cascade not null,
  user_two uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.users(id) on delete cascade not null,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Saved Wishes (for helpers)
create table public.saved_wishes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  wish_id uuid references public.wishes(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, wish_id)
);

-- Wish Reports table
create table public.wish_reports (
  id uuid default uuid_generate_v4() primary key,
  wish_id uuid references public.wishes(id) on delete cascade not null,
  reporter_id uuid references public.users(id) on delete cascade not null,
  reason text not null check (reason in ('Fraud','Spam','Harassment','Other')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security Policies

alter table public.users enable row level security;
alter table public.wishes enable row level security;
alter table public.contact_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.saved_wishes enable row level security;
alter table public.wish_reports enable row level security;

-- Users policies
create policy "Users can view all profiles" on public.users for select using (true);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

-- Wishes policies
create policy "Anyone can view open wishes" on public.wishes for select using (true);
create policy "Authenticated users can create wishes" on public.wishes for insert with check (auth.uid() = user_id);
create policy "Owners can update their wishes" on public.wishes for update using (auth.uid() = user_id);
create policy "Owners can delete their wishes" on public.wishes for delete using (auth.uid() = user_id);

-- Contact requests policies
create policy "Helpers can create contact requests" on public.contact_requests for insert with check (auth.uid() = helper_id);
create policy "Users can view their own contact requests" on public.contact_requests for select using (auth.uid() = helper_id or auth.uid() = recipient_id);
create policy "Recipients can update contact requests" on public.contact_requests for update using (auth.uid() = recipient_id);

-- Conversations policies
create policy "Users can view their conversations" on public.conversations for select using (auth.uid() = user_one or auth.uid() = user_two);
create policy "Authenticated users can create conversations" on public.conversations for insert with check (auth.uid() = user_one or auth.uid() = user_two);

-- Messages policies
create policy "Users can view messages in their conversations" on public.messages for select using (
  exists (
    select 1 from public.conversations
    where id = conversation_id and (user_one = auth.uid() or user_two = auth.uid())
  )
);
create policy "Users can send messages in their conversations" on public.messages for insert with check (
  auth.uid() = sender_id and
  exists (
    select 1 from public.conversations
    where id = conversation_id and (user_one = auth.uid() or user_two = auth.uid())
  )
);
create policy "Users can update read status" on public.messages for update using (
  exists (
    select 1 from public.conversations
    where id = conversation_id and (user_one = auth.uid() or user_two = auth.uid())
  )
);

-- Saved wishes policies
create policy "Users can manage their saved wishes" on public.saved_wishes for all using (auth.uid() = user_id);

-- Reports policies
create policy "Authenticated users can report" on public.wish_reports for insert with check (auth.uid() = reporter_id);

-- Storage bucket for wish images
insert into storage.buckets (id, name, public) values ('wish-images', 'wish-images', true);

create policy "Anyone can view wish images" on storage.objects for select using (bucket_id = 'wish-images');
create policy "Authenticated users can upload wish images" on storage.objects for insert with check (bucket_id = 'wish-images' and auth.role() = 'authenticated');
create policy "Users can update own wish images" on storage.objects for update using (bucket_id = 'wish-images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete own wish images" on storage.objects for delete using (bucket_id = 'wish-images' and auth.uid()::text = (storage.foldername(name))[1]);
