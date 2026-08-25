type InvoiceResolutionStatusProps = {
  status: "resolved" | "pending";
};

export function InvoiceResolutionStatus({ status }: InvoiceResolutionStatusProps) {
  const resolved = status === "resolved";

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
        resolved
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      {resolved ? "Resuelto automáticamente" : "Requiere revisión"}
    </span>
  );
}
