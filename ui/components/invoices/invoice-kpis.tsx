import type { Invoice } from "@/lib/invoices/types";
import { getInvoiceDueStatus } from "@/lib/invoices/utils";

type InvoiceKpisProps = {
  invoices: Invoice[];
};

export function InvoiceKpis({ invoices }: InvoiceKpisProps) {
  const overdueCount = invoices.filter((invoice) => getInvoiceDueStatus(invoice).type === "overdue").length;
  const values = [
    { label: "Total", value: invoices.length },
    { label: "Impagas", value: invoices.filter((invoice) => invoice.payment_status === "Impaga").length },
    { label: "Pago parcial", value: invoices.filter((invoice) => invoice.payment_status === "Pago parcial").length },
    { label: "Vencidas", value: overdueCount },
  ];

  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {values.map((item) => (
        <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <dt className="text-sm font-medium text-slate-600">{item.label}</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
