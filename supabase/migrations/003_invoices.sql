-- =========================================================
-- FACTURAS
-- Facturas normalizadas provenientes de SIGProv
-- =========================================================

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),

  -- Identificador propio del sistema legacy
  external_id text not null unique,

  -- Número visible de la factura
  invoice_number text not null,

  -- Proveedor canónico resuelto en nuestra base
  -- Puede quedar en null si no pudimos resolverlo con certeza
  supplier_id uuid
    references public.suppliers(id)
    on delete set null,

  -- Nombre del proveedor tal como vino originalmente en SIGProv
  -- Ejemplo: "Aceros Belgrano", "Aceros Belgrano S.A.", etc.
  supplier_name_raw text not null,

  -- Fechas principales
  invoice_date date not null,
  due_date date not null,

  -- Importes
  amount numeric(14,2) not null,
  paid_amount numeric(14,2) not null default 0,
  balance numeric(14,2) not null default 0,

  -- Estado de pago informado por SIGProv
  -- Ejemplos: Pagada, Pago parcial, Impaga
  payment_status text not null,

  -- Cantidad de días vencida según la fuente
  days_overdue integer not null default 0,

  -- Indica si ya fue generado el recibo correspondiente
  receipt_generated boolean not null default false,

  -- Tipo de archivo original de la factura
  -- Ejemplos: Excel, PDF, PDF (escaneado)
  file_type text,

  -- Referencia al producto informada por SIGProv
  product_external_id text,

  -- Texto original del producto
  product_text_raw text,

  -- Estado de resolución del proveedor
  -- resolved: pudimos asociarlo con certeza a un supplier
  -- pending: requiere revisión manual
  resolution_status text not null default 'pending'
    check (resolution_status in ('resolved', 'pending')),

  -- Motivo por el cual quedó pendiente de revisión
  resolution_note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_synced_at timestamptz not null default now()
);


-- =========================================================
-- ÍNDICES
-- =========================================================

-- Consultas de facturas por proveedor
create index if not exists idx_invoices_supplier
  on public.invoices(supplier_id);

-- Consultas y calendario por fecha de vencimiento
create index if not exists idx_invoices_due_date
  on public.invoices(due_date);

-- Filtros por estado de pago
create index if not exists idx_invoices_payment_status
  on public.invoices(payment_status);

-- Permite encontrar rápidamente facturas pendientes de resolución
create index if not exists idx_invoices_resolution_status
  on public.invoices(resolution_status);

-- Búsquedas por número de factura
create index if not exists idx_invoices_invoice_number
  on public.invoices(invoice_number);