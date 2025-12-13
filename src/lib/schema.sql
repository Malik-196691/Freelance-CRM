-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (managed by Supabase Auth usually, but we extend it or create a public profile table)
-- Assuming this mimics the public.users table linked to auth.users
create table public.users (
  id uuid references auth.users not null primary key,
  name text,
  email text,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Clients table
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  name text not null,
  email text,
  phone text,
  company text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Projects table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  name text not null,
  description text,
  status text default 'active' check (status in ('active', 'completed', 'archived', 'on_hold')),
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tasks table
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'in_progress', 'done')),
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Invoices table
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id) not null,
  project_id uuid references public.projects(id),
  total numeric(10, 2) not null default 0,
  tax numeric(10, 2) default 0,
  discount numeric(10, 2) default 0,
  status text default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  pdf_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Basic examples, can be refined)
alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.invoices enable row level security;

-- Policy: Users can only see their own data
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Policy: Users can only see/edit their own clients
create policy "Users can view own clients" on public.clients
  for select using (auth.uid() = user_id);

create policy "Users can insert own clients" on public.clients
  for insert with check (auth.uid() = user_id);

create policy "Users can update own clients" on public.clients
  for update using (auth.uid() = user_id);

create policy "Users can delete own clients" on public.clients
  for delete using (auth.uid() = user_id);

-- (Similar policies would apply to projects, tasks, invoices by joining up to the user or client)
