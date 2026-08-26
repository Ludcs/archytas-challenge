import Link from "next/link";

export default function SupplierNotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-950">Proveedor no encontrado</h1>
        <p className="mt-2 text-sm text-slate-600">El proveedor no existe o ya no está disponible en la última sincronización.</p>
        <Link
          href="/suppliers"
          className="mt-5 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Volver a proveedores
        </Link>
      </section>
    </main>
  );
}
