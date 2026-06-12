import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Golazo - Mundial 2026",
  description: "Plataforma de torneos de fútbol",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
} 
