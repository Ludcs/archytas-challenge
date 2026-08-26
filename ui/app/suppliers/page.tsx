import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import { SupplierKpis } from "@/components/suppliers/supplier-kpis";
import { SuppliersTable } from "@/components/suppliers/suppliers-table";
import { getSuppliers } from "@/lib/suppliers/queries";

export const metadata: Metadata = { title: "Proveedores" };

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();
  const totalDebt = suppliers.reduce((total, supplier) => total + supplier.current_balance, 0);
  const suppliersWithDebt = suppliers.filter((supplier) => supplier.current_balance > 0).length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="space-y-8">
        <header className="border-b border-slate-200 pb-7">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Proveedores</h1>
          <p className="mt-2 text-base text-slate-600">Proveedores consolidados y normalizados desde SIGProv.</p>
        </header>

        <SupplierKpis
          supplierCount={suppliers.length}
          totalDebt={totalDebt}
          suppliersWithDebt={suppliersWithDebt}
        />

        <section aria-labelledby="suppliers-heading" className="space-y-4">
          <div>
            <h2 id="suppliers-heading" className="text-xl font-semibold text-slate-950">Proveedores</h2>
            <p className="mt-1 text-sm text-slate-600">Identidades canónicas sincronizadas desde SIGProv.</p>
          </div>
          <SuppliersTable suppliers={suppliers} />
        </section>
      </div>
    </main>
  );
}
