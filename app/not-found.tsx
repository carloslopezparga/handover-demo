import { SearchX } from "lucide-react";
import { BotonEnlace, EstadoVacio } from "@/components/ui";

export default function NoEncontrado() {
  return (
    <EstadoVacio
      icono={<SearchX className="size-8" />}
      titulo="Esta página no existe"
      descripcion="Revisa el enlace o vuelve al embudo de Supply."
      accion={<BotonEnlace href="/">Ir al embudo</BotonEnlace>}
    />
  );
}
