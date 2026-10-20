import { CornerUpLeft } from "lucide-react";
import type { EstadoTraspaso } from "@/lib/types";
import { Estado } from "../ui";

/** Estado del traspaso: azul si espera revisión, marino con check si se aceptó, gris si se devolvió. */
export function InsigniaTraspaso({ estado, className = "" }: { estado: EstadoTraspaso; className?: string }) {
  if (estado === "Aceptado")
    return (
      <Estado tono="completo" className={className}>
        Aceptado
      </Estado>
    );
  if (estado === "Devuelto a Supply")
    return (
      <Estado tono="neutro" className={className} icono={<CornerUpLeft className="size-3.5 shrink-0" aria-hidden />}>
        Devuelto a Supply
      </Estado>
    );
  return (
    <Estado tono="accion" className={className}>
      Pendiente de revisión
    </Estado>
  );
}
