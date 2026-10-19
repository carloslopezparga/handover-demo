import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/AppShell";
import { NotificacionesProvider } from "@/components/Notificaciones";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vistral · Supply (prototipo)",
  description: "Prototipo de ficha única de vivienda con campos obligatorios por etapa y traspaso automático a reformas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10292A",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
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
