type InvoiceReceiptStatusProps = {
  generated: boolean;
  compact?: boolean;
};

export function InvoiceReceiptStatus({ generated, compact = false }: InvoiceReceiptStatusProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        generated
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      {compact ? (generated ? "Generado" : "Pendiente") : generated ? "Recibo generado" : "Recibo pendiente"}
    </span>
  );
}
