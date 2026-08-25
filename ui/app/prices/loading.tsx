export default function PricesLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="animate-pulse space-y-8" aria-busy="true" aria-live="polite">
        <div className="space-y-3 border-b border-slate-200 pb-7">
          <div className="h-10 w-40 rounded bg-slate-200" />
          <div className="h-5 w-80 max-w-full rounded bg-slate-200" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 rounded-lg border border-slate-200 bg-white" />
          ))}
        </div>
        <div className="h-72 rounded-lg border border-slate-200 bg-white" />
      </div>
      <p className="sr-only">Cargando precios…</p>
    </main>
  );
}
