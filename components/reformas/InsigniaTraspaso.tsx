import { CircleCheck, Clock, CornerUpLeft } from "lucide-react";
import type { EstadoTraspaso } from "@/lib/types";
import { Insignia } from "../ui";

export function InsigniaTraspaso({ estado }: { estado: EstadoTraspaso }) {
  if (estado === "Aceptado")
    return (
      <Insignia tono="exito">
        <CircleCheck className="size-3.5" aria-hidden />
        Aceptado
      </Insignia>
    );
  if (estado === "Devuelto a Supply")
    return (
      <Insignia tono="alerta">
        <CornerUpLeft className="size-3.5" aria-hidden />
        Devuelto a Supply
      </Insignia>
    );
  return (
    <Insignia tono="aviso">
      <Clock className="size-3.5" aria-hidden />
      Pendiente de revisión
    </Insignia>
  );
}
