"use client";

// Panel "Siguiente paso": botón de avanzar/firmar y lista exacta de lo que falta.

import { ArrowRight, CircleCheck, CornerUpLeft, Lock, Send, TriangleAlert } from "lucide-react";
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

export function PanelAvance({ vivienda, pendientes, modoPiloto, onAvanzar, onIrCampo }: Props) {
  if (vivienda.etapa === "traspasada") return null;
  const bloqueado = pendientes.length > 0 && !modoPiloto;
  const avisoPiloto = pendientes.length > 0 && modoPiloto;
  const esFirma = vivienda.etapa === "firma";
  const Icono = esFirma ? Send : ArrowRight;

  return (
    <div id="panel-avance" className="rounded-2xl border border-borde bg-papel p-5 shadow-suave">
      <p className="text-[13px] font-semibold uppercase tracking-wider text-tinta-tenue">Siguiente paso</p>
      <p className="mt-1 text-lg font-bold text-tinta">
        {esFirma ? "Firma y traspaso a reformas" : `De ${NOMBRE_ESTADO[vivienda.etapa]} a ${NOMBRE_ESTADO[siguienteEstado(vivienda.etapa)]}`}
      </p>

      {pendientes.length === 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-salvia-claro px-3 py-2.5 text-[15px] text-salvia-oscuro">
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{esFirma ? "Ficha completa. Al firmar se envía el traspaso a reformas automáticamente." : "Todos los campos obligatorios están completos."}</span>
        </div>
      )}

      {avisoPiloto && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-ambar-borde bg-ambar-claro px-3 py-2.5 text-[15px] text-ambar">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            <strong className="font-semibold">Modo piloto:</strong> {pendientes.length === 1 ? "falta 1 campo" : `faltan ${plural(pendientes.length, "campo")}`}. Puedes avanzar, pero
            quedará registrado.
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={onAvanzar}
        disabled={bloqueado}
        aria-describedby={bloqueado ? "lista-pendientes" : undefined}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-base font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta ${
          bloqueado
            ? "cursor-not-allowed bg-crema-oscuro text-tinta-tenue"
            : avisoPiloto
              ? "bg-ambar-borde text-tinta hover:bg-[#dcb54a]"
              : "bg-ladrillo text-white shadow-suave hover:bg-ladrillo-oscuro"
        }`}
      >
        {bloqueado ? <Lock className="size-4" aria-hidden /> : <Icono className="size-4" aria-hidden />}
        {textoBotonAvance(vivienda)}
      </button>

      {pendientes.length > 0 && (
        <div id="lista-pendientes" className="mt-4">
          <p className="mb-2 text-[15px] font-semibold text-tinta">
            {bloqueado ? "Para avanzar falta:" : "Campos pendientes:"} <span className="font-normal text-tinta-suave">({pendientes.length})</span>
          </p>
          <ul className="space-y-1.5">
            {pendientes.map((p) => (
              <li key={p.clave}>
                <button
                  type="button"
                  onClick={() => onIrCampo(p.clave)}
                  className="group flex w-full items-start gap-2.5 rounded-lg border border-ladrillo/25 bg-ladrillo-claro/50 px-3 py-2 text-left transition-colors hover:border-ladrillo/50 hover:bg-ladrillo-claro"
                >
                  {p.devuelto ? (
                    <CornerUpLeft className="mt-0.5 size-4 shrink-0 text-ladrillo" aria-hidden />
                  ) : (
                    <span className="mt-[7px] size-2 shrink-0 rounded-full bg-ladrillo" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-tinta group-hover:underline group-hover:underline-offset-2">{p.etiqueta}</span>
                    <span className="block text-sm text-tinta-suave">
                      {p.etapaId !== vivienda.etapa && `${p.etapaNombre} · `}
                      {p.devuelto ? "Devuelto por Reformas" : p.motivo}
                    </span>
                  </span>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-ladrillo opacity-60 group-hover:opacity-100" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Barra fija inferior en móvil con el botón de avance siempre a mano. */
export function BarraAvanceMovil({ vivienda, pendientes, modoPiloto, onAvanzar }: Omit<Props, "onIrCampo">) {
  if (vivienda.etapa === "traspasada") return null;
  const bloqueado = pendientes.length > 0 && !modoPiloto;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-papel/95 px-4 py-3 shadow-[0_-4px_16px_rgb(16_41_42/0.08)] backdrop-blur lg:hidden">
      <div className="flex items-center gap-3">
        {pendientes.length > 0 && (
          <button
            type="button"
            onClick={() => document.getElementById("panel-avance")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="shrink-0 text-left text-sm font-semibold text-ladrillo underline underline-offset-2"
          >
            {pendientes.length === 1 ? "Falta 1" : `Faltan ${pendientes.length}`}
          </button>
        )}
        <button
          type="button"
          onClick={onAvanzar}
          disabled={bloqueado}
          className={`flex-1 rounded-xl px-4 py-3 text-[15px] font-bold ${
            bloqueado ? "cursor-not-allowed bg-crema-oscuro text-tinta-tenue" : pendientes.length > 0 ? "bg-ambar-borde text-tinta" : "bg-ladrillo text-white"
          }`}
        >
          {textoBotonAvance(vivienda)}
        </button>
      </div>
    </div>
  );
}
