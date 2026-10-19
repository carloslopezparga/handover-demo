"use client";

// Columna izquierda de la ficha: las 5 etapas con su estado (completada, en curso, bloqueada).

import { Check, Lock, Send } from "lucide-react";
import { ETAPAS, indiceEtapa } from "@/lib/stages";
import type { EtapaId, Vivienda } from "@/lib/types";
import { progresoEtapa } from "@/lib/validation";

export type EstadoPaso = "completada" | "en-curso" | "bloqueada";

export function estadoPaso(v: Vivienda, etapaId: EtapaId): EstadoPaso {
  const actual = indiceEtapa(v.etapa);
  const i = indiceEtapa(etapaId);
  return i < actual ? "completada" : i === actual ? "en-curso" : "bloqueada";
}

const TEXTO_ESTADO: Record<EstadoPaso, string> = {
  completada: "Completada",
  "en-curso": "En curso",
  bloqueada: "Bloqueada",
};

export function PasosEtapas({ vivienda, onIr }: { vivienda: Vivienda; onIr: (etapa: EtapaId) => void }) {
  const traspasada = vivienda.etapa === "traspasada";
  return (
    <>
      {/* Escritorio: lista vertical */}
      <nav aria-label="Etapas de la vivienda" className="hidden lg:block">
        <ol className="relative">
          {ETAPAS.map((etapa, i) => {
            const estado = estadoPaso(vivienda, etapa.id);
            const { completos, total } = progresoEtapa(vivienda, etapa.id);
            return (
              <li key={etapa.id} className="relative pb-2">
                <span className="absolute top-10 bottom-0 left-[19px] w-0.5 bg-borde" aria-hidden />
                <button
                  type="button"
                  onClick={() => onIr(etapa.id)}
                  aria-current={estado === "en-curso" ? "step" : undefined}
                  className={`relative flex w-full items-start gap-3 rounded-xl p-1.5 text-left transition-colors hover:bg-crema-oscuro/70 ${estado === "en-curso" ? "bg-papel shadow-suave ring-1 ring-borde" : ""}`}
                >
                  <IconoPaso estado={estado} numero={i + 1} />
                  <span className="pt-1">
                    <span className={`block font-semibold ${estado === "bloqueada" ? "text-tinta-tenue" : "text-tinta"}`}>{etapa.nombre}</span>
                    {estado === "completada" && completos < total ? (
                      <span className="block text-[13px] font-semibold text-ladrillo">Completada · faltan datos</span>
                    ) : (
                      <span className={`block text-[13px] ${estado === "en-curso" ? "font-semibold text-ladrillo" : "text-tinta-tenue"}`}>
                        {TEXTO_ESTADO[estado]}
                        {estado === "en-curso" && ` · ${completos}/${total}`}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
          <li className="relative">
            <div className="flex items-start gap-3 p-1.5">
              <span
                className={`flex size-[30px] shrink-0 items-center justify-center rounded-full ${traspasada ? "bg-salvia text-white" : "border-2 border-dashed border-borde-fuerte text-tinta-tenue"}`}
                aria-hidden
              >
                <Send className="size-3.5" />
              </span>
              <span className="pt-1">
                <span className={`block font-semibold ${traspasada ? "text-tinta" : "text-tinta-tenue"}`}>Reformas</span>
                <span className="block text-[13px] text-tinta-tenue">{traspasada ? "Traspasada" : "Al firmar"}</span>
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Móvil: fila horizontal compacta */}
      <nav aria-label="Etapas de la vivienda" className="-mx-4 overflow-x-auto px-4 lg:hidden">
        <ol className="flex min-w-max gap-1.5">
          {ETAPAS.map((etapa, i) => {
            const estado = estadoPaso(vivienda, etapa.id);
            return (
              <li key={etapa.id}>
                <button
                  type="button"
                  onClick={() => onIr(etapa.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${
                    estado === "en-curso"
                      ? "border-tinta bg-tinta text-crema"
                      : estado === "completada"
                        ? "border-salvia/30 bg-salvia-claro text-salvia-oscuro"
                        : "border-borde bg-papel text-tinta-tenue"
                  }`}
                >
                  {estado === "completada" ? <Check className="size-3.5" aria-hidden /> : estado === "bloqueada" ? <Lock className="size-3" aria-hidden /> : <span>{i + 1}</span>}
                  {etapa.nombre}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

function IconoPaso({ estado, numero }: { estado: EstadoPaso; numero: number }) {
  if (estado === "completada")
    return (
      <span className="relative z-10 flex size-[30px] shrink-0 items-center justify-center rounded-full bg-salvia text-white" aria-hidden>
        <Check className="size-4" strokeWidth={3} />
      </span>
    );
  if (estado === "en-curso")
    return (
      <span className="relative z-10 flex size-[30px] shrink-0 items-center justify-center rounded-full bg-ladrillo text-[14px] font-bold text-white ring-4 ring-ladrillo/15" aria-hidden>
        {numero}
      </span>
    );
  return (
    <span className="relative z-10 flex size-[30px] shrink-0 items-center justify-center rounded-full border border-borde-fuerte bg-crema text-tinta-tenue" aria-hidden>
      <Lock className="size-3.5" />
    </span>
  );
}
