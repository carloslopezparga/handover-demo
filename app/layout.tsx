import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { NotificacionesProvider } from "@/components/Notificaciones";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

// Source Serif 4 para títulos y cifras grandes (casa con el Georgia de la presentación); Inter para la interfaz.
const serif = Source_Serif_4({ subsets: ["latin"], axes: ["opsz"], variable: "--font-serif", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Traspaso · Supply (prototipo)",
  description: "Prototipo de ficha única de vivienda con campos obligatorios por etapa y traspaso automático a reformas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1220",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${serif.variable} ${inter.variable}`}>
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
