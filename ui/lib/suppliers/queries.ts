import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";

import type { Supplier, SupplierAccountMovement } from "./types";

const supplierColumns =
  "id, external_slug, canonical_name, cuit, email, phone, address, payment_terms_days, current_balance, created_at, updated_at, last_synced_at";
const supplierMovementColumns =
  "id, supplier_id, movement_date, movement_type, reference, debe, haber, saldo, created_at, last_synced_at";
const supplierIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isSupplierId(value: string): boolean {
  return supplierIdPattern.test(value);
}

export async function getSuppliers(): Promise<Supplier[]> {
  const { data, error } = await getSupabaseServerClient()
    .from("suppliers")
    .select(supplierColumns)
    .order("canonical_name", { ascending: true })
    .overrideTypes<Supplier[], { merge: false }>();

  if (error) {
    throw new Error("Could not load suppliers.");
  }

  return data;
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  if (!isSupplierId(id)) {
    return null;
  }

  const { data, error } = await getSupabaseServerClient()
    .from("suppliers")
    .select(supplierColumns)
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<Supplier | null, { merge: false }>();

  if (error) {
    throw new Error("Could not load supplier.");
  }

  return data;
}

export async function getSupplierAccountMovements(
  supplierId: string,
): Promise<SupplierAccountMovement[]> {
  const { data, error } = await getSupabaseServerClient()
    .from("supplier_account_movements")
    .select(supplierMovementColumns)
    .eq("supplier_id", supplierId)
    .order("movement_date", { ascending: false })
    .order("created_at", { ascending: false })
    .order("reference", { ascending: false })
    .overrideTypes<SupplierAccountMovement[], { merge: false }>();

  if (error) {
    throw new Error("Could not load supplier account movements.");
  }

  return data;
}
