import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import { PriceKpis } from "@/components/prices/price-kpis";
import { PriceSyncButton } from "@/components/prices/price-sync-button";
import { PricesTable } from "@/components/prices/prices-table";
import {
  getLatestPriceSync,
  getLatestSuccessfulPriceSync,
  getProducts,
} from "@/lib/prices/queries";
import { formatDate, formatDateTime } from "@/lib/prices/utils";

export const metadata: Metadata = {
  title: "Precios",
};

export default async function PricesPage() {
  const [products, latestSuccessfulSync, latestSync] = await Promise.all([
    getProducts(),
    getLatestSuccessfulPriceSync(),
    getLatestPriceSync(),
  ]);
  const syncDate = latestSuccessfulSync?.finished_at ?? latestSuccessfulSync?.started_at ?? null;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="space-y-8">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Precios
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Precios sincronizados automáticamente desde SIGProv.
            </p>
            <div className="mt-5 text-sm text-slate-600">
              <p className="font-medium text-slate-800">Última sincronización exitosa</p>
              <p className="mt-1">
                {latestSuccessfulSync && syncDate
                  ? `${formatDate(syncDate)} · ${latestSuccessfulSync.rows_received} productos procesados`
                  : "Todavía no hay sincronizaciones exitosas registradas."}
              </p>
            </div>
          </div>
          <PriceSyncButton />
        </header>

        <PriceKpis
          productCount={products.length}
          latestSuccessfulSync={latestSuccessfulSync}
          latestSync={latestSync}
        />

        <section aria-labelledby="products-heading" className="space-y-4">
          <div>
            <h2 id="products-heading" className="text-xl font-semibold text-slate-950">
              Productos
            </h2>
            {latestSuccessfulSync ? (
              <p className="mt-1 text-sm text-slate-600">
                Datos actualizados por la última sincronización exitosa el {formatDateTime(syncDate)}.
              </p>
            ) : null}
          </div>
          <PricesTable products={products} />
        </section>
      </div>
    </main>
  );
}
