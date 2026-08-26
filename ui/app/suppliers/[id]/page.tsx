import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { SupplierMovementsTable } from "@/components/suppliers/supplier-movements-table";
import { getSupplierAccountMovements, getSupplierById, isSupplierId } from "@/lib/suppliers/queries";
import { formatPaymentTerms } from "@/lib/suppliers/utils";
import { formatCurrency, formatDateTime } from "@/lib/invoices/utils";

type SupplierDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SupplierDetailPage({ params }: SupplierDetailPageProps) {
  const { id } = await params;
  if (!isSupplierId(id)) notFound();

  const supplier = await getSupplierById(id);
  if (!supplier) notFound();

  const movements = await getSupplierAccountMovements(supplier.id);
  const totalPurchased = movements.reduce((total, movement) => total + movement.debe, 0);
  const totalPaid = movements.reduce((total, movement) => total + movement.haber, 0);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Link
        href="/suppliers"
        className="inline-flex rounded-sm text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950 hover:decoration-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
      >
        Volver a proveedores
      </Link>
      <article className="mt-6 space-y-8">
        <header className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{supplier.canonical_name}</h1>
          <p className="mt-3 text-sm text-slate-600">{supplier.cuit} · {supplier.email ?? "Sin email registrado"} · {supplier.phone ?? "Sin teléfono registrado"}</p>
          <p className="mt-2 text-sm text-slate-600">Condición de pago: {formatPaymentTerms(supplier.payment_terms_days)}</p>
          <Link
            href={`/invoices?q=${encodeURIComponent(supplier.canonical_name)}`}
            className="mt-4 inline-flex rounded-sm text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950 hover:decoration-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            Ver facturas de este proveedor
          </Link>
        </header>

        <dl className="grid gap-4 sm:grid-cols-3">
          <DetailCard label="Comprado" value={formatCurrency(totalPurchased)} />
          <DetailCard label="Pagado" value={formatCurrency(totalPaid)} />
          <DetailCard label="Saldo actual" value={formatCurrency(supplier.current_balance)} />
        </dl>

        <section aria-labelledby="supplier-details-heading" className="space-y-4">
          <h2 id="supplier-details-heading" className="text-xl font-semibold text-slate-950">Datos del proveedor</h2>
          <dl className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
            <Metadata label="CUIT" value={supplier.cuit} />
            <Metadata label="Email" value={supplier.email ?? "Sin email registrado"} />
            <Metadata label="Teléfono" value={supplier.phone ?? "Sin teléfono registrado"} />
            <Metadata label="Dirección" value={supplier.address ?? "Sin dirección registrada"} />
            <Metadata label="Condición de pago" value={formatPaymentTerms(supplier.payment_terms_days)} />
            <Metadata label="Última sincronización" value={formatDateTime(supplier.last_synced_at)} />
          </dl>
        </section>

        <section aria-labelledby="supplier-account-heading" className="space-y-4">
          <div>
            <h2 id="supplier-account-heading" className="text-xl font-semibold text-slate-950">Cuenta corriente</h2>
            <p className="mt-1 text-sm text-slate-600">Movimientos sincronizados desde SIGProv.</p>
          </div>
          <SupplierMovementsTable movements={movements} />
        </section>
      </article>
    </main>
  );
}

type DetailCardProps = { label: string; value: string };

function DetailCard({ label, value }: DetailCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <dt className="text-sm font-medium text-slate-600">{label}</dt>
      <dd className="mt-2 break-words text-3xl font-semibold tracking-tight text-slate-950">{value}</dd>
    </div>
  );
}

type MetadataProps = { label: string; value: string };

function Metadata({ label, value }: MetadataProps) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-600">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-950">{value}</dd>
    </div>
  );
}
