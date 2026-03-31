-- BlackBatBook Phase 1 Schema
-- Supabase SQL Editor에 붙여넣기 하세요

create extension if not exists "pgcrypto";

-- PROFILES
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text,
  avatar_url    text,
  preferred_theme text not null default 'midnight'
    check (preferred_theme in ('glacier','midnight','forest','sakura','slate')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- TOKEN BALANCES
create table public.token_balances (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references public.profiles(id) on delete cascade,
  balance    integer not null default 5000,
  total_used integer not null default 0,
  plan       text not null default 'free' check (plan in ('free','pro','enterprise')),
  reset_at   timestamptz not null default (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_profile()
returns trigger language plpgsql security definer as $$
begin
  insert into public.token_balances (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();

-- WORKSPACES
create table public.workspaces (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  name            text not null,
  slug            text not null,
  type            text not null default 'tech_docs'
    check (type in ('tech_docs','blog','portfolio')),
  description     text,
  preferred_theme text not null default 'midnight'
    check (preferred_theme in ('glacier','midnight','forest','sakura','slate')),
  is_public       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(owner_id, slug)
);

-- DOCUMENTS
create table public.documents (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  author_id    uuid not null references public.profiles(id) on delete set null,
  parent_id    uuid references public.documents(id) on delete set null,
  title        text not null default 'Untitled',
  subtitle     text,
  content_html text not null default '',
  content_md   text not null default '',
  excerpt      text,
  slug         text not null,
  status       text not null default 'draft'
    check (status in ('draft','published','archived')),
  sort_order   integer not null default 0,
  word_count   integer default 0,
  read_time_min integer default 0,
  seo_title    text,
  seo_desc     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  unique(workspace_id, slug)
);

create index idx_documents_workspace on public.documents(workspace_id);
create index idx_documents_parent    on public.documents(parent_id);
create index idx_documents_status    on public.documents(workspace_id, status);

-- RLS
alter table public.profiles        enable row level security;
alter table public.token_balances  enable row level security;
alter table public.workspaces      enable row level security;
alter table public.documents       enable row level security;

create policy "profiles_own"  on public.profiles  for all using (auth.uid() = id);
create policy "tokens_own"    on public.token_balances for all using (auth.uid() = user_id);

create policy "ws_select"  on public.workspaces for select  using (auth.uid() = owner_id or is_public);
create policy "ws_insert"  on public.workspaces for insert  with check (auth.uid() = owner_id);
create policy "ws_update"  on public.workspaces for update  using (auth.uid() = owner_id);
create policy "ws_delete"  on public.workspaces for delete  using (auth.uid() = owner_id);

create policy "docs_select" on public.documents for select using (
  auth.uid() = author_id
  or exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
  or (status = 'published' and exists (select 1 from public.workspaces w where w.id = workspace_id and w.is_public))
);
create policy "docs_insert" on public.documents for insert with check (
  auth.uid() = author_id
  and exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
);
create policy "docs_update" on public.documents for update using (
  auth.uid() = author_id
  or exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
);
create policy "docs_delete" on public.documents for delete using (
  auth.uid() = author_id
  or exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
);
