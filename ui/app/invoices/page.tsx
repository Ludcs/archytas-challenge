import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

import { InvoiceKpis } from "@/components/invoices/invoice-kpis";
import { InvoicesTable } from "@/components/invoices/invoices-table";
import { getInvoices } from "@/lib/invoices/queries";
import { filterAndSortInvoices, getInvoiceAttentionMetrics, getInvoiceListFilter } from "@/lib/invoices/utils";

export const metadata: Metadata = { title: "Facturas | SIGProv" };

type InvoicesPageProps = {
  searchParams: Promise<{ status?: string | string[]; filter?: string | string[]; q?: string | string[] }>;
};

const filters = [
  { label: "Todas", value: "all" },
  { label: "Impagas", value: "unpaid" },
  { label: "Pago parcial", value: "partial" },
  { label: "Pagadas", value: "paid" },
  { label: "Vencidas", value: "overdue" },
] as const;

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const params = await searchParams;
  const firstValue = (value: string | string[] | undefined) => typeof value === "string" ? value : undefined;
  const status = firstValue(params.status);
  const dueFilter = firstValue(params.filter);
  const searchQuery = firstValue(params.q) ?? "";
  const selectedFilter = getInvoiceListFilter(status, dueFilter);
  const invoices = await getInvoices();
  const metrics = getInvoiceAttentionMetrics(invoices);
  const visibleInvoices = filterAndSortInvoices(invoices, selectedFilter, searchQuery);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="space-y-8">
        <header className="border-b border-slate-200 pb-7">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Facturas</h1>
          <p className="mt-2 text-base text-slate-600">Facturas centralizadas y normalizadas desde SIGProv.</p>
        </header>

        <InvoiceKpis invoices={invoices} />

        <section aria-labelledby="attention-heading" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 id="attention-heading" className="text-xl font-semibold text-slate-950">Requieren atención</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <AttentionMetric value={metrics.overdueWithoutReceipt} label="facturas vencidas sin recibo" />
            <AttentionMetric value={metrics.upcomingWithoutReceipt} label="facturas próximas a vencer sin recibo" />
            <AttentionMetric value={metrics.pendingResolution} label="facturas requieren revisión manual" />
          </dl>
        </section>

        <section aria-labelledby="invoices-heading" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="invoices-heading" className="text-xl font-semibold text-slate-950">Facturas</h2>
              <p className="mt-1 text-sm text-slate-600">Priorizadas por vencimiento y saldo pendiente.</p>
            </div>
            <form action="/invoices" method="get" className="w-full sm:max-w-sm">
              {selectedFilter !== "all" ? <input type="hidden" name={selectedFilter === "overdue" ? "filter" : "status"} value={selectedFilter === "overdue" ? "overdue" : selectedFilter} /> : null}
              <label htmlFor="invoice-search" className="sr-only">Buscar por factura o proveedor</label>
              <div className="flex gap-2">
                <input id="invoice-search" name="q" type="search" defaultValue={searchQuery} placeholder="Buscar por factura o proveedor..." className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-500 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2" />
                <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">Buscar</button>
              </div>
            </form>
          </div>
          <nav aria-label="Filtrar facturas" className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const href = new URLSearchParams();
              if (filter.value === "overdue") href.set("filter", "overdue");
              else if (filter.value !== "all") href.set("status", filter.value);
              if (searchQuery) href.set("q", searchQuery);
              const active = selectedFilter === filter.value;
              return <Link key={filter.value} href={href.size ? `/invoices?${href.toString()}` : "/invoices"} aria-current={active ? "page" : undefined} className={`rounded-md border px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-500 hover:text-slate-950"}`}>{filter.label}</Link>;
            })}
          </nav>
          <InvoicesTable invoices={visibleInvoices} />
        </section>
      </div>
    </main>
  );
}

function AttentionMetric({ value, label }: { value: number; label: string }) {
  return <div><dt className="text-2xl font-semibold tracking-tight text-slate-950">{value}</dt><dd className="mt-1 text-sm text-slate-600">{label}</dd></div>;
}
