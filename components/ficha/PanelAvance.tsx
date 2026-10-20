"use client";

// Panel «Siguiente paso»: qué falta exactamente para avanzar y el botón de avanzar/firmar.

import { ArrowRight, Check, CornerUpLeft, Lock, Send } from "lucide-react";
import { plural } from "@/lib/format";
import { NOMBRE_ESTADO, siguienteEstado } from "@/lib/stages";
import type { Vivienda } from "@/lib/types";
import type { CampoPendiente } from "@/lib/validation";

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
  if (bloqueado) return "cursor-not-allowed bg-crema-oscuro text-tinta-tenue";
  if (avisoPiloto) return "bg-ambar-borde text-tinta hover:bg-[#d6b04c]";
  return "bg-ladrillo text-white hover:bg-ladrillo-oscuro";
}

export function PanelAvance({ vivienda, pendientes, modoPiloto, onAvanzar, onIrCampo }: Props) {
  if (vivienda.etapa === "traspasada") return null;
  const bloqueado = pendientes.length > 0 && !modoPiloto;
  const avisoPiloto = pendientes.length > 0 && modoPiloto;
  const esFirma = vivienda.etapa === "firma";
  const Icono = esFirma ? Send : ArrowRight;
  const etapaActual = NOMBRE_ESTADO[vivienda.etapa];

  return (
    <section id="panel-avance" aria-labelledby="titulo-avance" className="rounded-xl border border-borde bg-white p-5 shadow-suave sm:p-6">
      <p className="text-[13px] font-medium text-tinta-tenue">Siguiente paso</p>
      <h2 id="titulo-avance" className="mt-1 font-display text-[22px] leading-7 font-semibold tracking-[-0.015em] text-tinta">
        {esFirma ? "Firma y traspaso a reformas" : `De ${etapaActual} a ${NOMBRE_ESTADO[siguienteEstado(vivienda.etapa)]}`}
      </h2>

      {pendientes.length > 0 ? (
        <>
          <div className="mt-6 flex items-center gap-4">
            <span className={`font-display text-5xl leading-none font-semibold tracking-[-0.03em] tabular-nums ${avisoPiloto ? "text-ambar" : "text-ladrillo"}`}>
              {pendientes.length}
            </span>
            <p className="text-[15px] leading-5 text-tinta-suave">
              {pendientes.length === 1 ? "campo obligatorio" : "campos obligatorios"}
              <br />
              {bloqueado ? "sin completar" : "pendientes (modo piloto)"}
            </p>
          </div>

          <div id="lista-pendientes" className="mt-6">
            <p className="mb-2 text-[13px] font-medium text-tinta-tenue">{bloqueado ? "Para avanzar falta" : "Campos pendientes"}</p>
            <ul className="-mx-2 space-y-0.5 lg:max-h-[min(44vh,420px)] lg:overflow-y-auto">
              {pendientes.map((p) => (
                <li key={p.clave}>
                  <button
                    type="button"
                    onClick={() => onIrCampo(p.clave)}
                    className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors duration-150 hover:bg-crema/80"
                  >
                    {p.devuelto ? (
                      <CornerUpLeft className="size-3.5 shrink-0 text-ladrillo" strokeWidth={2.25} aria-hidden />
                    ) : (
                      <span className="mx-[3px] size-2 shrink-0 rounded-full bg-ladrillo" aria-hidden />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] leading-5 font-medium text-tinta">{p.etiqueta}</span>
                      <span className="block text-[13px] leading-5 text-tinta-tenue">
                        {p.etapaId !== vivienda.etapa && `${p.etapaNombre} · `}
                        {p.devuelto ? "Devuelto por Reformas" : p.motivo}
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-tinta-tenue transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-tinta" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="mt-6 flex items-start gap-3">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-salvia text-white" aria-hidden>
            <Check className="size-3.5" strokeWidth={3} />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-salvia">Todo listo</p>
            <p className="text-sm text-tinta-suave">
              {esFirma ? "Ficha completa. Al firmar se envía el traspaso a reformas automáticamente." : `Los campos obligatorios de ${etapaActual} están completos.`}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 hidden lg:block">
        <button
          type="button"
          onClick={onAvanzar}
          disabled={bloqueado}
          aria-describedby={bloqueado ? "lista-pendientes" : undefined}
          className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-4 text-base font-semibold transition-colors duration-150 ${claseBotonAvance(bloqueado, avisoPiloto)}`}
        >
          {bloqueado ? <Lock className="size-4" aria-hidden /> : <Icono className="size-4" aria-hidden />}
          {textoBotonAvance(vivienda)}
        </button>
        <p className="mt-3 text-center text-[13px] text-balance text-tinta-tenue">
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
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-papel/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-4">
        {pendientes.length > 0 && (
          <button
            type="button"
            onClick={() => document.getElementById("panel-avance")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="flex shrink-0 items-center gap-2 text-left text-sm font-semibold text-ladrillo"
          >
            <span className="size-2 rounded-full bg-ladrillo" aria-hidden />
            <span className="underline decoration-ladrillo/30 underline-offset-4">{pendientes.length === 1 ? "Falta 1" : `Faltan ${pendientes.length}`}</span>
          </button>
        )}
        <button
          type="button"
          onClick={onAvanzar}
          disabled={bloqueado}
          className={`inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-[15px] font-semibold transition-colors ${claseBotonAvance(bloqueado, avisoPiloto)}`}
        >
          {bloqueado && <Lock className="size-4" aria-hidden />}
          {textoBotonAvance(vivienda)}
        </button>
      </div>
    </div>
  );
}
