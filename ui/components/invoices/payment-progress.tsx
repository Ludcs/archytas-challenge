import { getPaymentPercentage } from "@/lib/invoices/utils";

type PaymentProgressProps = {
  amount: number;
  paidAmount: number;
};

export function PaymentProgress({ amount, paidAmount }: PaymentProgressProps) {
  const percentage = getPaymentPercentage({ amount, paid_amount: paidAmount });
  const roundedPercentage = Math.round(percentage);

  return (
    <div>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label="Progreso de pago"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={roundedPercentage}
      >
        <div className="h-full rounded-full bg-slate-900" style={{ width: `${percentage}%` }} />
      </div>
      <p className="mt-2 text-sm font-medium text-slate-700">{roundedPercentage}% pagado</p>
    </div>
  );
}
