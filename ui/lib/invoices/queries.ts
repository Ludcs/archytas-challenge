import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";

import type { Invoice, InvoiceSupplier } from "./types";

const invoiceColumns = `
  id,
  external_id,
  invoice_number,
  supplier_id,
  supplier_name_raw,
  invoice_date,
  due_date,
  amount,
  paid_amount,
  balance,
  payment_status,
  days_overdue,
  receipt_generated,
  file_type,
  product_external_id,
  product_text_raw,
  resolution_status,
  resolution_note,
  created_at,
  updated_at,
  last_synced_at,
  suppliers (
    id,
    canonical_name,
    cuit,
    email,
    phone,
    payment_terms_days
  )
`;

type InvoiceQueryRow = Omit<Invoice, "suppliers"> & {
  suppliers: InvoiceSupplier | InvoiceSupplier[] | null;
};

const invoiceIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isInvoiceId(value: string): boolean {
  return invoiceIdPattern.test(value);
}

function normalizeInvoice(row: InvoiceQueryRow): Invoice {
  const { suppliers, ...invoice } = row;

  if (!Array.isArray(suppliers)) {
    return { ...invoice, suppliers };
  }

  if (suppliers.length === 0) {
    return { ...invoice, suppliers: null };
  }

  if (suppliers.length === 1) {
    return { ...invoice, suppliers: suppliers[0] };
  }

  throw new Error("Could not normalize invoice supplier relation.");
}

export async function getInvoices(): Promise<Invoice[]> {
  const { data, error } = await getSupabaseServerClient()
    .from("invoices")
    .select(invoiceColumns)
    .order("due_date", { ascending: true })
    .overrideTypes<InvoiceQueryRow[], { merge: false }>();

  if (error) {
    throw new Error("Could not load invoices.");
  }

  return data.map(normalizeInvoice);
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  if (!isInvoiceId(id)) {
    return null;
  }

  const { data, error } = await getSupabaseServerClient()
    .from("invoices")
    .select(invoiceColumns)
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<InvoiceQueryRow | null, { merge: false }>();

  if (error) {
    throw new Error("Could not load invoice.");
  }

  return data ? normalizeInvoice(data) : null;
}
