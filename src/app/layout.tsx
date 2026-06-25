import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "B. Medical - Gestion des Dossiers Médicaux",
  description: "Système de gestion relationnel des dossiers médicaux pour la polyclinique B. Medical à Lubumbashi, RD Congo.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
