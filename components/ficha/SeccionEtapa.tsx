"use client";

// Bloque plegable con los campos de una etapa.

import { ChevronDown, CircleCheck, Lock } from "lucide-react";
import type { DefinicionEtapa, ValorCampo, Vivienda } from "@/lib/types";
import { progresoEtapa } from "@/lib/validation";
import { CampoFicha } from "./CampoFicha";
import type { EstadoPaso } from "./PasosEtapas";

interface Props {
  etapa: DefinicionEtapa;
  numero: number;
  estado: EstadoPaso;
  vivienda: Vivienda;
  abierta: boolean;
  onAlternar: () => void;
  onCambio: (clave: string, valor: ValorCampo) => void;
  soloLectura: boolean;
  /** Campo devuelto por Reformas y aún sin revisar. */
  campoDevuelto?: string;
}

export function SeccionEtapa({ etapa, numero, estado, vivienda, abierta, onAlternar, onCambio, soloLectura, campoDevuelto }: Props) {
  const { completos, total } = progresoEtapa(vivienda, etapa.id);
  const completa = completos === total;
  const enCurso = estado === "en-curso";
  const idCuerpo = `cuerpo-${etapa.id}`;

  return (
    <section
      id={`etapa-${etapa.id}`}
      className={`overflow-hidden rounded-2xl border bg-papel transition-shadow ${enCurso && !soloLectura ? "border-tinta/25 shadow-elevada" : "border-borde shadow-suave"}`}
    >
      <h2>
        <button
          type="button"
          onClick={onAlternar}
          aria-expanded={abierta}
          aria-controls={idCuerpo}
          className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-crema/60 sm:px-5"
        >
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${
              estado === "completada" ? "bg-salvia-claro text-salvia-oscuro" : enCurso ? "bg-tinta text-crema" : "bg-crema-oscuro text-tinta-tenue"
            }`}
            aria-hidden
          >
            {estado === "bloqueada" ? <Lock className="size-3.5" /> : numero}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="text-[17px] font-bold text-tinta">{etapa.nombre}</span>
              {enCurso && !soloLectura && <span className="rounded-full bg-ladrillo px-2 py-0.5 text-[12px] font-bold uppercase tracking-wide text-white">Etapa actual</span>}
            </span>
            <span className="mt-0.5 block text-sm text-tinta-suave">{etapa.descripcion}</span>
          </span>
          <span className={`hidden shrink-0 items-center gap-1.5 text-sm font-semibold sm:flex ${completa ? "text-salvia" : estado === "bloqueada" ? "text-tinta-tenue" : "text-ladrillo"}`}>
            {completa && <CircleCheck className="size-4" aria-hidden />}
            {completos}/{total} obligatorios
          </span>
          <ChevronDown className={`size-5 shrink-0 text-tinta-tenue transition-transform ${abierta ? "rotate-180" : ""}`} aria-hidden />
        </button>
      </h2>

      {abierta && (
        <div id={idCuerpo} className="border-t border-borde px-2 pt-3 pb-4 sm:px-3">
          {estado === "bloqueada" && !soloLectura && (
            <p className="mx-2 mb-3 rounded-lg bg-crema px-3 py-2 text-sm text-tinta-suave">
              Etapa bloqueada hasta completar la anterior. Puedes adelantar datos: serán obligatorios para salir de esta etapa.
            </p>
          )}
          <div className="grid gap-2 md:grid-cols-2">
            {etapa.campos.map((campo) => (
              <CampoFicha
                key={campo.clave}
                def={campo}
                valor={vivienda.ficha[campo.clave] ?? null}
                ficha={vivienda.ficha}
                onCambio={(valor) => onCambio(campo.clave, valor)}
                enEtapaActual={enCurso}
                enEtapaFutura={estado === "bloqueada"}
                soloLectura={soloLectura}
                devuelto={campoDevuelto === campo.clave}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
