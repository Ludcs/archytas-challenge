import { getInvoiceDueStatus } from "@/lib/invoices/utils";

const classNames = {
  paid: "border-slate-200 bg-slate-50 text-slate-700",
  overdue: "border-red-200 bg-red-50 text-red-800",
  today: "border-amber-200 bg-amber-50 text-amber-800",
  upcoming: "border-slate-200 bg-slate-50 text-slate-700",
};

type InvoiceDueStatusProps = {
  dueDate: string;
  balance: number;
};

export function InvoiceDueStatus({ dueDate, balance }: InvoiceDueStatusProps) {
  const status = getInvoiceDueStatus({ due_date: dueDate, balance });

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classNames[status.type]}`}>{status.label}</span>;
}
