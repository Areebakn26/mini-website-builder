-- ==========================================
-- WebCraft AI SaaS - Supabase Database Schema
-- ==========================================

-- 1. Create Projects Table
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  current_code text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Messages Table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  role text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.projects enable row level security;
alter table public.messages enable row level security;

-- 4. RLS Policies for Projects
create policy "Users can view own projects" 
  on public.projects for select 
  using (auth.uid() = user_id);

create policy "Users can insert own projects" 
  on public.projects for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own projects" 
  on public.projects for update 
  using (auth.uid() = user_id);

create policy "Users can delete own projects" 
  on public.projects for delete 
  using (auth.uid() = user_id);

-- 5. RLS Policies for Messages (Checking parent project ownership)
create policy "Users can view messages of their projects" 
  on public.messages for select 
  using (
    exists (
      select 1 from public.projects
      where public.projects.id = public.messages.project_id
      and public.projects.user_id = auth.uid()
    )
  );

create policy "Users can insert messages into their projects" 
  on public.messages for insert 
  with check (
    exists (
      select 1 from public.projects
      where public.projects.id = public.messages.project_id
      and public.projects.user_id = auth.uid()
    )
  );

create policy "Users can update messages in their projects" 
  on public.messages for update 
  using (
    exists (
      select 1 from public.projects
      where public.projects.id = public.messages.project_id
      and public.projects.user_id = auth.uid()
    )
  );

create policy "Users can delete messages from their projects" 
  on public.messages for delete 
  using (
    exists (
      select 1 from public.projects
      where public.projects.id = public.messages.project_id
      and public.projects.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_messages_project_id on public.messages(project_id);
