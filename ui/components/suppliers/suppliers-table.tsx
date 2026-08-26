import Link from "next/link";

import type { Supplier } from "@/lib/suppliers/types";
import { formatPaymentTerms } from "@/lib/suppliers/utils";
import { formatCurrency } from "@/lib/invoices/utils";

type SuppliersTableProps = {
  suppliers: Supplier[];
};

export function SuppliersTable({ suppliers }: SuppliersTableProps) {
  if (suppliers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
        No hay proveedores sincronizados todavía.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[900px] w-full border-collapse text-left text-sm">
        <caption className="sr-only">Proveedores consolidados y normalizados desde SIGProv</caption>
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className="px-5 py-3 font-semibold">Proveedor</th>
            <th scope="col" className="px-5 py-3 font-semibold">CUIT</th>
            <th scope="col" className="px-5 py-3 font-semibold">Email</th>
            <th scope="col" className="px-5 py-3 font-semibold">Condición de pago</th>
            <th scope="col" className="px-5 py-3 text-right font-semibold">Saldo actual</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {suppliers.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-slate-50">
              <td className="px-5 py-4 font-medium text-slate-950">
                <Link
                  href={`/suppliers/${supplier.id}`}
                  className="rounded-sm underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  {supplier.canonical_name}
                </Link>
              </td>
              <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-700">{supplier.cuit}</td>
              <td className="px-5 py-4 text-slate-600">{supplier.email ?? "Sin email registrado"}</td>
              <td className="whitespace-nowrap px-5 py-4 text-slate-700">{formatPaymentTerms(supplier.payment_terms_days)}</td>
              <td className="whitespace-nowrap px-5 py-4 text-right font-medium tabular-nums text-slate-950">{formatCurrency(supplier.current_balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
