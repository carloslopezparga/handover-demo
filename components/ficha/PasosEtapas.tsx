// Línea de tiempo vertical de la ficha: estado de cada etapa (completada, en curso,
// bloqueada) y los nodos que la dibujan.

import { Check } from "lucide-react";
import { indiceEtapa } from "@/lib/stages";
import type { EtapaId, Vivienda } from "@/lib/types";

export type EstadoPaso = "completada" | "en-curso" | "bloqueada";

export function estadoPaso(v: Vivienda, etapaId: EtapaId): EstadoPaso {
  const actual = indiceEtapa(v.etapa);
  const i = indiceEtapa(etapaId);
  return i < actual ? "completada" : i === actual ? "en-curso" : "bloqueada";
}

/** Nodo de 20 px sobre la línea. Salvia solo si la etapa está completa de verdad. */
export function NodoEtapa({ estado, numero, conPendientes }: { estado: EstadoPaso; numero: number; conPendientes: boolean }) {
  const base = "relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full ring-4 ring-papel";
  if (estado === "completada" && !conPendientes)
    return (
      <span className={`${base} bg-salvia text-white`} aria-hidden>
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  if (estado === "completada" || estado === "en-curso")
    return (
      <span className={`${base} border-[1.5px] bg-papel ${estado === "completada" ? "border-ladrillo" : "border-tinta"}`} aria-hidden>
        <span className={`size-2 rounded-full ${estado === "completada" ? "bg-ladrillo" : "bg-tinta"}`} />
      </span>
    );
  return (
    <span className={`${base} border border-borde-fuerte bg-papel text-[11px] font-semibold text-tinta-tenue tabular-nums`} aria-hidden>
      {numero}
    </span>
  );
}

/** Último nodo: el traspaso a reformas. */
export function NodoFinal({ traspasada }: { traspasada: boolean }) {
  return traspasada ? (
    <span className="relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full bg-salvia text-white ring-4 ring-papel" aria-hidden>
      <Check className="size-3" strokeWidth={3} />
    </span>
  ) : (
    <span className="relative z-10 block size-5 shrink-0 rounded-full border border-dashed border-tinta-tenue/60 bg-papel ring-4 ring-papel" aria-hidden />
  );
}
