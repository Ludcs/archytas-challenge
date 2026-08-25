import type { PriceHistoryEntry, Product } from "@/lib/prices/types";
import { formatCurrency, formatDateTime } from "@/lib/prices/utils";

import { PriceHistoryChart } from "./price-history-chart";

type ProductDetailProps = {
  product: Product;
  history: PriceHistoryEntry[];
};

export function ProductDetail({ product, history }: ProductDetailProps) {
  return (
    <article className="space-y-8">
      <header className="border-b border-slate-200 pb-6">
        <p className="font-mono text-sm font-medium text-slate-600">{product.external_code}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {product.description}
        </h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailCard label="Precio actual" value={formatCurrency(product.current_price)} prominent />
        <DetailCard label="Categoría" value={product.category_raw ?? "Sin categoría"} />
        <DetailCard label="Subcategoría" value={product.subcategory_raw ?? "Sin subcategoría"} />
        <DetailCard label="Stock" value={product.stock?.toString() ?? "Sin dato"} />
        <DetailCard label="Última sincronización" value={formatDateTime(product.last_synced_at)} />
      </div>

      <section aria-labelledby="price-history-heading" className="space-y-4">
        <div>
          <h2 id="price-history-heading" className="text-xl font-semibold text-slate-950">
            Evolución del precio
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Historial registrado por las sincronizaciones de SIGProv.
          </p>
        </div>
        <PriceHistoryChart history={history} />
      </section>
    </article>
  );
}

type DetailCardProps = {
  label: string;
  value: string;
  prominent?: boolean;
};

function DetailCard({ label, value, prominent = false }: DetailCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className={`mt-2 break-words font-semibold text-slate-950 ${prominent ? "text-3xl tracking-tight" : "text-lg"}`}>
        {value}
      </p>
    </div>
  );
}
