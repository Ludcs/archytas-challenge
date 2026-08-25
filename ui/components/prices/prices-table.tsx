import Link from "next/link";

import type { Product } from "@/lib/prices/types";
import { formatCurrency } from "@/lib/prices/utils";

type PricesTableProps = {
  products: Product[];
};

export function PricesTable({ products }: PricesTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
        No hay productos sincronizados todavía.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[760px] w-full border-collapse text-left text-sm">
        <caption className="sr-only">Productos sincronizados desde SIGProv</caption>
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className="px-5 py-3 font-semibold">Código</th>
            <th scope="col" className="px-5 py-3 font-semibold">Producto</th>
            <th scope="col" className="px-5 py-3 font-semibold">Categoría</th>
            <th scope="col" className="px-5 py-3 text-right font-semibold">Precio</th>
            <th scope="col" className="px-5 py-3 text-right font-semibold">Stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-700">
                {product.external_code}
              </td>
              <td className="px-5 py-4 font-medium text-slate-950">
                <Link
                  href={`/prices/${product.id}`}
                  className="rounded-sm underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  {product.description}
                </Link>
              </td>
              <td className="px-5 py-4 text-slate-600">
                {product.category_raw ?? "Sin categoría"}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-right font-medium tabular-nums text-slate-950">
                {formatCurrency(product.current_price)}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-right tabular-nums text-slate-700">
                {product.stock ?? "Sin dato"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
