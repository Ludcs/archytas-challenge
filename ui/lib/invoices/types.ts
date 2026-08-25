export type InvoiceSupplier = {
  id: string;
  canonical_name: string;
  cuit: string;
  email: string | null;
  phone: string | null;
  payment_terms_days: number | null;
};

export type Invoice = {
  id: string;
  external_id: string;
  invoice_number: string;
  supplier_id: string | null;
  supplier_name_raw: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  paid_amount: number;
  balance: number;
  payment_status: "Pagada" | "Pago parcial" | "Impaga" | string;
  days_overdue: number;
  receipt_generated: boolean;
  file_type: string | null;
  product_external_id: string | null;
  product_text_raw: string | null;
  resolution_status: "resolved" | "pending";
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
  last_synced_at: string;
  suppliers: InvoiceSupplier | null;
};

export type InvoiceDueStatus = {
  type: "paid" | "overdue" | "today" | "upcoming";
  label: string;
  days?: number;
};

export type InvoiceAttentionMetrics = {
  overdueWithoutReceipt: number;
  upcomingWithoutReceipt: number;
  pendingResolution: number;
};

export type InvoiceListFilter = "all" | "unpaid" | "partial" | "paid" | "overdue";
