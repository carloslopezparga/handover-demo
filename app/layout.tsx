import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { NotificacionesProvider } from "@/components/Notificaciones";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

// Bricolage Grotesque para títulos y cifras; Inter para el texto.
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz"], variable: "--font-bricolage", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Vistral · Supply (prototipo)",
  description: "Prototipo de ficha única de vivienda con campos obligatorios por etapa y traspaso automático a reformas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F5F1E8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${bricolage.variable} ${inter.variable}`}>
      <body>
        <StoreProvider>
          <NotificacionesProvider>
            <AppShell>{children}</AppShell>
          </NotificacionesProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
