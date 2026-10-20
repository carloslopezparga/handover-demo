import type { EstadoTraspaso } from "@/lib/types";
import { Estado } from "../ui";

/** Estado del traspaso como texto con punto: ladrillo si espera revisión, salvia si se aceptó. */
export function InsigniaTraspaso({ estado, className = "" }: { estado: EstadoTraspaso; className?: string }) {
  if (estado === "Aceptado")
    return (
      <Estado tono="completo" className={className}>
        Aceptado
      </Estado>
    );
  if (estado === "Devuelto a Supply")
    return (
      <Estado tono="neutro" className={className}>
        Devuelto a Supply
      </Estado>
    );
  return (
    <Estado tono="accion" className={className}>
      Pendiente de revisión
    </Estado>
  );
}
