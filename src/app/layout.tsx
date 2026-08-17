import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Prode Liga RDA",
  description: "Pronósticos de la Liga Interna de Age of Empires II RDA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-rda-bg font-sans text-rda-text">
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
          <footer className="mx-auto max-w-5xl px-4 pb-8 pt-4 text-center text-xs text-rda-muted">
            RDA · Liga Interna de Age · Prode entre amigos
          </footer>
        </Providers>
      </body>
    </html>
  );
}
