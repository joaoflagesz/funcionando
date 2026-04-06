create extension if not exists "pgcrypto";

create table if not exists public.sales_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  cliente text not null,
  tipo text not null default 'Site institucional',
  canal text not null default 'Instagram',
  status text not null default 'Lead',
  valor numeric(12,2) not null default 0,
  custo numeric(12,2) not null default 0,
  mensalidade numeric(12,2) not null default 0,
  data date not null default current_date,
  responsavel text,
  email text,
  telefone text,
  prazo text,
  observacoes text,
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  user_id uuid primary key,
  meta_mes numeric(12,2) not null default 10000,
  empresa_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_app_settings_updated_at on public.app_settings;
create trigger trg_app_settings_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

alter table public.sales_records enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "Users can view own sales" on public.sales_records;
create policy "Users can view own sales" on public.sales_records for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert own sales" on public.sales_records;
create policy "Users can insert own sales" on public.sales_records for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update own sales" on public.sales_records;
create policy "Users can update own sales" on public.sales_records for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own sales" on public.sales_records;
create policy "Users can delete own sales" on public.sales_records for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can view own settings" on public.app_settings;
create policy "Users can view own settings" on public.app_settings for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert own settings" on public.app_settings;
create policy "Users can insert own settings" on public.app_settings for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update own settings" on public.app_settings;
create policy "Users can update own settings" on public.app_settings for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
