export type Supplier = {
  id: string;
  external_slug: string;
  canonical_name: string;
  cuit: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  payment_terms_days: number | null;
  current_balance: number;
  created_at: string;
  updated_at: string;
  last_synced_at: string;
};

export type SupplierAccountMovement = {
  id: string;
  supplier_id: string;
  movement_date: string;
  movement_type: string;
  reference: string;
  debe: number;
  haber: number;
  saldo: number;
  created_at: string;
  last_synced_at: string;
};
