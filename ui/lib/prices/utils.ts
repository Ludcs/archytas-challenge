const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | null): string {
  return value ? dateTimeFormatter.format(new Date(value)) : "Sin registro";
}

export function formatRelativeDate(value: string | null): string {
  if (!value) {
    return "Sin sincronizaciones";
  }

  const differenceInMinutes = Math.round(
    (new Date(value).getTime() - Date.now()) / (1000 * 60),
  );
  const relativeFormatter = new Intl.RelativeTimeFormat("es-AR", {
    numeric: "auto",
  });

  if (Math.abs(differenceInMinutes) < 60) {
    return relativeFormatter.format(differenceInMinutes, "minute");
  }

  const differenceInHours = Math.round(differenceInMinutes / 60);
  if (Math.abs(differenceInHours) < 24) {
    return relativeFormatter.format(differenceInHours, "hour");
  }

  return relativeFormatter.format(Math.round(differenceInHours / 24), "day");
}
