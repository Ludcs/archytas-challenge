import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { InvoiceDetail } from "@/components/invoices/invoice-detail";
import { getInvoiceById, isInvoiceId } from "@/lib/invoices/queries";

type InvoiceDetailPageProps = { params: Promise<{ id: string }> };

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  if (!isInvoiceId(id)) notFound();
  const invoice = await getInvoiceById(id);
  if (!invoice) notFound();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Link href="/invoices" className="inline-flex rounded-sm text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950 hover:decoration-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">Volver a facturas</Link>
      <div className="mt-6"><InvoiceDetail invoice={invoice} /></div>
    </main>
  );
}
