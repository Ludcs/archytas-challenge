import type { Invoice } from "@/lib/invoices/types";

const presentation: Record<string, { label: string; className: string }> = {
  Pagada: { label: "Pagada", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  "Pago parcial": { label: "Pago parcial", className: "border-amber-200 bg-amber-50 text-amber-800" },
  Impaga: { label: "Impaga", className: "border-red-200 bg-red-50 text-red-800" },
};

type InvoicePaymentStatusBadgeProps = {
  status: Invoice["payment_status"];
};

export function InvoicePaymentStatusBadge({ status }: InvoicePaymentStatusBadgeProps) {
  const item = presentation[status] ?? {
    label: status,
    className: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${item.className}`}>{item.label}</span>;
}
