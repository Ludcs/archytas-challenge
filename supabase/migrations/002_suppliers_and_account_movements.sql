-- =========================================================
-- PROVEEDORES
-- Maestro canónico de proveedores obtenido desde SIGProv
-- =========================================================

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),

  external_slug text not null unique,
  canonical_name text not null,
  cuit text not null unique,

  email text,
  phone text,
  address text,

  payment_terms_days integer,
  current_balance numeric(14,2) not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_synced_at timestamptz not null default now()
);

-- Índice para agilizar búsquedas por nombre canónico
create index if not exists idx_suppliers_canonical_name
  on public.suppliers(canonical_name);

-- =========================================================
-- MOVIMIENTOS DE CUENTA CORRIENTE
-- Facturas y pagos asociados a cada proveedor
-- =========================================================

create table if not exists public.supplier_account_movements (
  id uuid primary key default gen_random_uuid(),

  supplier_id uuid not null
    references public.suppliers(id)
    on delete cascade,

  movement_date date not null,
  movement_type text not null,
  reference text not null,

  debe numeric(14,2) not null default 0,
  haber numeric(14,2) not null default 0,
  saldo numeric(14,2) not null default 0,

  created_at timestamptz not null default now(),
  last_synced_at timestamptz not null default now(),

  unique (supplier_id, movement_type, reference)
);

-- Índice para agilizar consultas por proveedor
create index if not exists idx_supplier_account_movements_supplier
  on public.supplier_account_movements(supplier_id);

-- Índice para agilizar consultas por fecha
create index if not exists idx_supplier_account_movements_date
  on public.supplier_account_movements(movement_date);