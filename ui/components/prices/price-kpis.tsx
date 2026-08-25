import type { SyncRun, SyncRunStatus } from "@/lib/prices/types";
import { formatRelativeDate } from "@/lib/prices/utils";

const syncStatusPresentation: Record<
  SyncRunStatus,
  { label: string; indicatorClassName: string }
> = {
  running: { label: "En curso", indicatorClassName: "bg-amber-500" },
  success: { label: "Exitoso", indicatorClassName: "bg-emerald-500" },
  partial: { label: "Parcial", indicatorClassName: "bg-amber-500" },
  failed: { label: "Fallido", indicatorClassName: "bg-red-500" },
};

type PriceKpisProps = {
  productCount: number;
  latestSuccessfulSync: SyncRun | null;
  latestSync: SyncRun | null;
};

export function PriceKpis({
  productCount,
  latestSuccessfulSync,
  latestSync,
}: PriceKpisProps) {
  const latestSyncDate = latestSuccessfulSync?.finished_at ?? latestSuccessfulSync?.started_at ?? null;
  const statusPresentation = latestSync
    ? syncStatusPresentation[latestSync.status]
    : null;

  return (
    <dl className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <dt className="text-sm font-medium text-slate-600">Productos</dt>
        <dd className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          {productCount}
        </dd>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <dt className="text-sm font-medium text-slate-600">Último sync</dt>
        <dd className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
          {formatRelativeDate(latestSyncDate)}
        </dd>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <dt className="text-sm font-medium text-slate-600">Estado sync</dt>
        <dd className="mt-3 flex items-center gap-2 text-base font-semibold text-slate-950">
          {statusPresentation ? (
            <>
              <span
                className={`size-2 rounded-full ${statusPresentation.indicatorClassName}`}
                aria-hidden="true"
              />
              {statusPresentation.label}
            </>
          ) : (
            <>
              <span className="size-2 rounded-full bg-slate-400" aria-hidden="true" />
              Sin sincronizaciones
            </>
          )}
        </dd>
      </div>
    </dl>
  );
}
