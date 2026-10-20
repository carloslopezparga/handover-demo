"use client";

// Una etapa de la línea de tiempo de la ficha: nodo, cabecera plegable y sus campos.

import { ChevronDown } from "lucide-react";
import { formatFecha } from "@/lib/format";
import type { DefinicionEtapa, ValorCampo, Vivienda } from "@/lib/types";
import { progresoEtapa } from "@/lib/validation";
import { Pastilla, Segmentos } from "../ui";
import { CampoFicha } from "./CampoFicha";
import { NodoEtapa, type EstadoPaso } from "./PasosEtapas";

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
  /** Primera etapa: la línea empieza en su nodo. */
  primera?: boolean;
}

export function SeccionEtapa({ etapa, numero, estado, vivienda, abierta, onAlternar, onCambio, soloLectura, campoDevuelto, primera = false }: Props) {
  const { completos, total } = progresoEtapa(vivienda, etapa.id);
  const enCurso = estado === "en-curso";
  const conPendientes = completos < total || etapa.campos.some((c) => c.clave === campoDevuelto);
  const idCuerpo = `cuerpo-${etapa.id}`;
  const salida = [...vivienda.historial].reverse().find((e) => e.desde === etapa.id);

  let detalle = etapa.descripcion;
  let claseDetalle = "text-secundario-fondo";
  if (estado === "completada") {
    detalle = conPendientes ? "Completada con datos pendientes" : salida ? `Completada el ${formatFecha(salida.fecha)}` : "Completada";
    if (conPendientes) claseDetalle = "font-medium text-azul";
  }

  const claseRecuento = !conPendientes ? "text-marino" : estado === "bloqueada" ? "text-secundario-fondo" : "text-azul";

  return (
    <li id={`etapa-${etapa.id}`} className="relative grid grid-cols-[20px_minmax(0,1fr)] gap-x-4">
      <span
        className={`absolute bottom-0 left-[9.5px] w-px transition-colors duration-500 ${primera ? "top-6" : "top-0"} ${estado === "completada" ? "bg-marino/40" : "bg-borde-fuerte"}`}
        aria-hidden
      />
      <div className="pt-[14px]">
        <NodoEtapa estado={estado} numero={numero} conPendientes={conPendientes} />
      </div>

      <div className="min-w-0">
        <h2>
          <button
            type="button"
            onClick={onAlternar}
            aria-expanded={abierta}
            aria-controls={idCuerpo}
            className="group -mx-3 flex w-[calc(100%+24px)] items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 hover:bg-fondo-2/70"
          >
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={`font-display text-[19px] leading-6 font-semibold tracking-[-0.01em] ${estado === "bloqueada" ? "text-pizarra" : "text-tinta"}`}>
                  {etapa.nombre}
                </span>
                {enCurso && !soloLectura && <Pastilla tono="atencion">Etapa actual</Pastilla>}
              </span>
              <span className={`mt-0.5 block text-sm ${claseDetalle}`}>{detalle}</span>
            </span>
            <span className="mt-1 flex shrink-0 items-center gap-3">
              {total > 0 && <Segmentos completos={completos} total={total} listo={!conPendientes} className="hidden w-16 sm:flex xl:w-20" />}
              <span className={`text-[13px] leading-5 font-semibold tabular-nums ${claseRecuento}`}>
                <span key={completos} className="animar-cifra">
                  {completos}
                </span>
                /{total}
                <span className="sr-only"> campos obligatorios completos</span>
              </span>
            </span>
            <ChevronDown
              className={`mt-1 size-5 shrink-0 text-secundario-fondo transition-transform duration-200 ease-[var(--ease-suave)] group-hover:text-tinta ${abierta ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        </h2>

        {abierta && (
          <div
            id={idCuerpo}
            className={`@container animar-despliegue mt-1 mb-6 rounded-xl border bg-superficie p-4 sm:p-6 ${enCurso && !soloLectura ? "border-borde-fuerte/80 shadow-elevacion" : "border-borde shadow-suave"}`}
          >
            {estado === "bloqueada" && !soloLectura && (
              <p className="mb-6 rounded-lg bg-fondo px-3 py-2 text-sm text-pizarra">
                Etapa bloqueada hasta completar la anterior. Puedes adelantar datos: serán obligatorios para salir de esta etapa.
              </p>
            )}
            <div className="grid gap-x-6 gap-y-6 @lg:grid-cols-2">
              {etapa.campos.map((campo) => (
                <CampoFicha
                  key={campo.clave}
                  def={campo}
                  valor={vivienda.ficha[campo.clave] ?? null}
                  ficha={vivienda.ficha}
                  onCambio={(valor) => onCambio(campo.clave, valor)}
                  enEtapaFutura={estado === "bloqueada"}
                  soloLectura={soloLectura}
                  devuelto={campoDevuelto === campo.clave}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
