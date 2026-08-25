import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { ProductDetail } from "@/components/prices/product-detail";
import { getProductById, getProductPriceHistory } from "@/lib/prices/queries";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const history = await getProductPriceHistory(product.id);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Link
        href="/prices"
        className="inline-flex rounded-sm text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950 hover:decoration-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
      >
        Volver a precios
      </Link>
      <div className="mt-6">
        <ProductDetail product={product} history={history} />
      </div>
    </main>
  );
}
