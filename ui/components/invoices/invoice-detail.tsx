import { InvoiceDueStatus } from "@/components/invoices/invoice-due-status";
import { InvoicePaymentStatusBadge } from "@/components/invoices/invoice-payment-status-badge";
import { InvoiceReceiptStatus } from "@/components/invoices/invoice-receipt-status";
import { InvoiceResolutionStatus } from "@/components/invoices/invoice-resolution-status";
import { PaymentProgress } from "@/components/invoices/payment-progress";
import type { Invoice } from "@/lib/invoices/types";
import { formatCalendarDate, formatCurrency, formatDateTime, getInvoiceDueStatus } from "@/lib/invoices/utils";

type InvoiceDetailProps = {
  invoice: Invoice;
};

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const supplier = invoice.suppliers;
  const dueStatus = getInvoiceDueStatus(invoice);
  const requiresReceiptAttention =
    !invoice.receipt_generated && (dueStatus.type === "overdue" || dueStatus.type === "today" || (dueStatus.days ?? 8) <= 7);

  return (
    <article className="space-y-8">
      <header className="border-b border-slate-200 pb-6">
        <p className="font-mono text-sm font-medium text-slate-600">Factura</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{invoice.invoice_number}</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          <InvoicePaymentStatusBadge status={invoice.payment_status} />
          <InvoiceDueStatus dueDate={invoice.due_date} balance={invoice.balance} />
          <InvoiceReceiptStatus generated={invoice.receipt_generated} />
        </div>
      </header>

      <section aria-labelledby="supplier-heading" className="space-y-4">
        <h2 id="supplier-heading" className="text-xl font-semibold text-slate-950">Proveedor</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailCard label="Proveedor canónico" value={supplier?.canonical_name ?? "Sin resolver"} prominent />
          <DetailCard label="CUIT" value={supplier?.cuit ?? "Sin CUIT registrado"} />
          <DetailCard label="Email" value={supplier?.email ?? "Sin email registrado"} />
          <DetailCard label="Nombre recibido desde SIGProv" value={invoice.supplier_name_raw} />
        </div>
      </section>

      <section aria-labelledby="payment-heading" className="space-y-4">
        <div>
          <h2 id="payment-heading" className="text-xl font-semibold text-slate-950">Estado de pago</h2>
          <p className="mt-1 text-sm text-slate-600">Importes informados por la factura centralizada.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <DetailCard label="Monto total" value={formatCurrency(invoice.amount)} prominent />
          <DetailCard label="Pagado" value={formatCurrency(invoice.paid_amount)} prominent />
          <DetailCard label="Saldo pendiente" value={formatCurrency(invoice.balance)} prominent />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><PaymentProgress amount={invoice.amount} paidAmount={invoice.paid_amount} /></div>
      </section>

      <section aria-labelledby="dates-heading" className="space-y-4">
        <h2 id="dates-heading" className="text-xl font-semibold text-slate-950">Fechas</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <DetailCard label="Fecha de factura" value={formatCalendarDate(invoice.invoice_date)} />
          <DetailCard label="Vencimiento" value={formatCalendarDate(invoice.due_date)} />
          <DetailCard label="Estado actual" value={dueStatus.label} />
        </div>
      </section>

      <section aria-labelledby="receipt-heading" className="space-y-4">
        <h2 id="receipt-heading" className="text-xl font-semibold text-slate-950">Recibo</h2>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <InvoiceReceiptStatus generated={invoice.receipt_generated} />
          {requiresReceiptAttention ? <p className="mt-3 text-sm text-slate-700">Esta factura requiere atención.</p> : null}
        </div>
      </section>

      <section aria-labelledby="resolution-heading" className="space-y-4">
        <h2 id="resolution-heading" className="text-xl font-semibold text-slate-950">Resolución del proveedor</h2>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <InvoiceResolutionStatus status={invoice.resolution_status} />
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <Metadata label={invoice.resolution_status === "resolved" ? "Nombre original" : "Nombre recibido"} value={invoice.supplier_name_raw} />
            {invoice.resolution_status === "resolved" ? <Metadata label="Proveedor asociado" value={supplier?.canonical_name ?? "Sin resolver"} /> : null}
            <Metadata label={invoice.resolution_status === "resolved" ? "Detalle" : "Motivo"} value={invoice.resolution_note ?? "Sin detalle registrado"} />
          </dl>
        </div>
      </section>

      <section aria-labelledby="source-heading" className="space-y-4">
        <div>
          <h2 id="source-heading" className="text-xl font-semibold text-slate-950">Datos de origen</h2>
          <p className="mt-1 text-sm text-slate-600">Metadata registrada por SIGProv.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Metadata label="Tipo de archivo" value={invoice.file_type ?? "Sin dato"} />
            <Metadata label="Referencia de producto" value={invoice.product_external_id ?? "Sin dato"} />
            <Metadata label="Producto recibido" value={invoice.product_text_raw ?? "Sin dato"} />
            <Metadata label="Última sincronización" value={formatDateTime(invoice.last_synced_at)} />
          </dl>
        </div>
      </section>
    </article>
  );
}

type DetailCardProps = { label: string; value: string; prominent?: boolean };
function DetailCard({ label, value, prominent = false }: DetailCardProps) {
  return <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-600">{label}</p><p className={`mt-2 break-words font-semibold text-slate-950 ${prominent ? "text-3xl tracking-tight" : "text-lg"}`}>{value}</p></div>;
}

type MetadataProps = { label: string; value: string };
function Metadata({ label, value }: MetadataProps) {
  return <div><dt className="text-sm font-medium text-slate-600">{label}</dt><dd className="mt-1 break-words text-sm text-slate-950">{value}</dd></div>;
}
