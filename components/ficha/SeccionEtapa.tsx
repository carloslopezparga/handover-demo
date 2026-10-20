"use client";

// Una etapa de la línea de tiempo de la ficha: nodo, cabecera plegable y sus campos.

import { ChevronDown } from "lucide-react";
import { formatFecha } from "@/lib/format";
import type { DefinicionEtapa, ValorCampo, Vivienda } from "@/lib/types";
import { progresoEtapa } from "@/lib/validation";
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
  let claseDetalle = "text-tinta-tenue";
  if (estado === "completada") {
    detalle = conPendientes ? "Completada con datos pendientes" : salida ? `Completada el ${formatFecha(salida.fecha)}` : "Completada";
    if (conPendientes) claseDetalle = "font-medium text-ladrillo";
  }

  const claseRecuento = !conPendientes ? "text-salvia" : estado === "bloqueada" ? "text-tinta-tenue" : "text-ladrillo";

  return (
    <li id={`etapa-${etapa.id}`} className="relative grid grid-cols-[20px_minmax(0,1fr)] gap-x-4">
      <span className={`absolute bottom-0 left-[9.5px] w-px bg-borde ${primera ? "top-6" : "top-0"}`} aria-hidden />
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
            className="group -mx-3 flex w-[calc(100%+24px)] items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 hover:bg-crema-oscuro/40"
          >
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline gap-x-3">
                <span className={`font-display text-lg leading-6 font-semibold tracking-[-0.01em] ${estado === "bloqueada" ? "text-tinta-suave" : "text-tinta"}`}>
                  {etapa.nombre}
                </span>
                {enCurso && !soloLectura && <span className="text-[13px] font-medium text-tinta-tenue">Etapa actual</span>}
              </span>
              <span className={`mt-0.5 block text-sm ${claseDetalle}`}>{detalle}</span>
            </span>
            <span className={`mt-0.5 text-[13px] leading-5 font-semibold tabular-nums ${claseRecuento}`}>
              {completos}/{total}
              <span className="sr-only"> campos obligatorios completos</span>
            </span>
            <ChevronDown
              className={`mt-0.5 size-5 shrink-0 text-tinta-tenue transition-transform duration-200 group-hover:text-tinta ${abierta ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        </h2>

        {abierta && (
          <div id={idCuerpo} className={`@container animar-despliegue mt-1 mb-6 rounded-xl border bg-white p-4 sm:p-6 ${enCurso && !soloLectura ? "border-borde-fuerte shadow-suave" : "border-borde"}`}>
            {estado === "bloqueada" && !soloLectura && (
              <p className="mb-6 text-sm text-tinta-tenue">
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
