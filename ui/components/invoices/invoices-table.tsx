import Link from "next/link";

import { InvoiceDueStatus } from "@/components/invoices/invoice-due-status";
import { InvoicePaymentStatusBadge } from "@/components/invoices/invoice-payment-status-badge";
import { InvoiceReceiptStatus } from "@/components/invoices/invoice-receipt-status";
import { InvoiceResolutionStatus } from "@/components/invoices/invoice-resolution-status";
import type { Invoice } from "@/lib/invoices/types";
import { formatCalendarDate, formatCurrency } from "@/lib/invoices/utils";

type InvoicesTableProps = {
  invoices: Invoice[];
};

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
        No hay facturas sincronizadas todavía.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[1060px] w-full border-collapse text-left text-sm">
        <caption className="sr-only">Facturas centralizadas y normalizadas desde SIGProv</caption>
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className="px-5 py-3 font-semibold">Factura</th>
            <th scope="col" className="px-5 py-3 font-semibold">Proveedor</th>
            <th scope="col" className="px-5 py-3 text-right font-semibold">Total</th>
            <th scope="col" className="px-5 py-3 text-right font-semibold">Pagado</th>
            <th scope="col" className="px-5 py-3 text-right font-semibold">Saldo</th>
            <th scope="col" className="px-5 py-3 font-semibold">Vencimiento</th>
            <th scope="col" className="px-5 py-3 font-semibold">Estado</th>
            <th scope="col" className="px-5 py-3 font-semibold">Recibo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoices.map((invoice) => {
            const supplierName = invoice.suppliers?.canonical_name ?? invoice.supplier_name_raw;
            const needsReview = invoice.resolution_status === "pending";
            const hasUnresolvedSupplier = invoice.suppliers === null;

            return (
              <tr key={invoice.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-950">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="rounded-sm underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                  >
                    {invoice.invoice_number}
                  </Link>
                </td>
                <td className="px-5 py-4 text-slate-700">
                  <p className="font-medium text-slate-950">{supplierName}</p>
                  {hasUnresolvedSupplier ? <p className="mt-1 text-xs font-medium text-amber-800">Proveedor sin resolver</p> : null}
                  {needsReview ? <span className="mt-1 inline-block"><InvoiceResolutionStatus status="pending" /></span> : null}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right font-medium tabular-nums text-slate-950">{formatCurrency(invoice.amount)}</td>
                <td className="whitespace-nowrap px-5 py-4 text-right tabular-nums text-slate-700">{formatCurrency(invoice.paid_amount)}</td>
                <td className="whitespace-nowrap px-5 py-4 text-right font-medium tabular-nums text-slate-950">{formatCurrency(invoice.balance)}</td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                  <p>{formatCalendarDate(invoice.due_date)}</p>
                  <span className="mt-1 inline-block"><InvoiceDueStatus dueDate={invoice.due_date} balance={invoice.balance} /></span>
                </td>
                <td className="whitespace-nowrap px-5 py-4"><InvoicePaymentStatusBadge status={invoice.payment_status} /></td>
                <td className="whitespace-nowrap px-5 py-4"><InvoiceReceiptStatus generated={invoice.receipt_generated} compact /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
