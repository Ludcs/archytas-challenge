"use client";

type PricesErrorProps = {
  reset: () => void;
};

export default function PricesError({ reset }: PricesErrorProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="max-w-lg rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-950">No se pudieron cargar los precios</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Verificá la conexión con Supabase y que las variables de entorno requeridas estén configuradas.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Reintentar
        </button>
      </section>
    </main>
  );
}
