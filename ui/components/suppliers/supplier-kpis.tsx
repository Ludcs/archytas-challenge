import { formatCurrency } from "@/lib/invoices/utils";

type SupplierKpisProps = {
  supplierCount: number;
  totalDebt: number;
  suppliersWithDebt: number;
};

export function SupplierKpis({
  supplierCount,
  totalDebt,
  suppliersWithDebt,
}: SupplierKpisProps) {
  const values = [
    { label: "Proveedores", value: supplierCount.toString() },
    { label: "Deuda total", value: formatCurrency(totalDebt) },
    { label: "Con deuda", value: suppliersWithDebt.toString() },
  ];

  return (
    <dl className="grid gap-4 md:grid-cols-3">
      {values.map((item) => (
        <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <dt className="text-sm font-medium text-slate-600">{item.label}</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
