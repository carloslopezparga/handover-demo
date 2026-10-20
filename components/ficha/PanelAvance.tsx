"use client";

// Panel «Siguiente paso»: qué falta exactamente para avanzar y el botón de avanzar/firmar.
// Es el protagonista de la ficha: cifra grande de lo que falta, lista clicable y botón principal.

import { ArrowRight, CornerUpLeft, Lock, Send, TriangleAlert } from "lucide-react";
import type { CSSProperties } from "react";
import { plural } from "@/lib/format";
import { NOMBRE_ESTADO, siguienteEstado } from "@/lib/stages";
import type { Vivienda } from "@/lib/types";
import { progresoEtapa, type CampoPendiente } from "@/lib/validation";
import { comportamientoScroll } from "../movimiento";
import { CheckExito, Segmentos } from "../ui";

interface Props {
  vivienda: Vivienda;
  pendientes: CampoPendiente[];
  modoPiloto: boolean;
  onAvanzar: () => void;
  onIrCampo: (clave: string) => void;
}

export function textoBotonAvance(v: Vivienda): string {
  if (v.etapa === "traspasada") return "";
  if (v.etapa === "firma") return "Firmar y enviar a reformas";
  return `Avanzar a ${NOMBRE_ESTADO[siguienteEstado(v.etapa)]}`;
}

/** Color del botón de avance según el estado: bloqueado, aviso de modo piloto o listo. */
function claseBotonAvance(bloqueado: boolean, avisoPiloto: boolean): string {
  if (bloqueado) return "cursor-not-allowed border border-borde bg-fondo-2 text-secundario-fondo";
  if (avisoPiloto) return "bg-piloto text-white shadow-suave hover:brightness-90 active:translate-y-px";
  return "bg-azul text-white shadow-suave hover:bg-azul-hover active:translate-y-px";
}

function IconoBoton({ bloqueado, avisoPiloto, esFirma }: { bloqueado: boolean; avisoPiloto: boolean; esFirma: boolean }) {
  if (bloqueado) return <Lock className="size-4" aria-hidden />;
  if (avisoPiloto) return <TriangleAlert className="size-4" aria-hidden />;
  const Icono = esFirma ? Send : ArrowRight;
  return <Icono className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />;
}

