import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guarda",
  description:
    "Asistente que detecta riesgos en combinaciones de medicamentos",
  icons: {
    icon: "/orb.svg",
    apple: "/orb.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="flex min-h-dvh items-center justify-center bg-neutral-100">
        {children}
      </body>
    </html>
  );
}
