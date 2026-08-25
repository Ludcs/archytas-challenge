import type {
  Invoice,
  InvoiceAttentionMetrics,
  InvoiceDueStatus,
  InvoiceListFilter,
} from "./types";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const calendarDateFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dayInMilliseconds = 24 * 60 * 60 * 1000;

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** Parses SQL date strings as calendar dates, never as local timestamps. */
export function parseCalendarDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Invalid calendar date: ${value}`);
  }

  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

export function formatCalendarDate(value: string): string {
  return calendarDateFormatter.format(parseCalendarDate(value));
}

export function formatDateTime(value: string | null): string {
  return value ? dateTimeFormatter.format(new Date(value)) : "Sin registro";
}

function getTodayCalendarDate(): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value;

  return new Date(Date.UTC(Number(part("year")), Number(part("month")) - 1, Number(part("day"))));
}

function differenceInCalendarDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / dayInMilliseconds);
}

export function getInvoiceDueStatus(invoice: Pick<Invoice, "due_date" | "balance">): InvoiceDueStatus {
  if (invoice.balance <= 0) {
    return { type: "paid", label: "Pagada" };
  }

  const daysUntilDue = differenceInCalendarDays(getTodayCalendarDate(), parseCalendarDate(invoice.due_date));

  if (daysUntilDue < 0) {
    const overdueDays = Math.abs(daysUntilDue);
    return {
      type: "overdue",
      days: overdueDays,
      label: `Vencida hace ${overdueDays} ${overdueDays === 1 ? "día" : "días"}`,
    };
  }

  if (daysUntilDue === 0) {
    return { type: "today", label: "Vence hoy" };
  }

  return {
    type: "upcoming",
    days: daysUntilDue,
    label: `Vence en ${daysUntilDue} ${daysUntilDue === 1 ? "día" : "días"}`,
  };
}

export function getPaymentPercentage(invoice: Pick<Invoice, "amount" | "paid_amount">): number {
  if (invoice.amount <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (invoice.paid_amount / invoice.amount) * 100));
}

export function getInvoiceAttentionMetrics(invoices: Invoice[]): InvoiceAttentionMetrics {
  return invoices.reduce<InvoiceAttentionMetrics>(
    (metrics, invoice) => {
      const dueStatus = getInvoiceDueStatus(invoice);
      const isOutstanding = invoice.balance > 0;

      if (isOutstanding && !invoice.receipt_generated && dueStatus.type === "overdue") {
        metrics.overdueWithoutReceipt += 1;
      }
      if (
        isOutstanding &&
        !invoice.receipt_generated &&
        (dueStatus.type === "today" || (dueStatus.type === "upcoming" && (dueStatus.days ?? 0) <= 7))
      ) {
        metrics.upcomingWithoutReceipt += 1;
      }
      if (invoice.resolution_status === "pending") {
        metrics.pendingResolution += 1;
      }

      return metrics;
    },
    { overdueWithoutReceipt: 0, upcomingWithoutReceipt: 0, pendingResolution: 0 },
  );
}

export function filterAndSortInvoices(
  invoices: Invoice[],
  filter: InvoiceListFilter,
  searchQuery: string,
): Invoice[] {
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("es-AR");

  return invoices
    .filter((invoice) => {
      const dueStatus = getInvoiceDueStatus(invoice);
      const matchesFilter =
        filter === "all" ||
        (filter === "unpaid" && invoice.payment_status === "Impaga") ||
        (filter === "partial" && invoice.payment_status === "Pago parcial") ||
        (filter === "paid" && invoice.payment_status === "Pagada") ||
        (filter === "overdue" && dueStatus.type === "overdue");
      const searchableValues = [
        invoice.invoice_number,
        invoice.suppliers?.canonical_name ?? "",
        invoice.supplier_name_raw,
      ];

      return matchesFilter && searchableValues.some((value) => value.toLocaleLowerCase("es-AR").includes(normalizedQuery));
    })
    .sort((first, second) => {
      const firstDue = getInvoiceDueStatus(first);
      const secondDue = getInvoiceDueStatus(second);
      const urgency = (status: InvoiceDueStatus) => {
        if (status.type === "overdue") return 0;
        if (status.type === "today" || (status.type === "upcoming" && (status.days ?? 0) <= 7)) return 1;
        return 2;
      };
      const urgencyDifference = urgency(firstDue) - urgency(secondDue);

      return urgencyDifference || parseCalendarDate(first.due_date).getTime() - parseCalendarDate(second.due_date).getTime();
    });
}

export function getInvoiceListFilter(
  status: string | undefined,
  dueFilter: string | undefined,
): InvoiceListFilter {
  if (dueFilter === "overdue") return "overdue";
  if (status === "unpaid" || status === "partial" || status === "paid") return status;
  return "all";
}
