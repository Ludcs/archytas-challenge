import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ferreteria Cordillera",
  description: "Precios sincronizados automáticamente desde SIGProv.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
