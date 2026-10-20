"use client";

// Pantalla de error amable si algo falla al pintar una página.

import { Boton, EstadoVacio } from "@/components/ui";

export default function ErrorPagina({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <EstadoVacio
      ilustracion="aviso"
      titulo="Algo no ha ido bien"
      descripcion="Vuelve a intentarlo. Si el problema sigue, usa «Reiniciar demo» para restaurar los datos de ejemplo."
      accion={<Boton onClick={reset}>Reintentar</Boton>}
    />
  );
}
