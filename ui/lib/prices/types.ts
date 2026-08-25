export type Product = {
  id: string;
  external_code: string;
  description: string;
  category_raw: string | null;
  subcategory_raw: string | null;
  current_price: number;
  stock: number | null;
  created_at: string;
  updated_at: string;
  last_synced_at: string;
};

export type PriceHistoryEntry = {
  id: string;
  product_id: string;
  price: number;
  recorded_at: string;
  source: string;
};

export type SyncRunStatus = "running" | "success" | "partial" | "failed";

export type SyncRun = {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: SyncRunStatus;
  rows_received: number;
  rows_created: number;
  rows_updated: number;
  rows_rejected: number;
};
