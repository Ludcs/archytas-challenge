export default function InvoiceDetailLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="animate-pulse space-y-8" aria-busy="true" aria-live="polite">
        <div className="h-5 w-32 rounded bg-slate-200" />
        <div className="space-y-3 border-b border-slate-200 pb-6"><div className="h-4 w-20 rounded bg-slate-200" /><div className="h-10 w-48 rounded bg-slate-200" /></div>
        <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-28 rounded-lg border border-slate-200 bg-white" />)}</div>
        <div className="h-48 rounded-lg border border-slate-200 bg-white" />
      </div>
      <p className="sr-only">Cargando factura…</p>
    </main>
  );
}
