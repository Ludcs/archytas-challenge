import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ferretería Industrial Cordillera",
  description: "Sistema de gestión operativa de precios, facturas y proveedores.",
};

const modules = [
  {
    title: "Precios",
    description: "Consultá los precios actuales y su historial de sincronización.",
    href: "/prices",
    linkLabel: "Ver precios",
  },
  {
    title: "Facturas",
    description: "Revisá estados de pago, vencimientos y recibos.",
    href: "/invoices",
    linkLabel: "Ver facturas",
  },
  {
    title: "Proveedores",
    description: "Consultá proveedores, saldos y movimientos de cuenta corriente.",
    href: "/suppliers",
    linkLabel: "Ver proveedores",
  },
] as const;

export default function Home() {
  const currentDate = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="space-y-8">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Ferretería Industrial Cordillera
            </h1>
            <p className="mt-3 text-lg font-medium text-slate-800">Sistema de gestión operativa</p>
            <p className="mt-2 text-base text-slate-600">
              Información centralizada de precios, facturas y proveedores.
            </p>
          </div>
          <p className="whitespace-nowrap text-sm text-slate-600">Hoy es {currentDate}</p>
        </header>

        <section aria-label="Módulos principales" className="grid gap-4 md:grid-cols-3">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              <article className="flex h-full flex-col">
                <h2 className="text-xl font-semibold text-slate-950">{module.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
                <span className="mt-6 text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 group-hover:text-slate-950 group-hover:decoration-slate-900">
                  {module.linkLabel} <span aria-hidden="true">→</span>
                </span>
              </article>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
