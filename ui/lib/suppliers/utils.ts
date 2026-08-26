export function formatPaymentTerms(value: number | null): string {
  return value === null ? "Sin condición registrada" : `${value} ${value === 1 ? "día" : "días"}`;
}
