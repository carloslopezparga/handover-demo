// Línea de tiempo vertical de la ficha: estado de cada etapa (completada, en curso,
// bloqueada) y los nodos que la dibujan.

import { indiceEtapa } from "@/lib/stages";
import type { EtapaId, Vivienda } from "@/lib/types";
import { IconoCompleto } from "../ui";

export type EstadoPaso = "completada" | "en-curso" | "bloqueada";

export function estadoPaso(v: Vivienda, etapaId: EtapaId): EstadoPaso {
  const actual = indiceEtapa(v.etapa);
  const i = indiceEtapa(etapaId);
  return i < actual ? "completada" : i === actual ? "en-curso" : "bloqueada";
}

const BASE = "relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full ring-4 ring-fondo";

/** Nodo de 20 px sobre la línea: marino con check si está completa, azul si es la actual. */
export function NodoEtapa({ estado, numero, conPendientes }: { estado: EstadoPaso; numero: number; conPendientes: boolean }) {
  if (estado === "completada" && !conPendientes)
    return (
      <span className={`${BASE} rounded-full`} aria-hidden>
        <IconoCompleto className="size-5" />
      </span>
    );
  if (estado === "en-curso")
    return (
      <span className={`${BASE} bg-azul shadow-[0_0_0_4px_var(--color-fondo),0_0_0_7px_rgb(37_99_235/0.18)]`} aria-hidden>
        <span className="size-2 rounded-full bg-white" />
      </span>
    );
  if (estado === "completada")
    return (
      <span className={`${BASE} border-[1.5px] border-azul bg-superficie`} aria-hidden>
        <span className="size-2 rounded-full bg-azul" />
      </span>
    );
  return (
    <span className={`${BASE} border border-borde-fuerte bg-superficie text-[11px] font-semibold text-secundario tabular-nums`} aria-hidden>
      {numero}
    </span>
  );
}

/** Último nodo: el traspaso a reformas. */
export function NodoFinal({ traspasada }: { traspasada: boolean }) {
  return traspasada ? (
    <span className={BASE} aria-hidden>
      <IconoCompleto className="size-5" animar />
    </span>
  ) : (
    <span className={`${BASE} border border-dashed border-secundario/60 bg-fondo`} aria-hidden />
  );
}
