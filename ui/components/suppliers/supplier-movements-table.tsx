import type { SupplierAccountMovement } from "@/lib/suppliers/types";
import { formatCalendarDate, formatCurrency } from "@/lib/invoices/utils";

type SupplierMovementsTableProps = {
  movements: SupplierAccountMovement[];
};

function formatMovementAmount(value: number): string {
  return value === 0 ? "—" : formatCurrency(value);
}

export function SupplierMovementsTable({ movements }: SupplierMovementsTableProps) {
  if (movements.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
        No hay movimientos registrados para este proveedor.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[800px] w-full border-collapse text-left text-sm">
        <caption className="sr-only">Movimientos de cuenta corriente del proveedor</caption>
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className="px-5 py-3 font-semibold">Fecha</th>
            <th scope="col" className="px-5 py-3 font-semibold">Tipo</th>
            <th scope="col" className="px-5 py-3 font-semibold">Referencia</th>
            <th scope="col" className="px-5 py-3 text-right font-semibold">Debe</th>
            <th scope="col" className="px-5 py-3 text-right font-semibold">Haber</th>
            <th scope="col" className="px-5 py-3 text-right font-semibold">Saldo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {movements.map((movement) => (
            <tr key={movement.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-5 py-4 text-slate-700">{formatCalendarDate(movement.movement_date)}</td>
              <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-950">{movement.movement_type}</td>
              <td className="whitespace-nowrap px-5 py-4 text-slate-700">{movement.reference}</td>
              <td className="whitespace-nowrap px-5 py-4 text-right tabular-nums text-slate-700">{formatMovementAmount(movement.debe)}</td>
              <td className="whitespace-nowrap px-5 py-4 text-right tabular-nums text-slate-700">{formatMovementAmount(movement.haber)}</td>
              <td className="whitespace-nowrap px-5 py-4 text-right font-medium tabular-nums text-slate-950">{formatCurrency(movement.saldo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
