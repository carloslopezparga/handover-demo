"use client";

// Pantalla de error amable si algo falla al pintar una página.

import { TriangleAlert } from "lucide-react";
import { Boton, EstadoVacio } from "@/components/ui";

export default function ErrorPagina({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <EstadoVacio
      icono={<TriangleAlert className="size-8 text-ladrillo" />}
      titulo="Algo no ha ido bien"
      descripcion="Vuelve a intentarlo. Si el problema sigue, usa «Reiniciar demo» en la cabecera para restaurar los datos de ejemplo."
      accion={<Boton onClick={reset}>Reintentar</Boton>}
    />
  );
}