export function PanelAvance({ vivienda, pendientes, modoPiloto, onAvanzar, onIrCampo }: Props) {
  if (vivienda.etapa === "traspasada") return null;
  const bloqueado = pendientes.length > 0 && !modoPiloto;
  const avisoPiloto = pendientes.length > 0 && modoPiloto;
  const esFirma = vivienda.etapa === "firma";
  const etapaActual = NOMBRE_ESTADO[vivienda.etapa];
  const { completos, total } = progresoEtapa(vivienda, vivienda.etapa);

  return (
    <section id="panel-avance" aria-labelledby="titulo-avance" className="overflow-hidden rounded-xl border border-borde bg-superficie shadow-elevacion">
      <div className="p-5 sm:p-6">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-azul">
          <span className="size-1.5 rounded-full bg-azul" aria-hidden />
          Siguiente paso
        </p>
        <h2 id="titulo-avance" className="mt-2 font-display text-2xl leading-7 font-semibold tracking-[-0.01em] text-tinta">
          {esFirma ? "Firma y traspaso a reformas" : `De ${etapaActual} a ${NOMBRE_ESTADO[siguienteEstado(vivienda.etapa)]}`}
        </h2>

        {pendientes.length > 0 ? (
          <>
            <div className="mt-6 flex items-end gap-4" aria-live="polite">
              <span
                key={pendientes.length}
                className={`animar-cifra font-display text-[64px] leading-[0.8] font-semibold tracking-[-0.02em] tabular-nums ${avisoPiloto ? "text-piloto" : "text-azul"}`}
              >
                {pendientes.length}
              </span>
              <p className="text-[15px] leading-5 text-pizarra">
                {pendientes.length === 1 ? "campo obligatorio" : "campos obligatorios"}
                <br />
                {bloqueado ? "sin completar" : "pendientes (modo piloto)"}
              </p>
            </div>

            <div className="mt-6">
              <p className="mb-2 flex items-baseline justify-between gap-2 text-[13px]">
                <span className="text-secundario">Obligatorios de {etapaActual}</span>
                <span className="font-semibold text-pizarra tabular-nums">
                  {completos} de {total}
                </span>
              </p>
              <Segmentos completos={completos} total={total} listo={false} grosor="h-1.5" />
            </div>

            <div id="lista-pendientes" className="mt-6 border-t border-borde pt-5">
              <p className="mb-2 text-[13px] font-medium text-secundario">{bloqueado ? "Para avanzar falta" : "Campos pendientes"}</p>
              <ul className="-mx-2 space-y-0.5 lg:max-h-[min(40vh,400px)] lg:overflow-y-auto">
                {pendientes.map((p, i) => (
                  <li key={p.clave} className="animar-entrada" style={{ "--retraso": `${i * 40}ms` } as CSSProperties}>
                    <button
                      type="button"
                      onClick={() => onIrCampo(p.clave)}
                      className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors duration-150 hover:bg-azul-claro/40"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-azul-claro/70 text-azul-hover">
                        {p.devuelto ? <CornerUpLeft className="size-3.5" aria-hidden /> : <span className="size-1.5 rounded-full bg-azul" aria-hidden />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] leading-5 font-medium text-tinta">{p.etiqueta}</span>
                        <span className="block text-[13px] leading-5 text-secundario-fondo">
                          {p.etapaId !== vivienda.etapa && `${p.etapaNombre} · `}
                          {p.devuelto ? "Devuelto por Reformas" : p.motivo}
                        </span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-secundario transition-[transform,color] duration-150 group-hover:translate-x-0.5 group-hover:text-azul" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 flex items-center gap-4" aria-live="polite">
              <CheckExito className="size-12" />
              <div>
                <p className="text-[17px] leading-6 font-semibold text-marino">Todo listo</p>
                <p className="text-sm text-pizarra">
                  {esFirma ? "Ficha completa. Al firmar se envía el traspaso a reformas automáticamente." : `Los campos obligatorios de ${etapaActual} están completos.`}
                </p>
              </div>
            </div>
            <Segmentos completos={completos} total={total} grosor="h-1.5" className="mt-6" />
          </>
        )}
      </div>

      <div className="hidden border-t border-borde p-5 sm:p-6 lg:block">
        <button
          type="button"
          onClick={onAvanzar}
          disabled={bloqueado}
          aria-describedby={bloqueado ? "lista-pendientes" : undefined}
          className={`group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-4 text-base font-semibold transition-[background-color,color,filter,transform] duration-150 ${claseBotonAvance(bloqueado, avisoPiloto)}`}
        >
          <IconoBoton bloqueado={bloqueado} avisoPiloto={avisoPiloto} esFirma={esFirma} />
          {textoBotonAvance(vivienda)}
        </button>
        <p className="mt-3 text-center text-[13px] text-balance text-secundario">
          {bloqueado
            ? "Se desbloquea al completar los campos de la lista."
            : avisoPiloto
              ? `Quedará registrado que avanzas con ${plural(pendientes.length, "campo")} pendiente${pendientes.length === 1 ? "" : "s"}.`
              : esFirma
                ? "Se crea el traspaso con una copia de la ficha y se avisa al coordinador."
                : "El cambio de etapa queda en el historial."}
        </p>
      </div>
    </section>
  );
}

/** Barra fija inferior en móvil con el botón de avance siempre a mano. */
export function BarraAvanceMovil({ vivienda, pendientes, modoPiloto, onAvanzar }: Omit<Props, "onIrCampo">) {
  if (vivienda.etapa === "traspasada") return null;
  const bloqueado = pendientes.length > 0 && !modoPiloto;
  const avisoPiloto = pendientes.length > 0 && modoPiloto;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-superficie/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgb(11_18_32/0.15)] backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-4">
        {pendientes.length > 0 && (
          <button
            type="button"
            onClick={() => document.getElementById("panel-avance")?.scrollIntoView({ behavior: comportamientoScroll(), block: "start" })}
            className={`flex shrink-0 items-center gap-2 rounded text-left text-sm font-semibold ${avisoPiloto ? "text-piloto" : "text-azul"}`}
          >
            <span className={`size-2 rounded-full ${avisoPiloto ? "bg-piloto" : "bg-azul"}`} aria-hidden />
            <span className="underline decoration-current/30 underline-offset-4">
              {pendientes.length === 1 ? "Falta" : "Faltan"}{" "}
              <span key={pendientes.length} className="animar-cifra tabular-nums">
                {pendientes.length}
              </span>
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={onAvanzar}
          disabled={bloqueado}
          className={`group inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-[15px] font-semibold transition-[background-color,color,filter,transform] ${claseBotonAvance(bloqueado, avisoPiloto)}`}
        >
          <IconoBoton bloqueado={bloqueado} avisoPiloto={avisoPiloto} esFirma={vivienda.etapa === "firma"} />
          <span className="truncate">{textoBotonAvance(vivienda)}</span>
        </button>
      </div>
    </div>
  );
}
