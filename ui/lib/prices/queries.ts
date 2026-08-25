import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";

import type { PriceHistoryEntry, Product, SyncRun } from "./types";

const productColumns =
  "id, external_code, description, category_raw, subcategory_raw, current_price, stock, created_at, updated_at, last_synced_at";
const syncRunColumns =
  "id, started_at, finished_at, status, rows_received, rows_created, rows_updated, rows_rejected";

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await getSupabaseServerClient()
    .from("products")
    .select(productColumns)
    .order("external_code", { ascending: true })
    .overrideTypes<Product[], { merge: false }>();

  if (error) {
    throw new Error("Could not load products.");
  }

  return data;
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await getSupabaseServerClient()
    .from("products")
    .select(productColumns)
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<Product | null, { merge: false }>();

  if (error) {
    throw new Error("Could not load product.");
  }

  return data;
}

export async function getLatestSuccessfulPriceSync(): Promise<SyncRun | null> {
  const { data, error } = await getSupabaseServerClient()
    .from("sync_runs")
    .select(syncRunColumns)
    .eq("sync_type", "prices")
    .eq("status", "success")
    .order("finished_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle()
    .overrideTypes<SyncRun | null, { merge: false }>();

  if (error) {
    throw new Error("Could not load the latest successful price sync.");
  }

  return data;
}

export async function getLatestPriceSync(): Promise<SyncRun | null> {
  const { data, error } = await getSupabaseServerClient()
    .from("sync_runs")
    .select(syncRunColumns)
    .eq("sync_type", "prices")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle()
    .overrideTypes<SyncRun | null, { merge: false }>();

  if (error) {
    throw new Error("Could not load the latest price sync.");
  }

  return data;
}

export async function getPriceSyncRunById(id: string): Promise<SyncRun | null> {
  const { data, error } = await getSupabaseServerClient()
    .from("sync_runs")
    .select(syncRunColumns)
    .eq("id", id)
    .eq("sync_type", "prices")
    .maybeSingle()
    .overrideTypes<SyncRun | null, { merge: false }>();

  if (error) {
    throw new Error("Could not load the requested price sync.");
  }

  return data;
}

export async function getEligiblePriceSyncRuns(
  lowerBound: string,
  baselineSyncRunId: string | null,
): Promise<SyncRun[]> {
  let query = getSupabaseServerClient()
    .from("sync_runs")
    .select(syncRunColumns)
    .eq("sync_type", "prices")
    .gte("started_at", lowerBound)
    .order("started_at", { ascending: true })
    .limit(2);

  if (baselineSyncRunId) {
    query = query.neq("id", baselineSyncRunId);
  }

  const { data, error } = await query.overrideTypes<SyncRun[], { merge: false }>();

  if (error) {
    throw new Error("Could not locate the new price sync.");
  }

  return data;
}

export async function getProductPriceHistory(
  productId: string,
): Promise<PriceHistoryEntry[]> {
  const { data, error } = await getSupabaseServerClient()
    .from("price_history")
    .select("id, product_id, price, recorded_at, source")
    .eq("product_id", productId)
    .order("recorded_at", { ascending: true })
    .overrideTypes<PriceHistoryEntry[], { merge: false }>();

  if (error) {
    throw new Error("Could not load product price history.");
  }

  return data;
}
