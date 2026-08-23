-- Habilita la generación de UUID si fuera necesario
create extension if not exists "pgcrypto";

-- =========================================================
-- PRODUCTOS
-- Estado actual y canónico de cada producto
-- =========================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  external_code text not null unique,
  description text not null,
  category_raw text,
  subcategory_raw text,
  current_price numeric(14,2) not null,
  stock integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_synced_at timestamptz not null default now()
);

-- =========================================================
-- HISTORIAL DE PRECIOS
-- Almacena los cambios de precio observados a lo largo del tiempo
-- =========================================================

create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  price numeric(14,2) not null,
  recorded_at timestamptz not null default now(),
  source text not null default 'sigprov'
);

-- Índice para agilizar consultas del historial por producto
create index if not exists idx_price_history_product_id
  on public.price_history(product_id);

-- Índice para agilizar consultas del historial por fecha
create index if not exists idx_price_history_recorded_at
  on public.price_history(recorded_at);

-- =========================================================
-- EJECUCIONES DE SINCRONIZACIÓN
-- Registro operativo de cada ejecución del proceso de sincronización
-- =========================================================

create table if not exists public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  sync_type text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running'
    check (status in ('running', 'success', 'partial', 'failed')),
  rows_received integer not null default 0,
  rows_created integer not null default 0,
  rows_updated integer not null default 0,
  rows_rejected integer not null default 0,
  error_message text,
  created_at timestamptz not null default now()
);

-- Índice para agilizar consultas según el tipo de sincronización
create index if not exists idx_sync_runs_sync_type
  on public.sync_runs(sync_type);

-- Índice para agilizar consultas según la fecha de inicio
create index if not exists idx_sync_runs_started_at
  on public.sync_runs(started_at);