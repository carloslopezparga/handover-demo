"use client";

// PANTALLA 4 · Bandeja de reformas (módulo Reno): lista de traspasos con su estado.

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { InsigniaTraspaso } from "@/components/reformas/InsigniaTraspaso";
import { Cargando, EstadoVacio, Punto, TituloPagina } from "@/components/ui";
import { formatEuros, formatFechaHora } from "@/lib/format";
import { PARTIDAS_REFORMA } from "@/lib/stages";
import { useStore } from "@/lib/store";
import type { EstadoTraspaso } from "@/lib/types";

const FILTROS: { id: "todos" | EstadoTraspaso; etiqueta: string }[] = [
  { id: "todos", etiqueta: "Todos" },
  { id: "Pendiente de revisión", etiqueta: "Pendientes" },
  { id: "Aceptado", etiqueta: "Aceptados" },
  { id: "Devuelto a Supply", etiqueta: "Devueltos" },
];

const DIEZ_MINUTOS = 10 * 60 * 1000;

export default function BandejaReformasPage() {
  const { cargado, traspasos } = useStore();
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]["id"]>("todos");
  // Momento de la carga: sirve para marcar como "Nuevo" lo recibido hace poco.
  const [ahora] = useState(() => Date.now());

  if (!cargado) return <Cargando />;

  const ordenados = [...traspasos].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
  const visibles = filtro === "todos" ? ordenados : ordenados.filter((t) => t.estado === filtro);
  const contar = (id: (typeof FILTROS)[number]["id"]) => (id === "todos" ? traspasos.length : traspasos.filter((t) => t.estado === id).length);

  return (
    <>
      <TituloPagina
        antetitulo="Reno · Reformas"
        titulo="Bandeja de traspasos"
        descripcion="Cada vivienda firmada llega aquí automáticamente con su ficha completa."
      />

      <div className="desplazable mb-6 flex gap-6 overflow-x-auto border-b border-borde" role="tablist" aria-label="Filtrar por estado">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className={`-mb-px inline-flex h-10 shrink-0 items-center gap-2 border-b-2 text-[15px] font-medium transition-colors duration-150 ${
              filtro === f.id ? "border-tinta text-tinta" : "border-transparent text-tinta-tenue hover:text-tinta"
            }`}
          >
            {f.etiqueta}
            <span className="text-[13px] font-medium text-tinta-tenue tabular-nums">{contar(f.id)}</span>
          </button>
        ))}
      </div>

      {traspasos.length === 0 ? (
        <EstadoVacio ilustracion="bandeja" titulo="Todavía no hay traspasos" descripcion="Se crean automáticamente cuando Supply firma una vivienda." />
      ) : visibles.length === 0 ? (
        <EstadoVacio ilustracion="bandeja" titulo="No hay traspasos con este estado" />
      ) : (
        <ul className="divide-y divide-borde overflow-hidden rounded-xl border border-borde bg-white">
          {visibles.map((t) => {
            const partidas = Array.isArray(t.ficha.alcanceReforma) ? (t.ficha.alcanceReforma as string[]) : [];
            const nuevo = t.estado === "Pendiente de revisión" && ahora - new Date(t.creadoEn).getTime() < DIEZ_MINUTOS;
            return (
              <li key={t.id}>
                <Link href={`/reformas/${t.id}`} className="group flex items-center gap-4 px-4 py-4 transition-colors duration-150 hover:bg-crema/50 sm:gap-6 sm:px-6 sm:py-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <InsigniaTraspaso estado={t.estado} />
                      {nuevo && <span className="rounded-md border border-tinta/15 px-1.5 text-[12px] leading-5 font-semibold text-tinta">Nuevo</span>}
                      <span className="text-[13px] text-tinta-tenue tabular-nums">
                        {t.id} · recibido {formatFechaHora(t.creadoEn)}
                      </span>
                    </div>
                    <p className="mt-2 text-base leading-6 font-semibold text-tinta">
                      {(t.ficha.direccion as string) || "Sin dirección"}
                      {t.ficha.barrio ? <span className="block font-normal text-tinta-tenue sm:ml-2 sm:inline">{t.ficha.barrio as string}</span> : null}
                    </p>
                    <p className="mt-1 text-sm text-tinta-suave">
                      {partidas.length > 0 ? (
                        partidas.map((p) => PARTIDAS_REFORMA.find((x) => x.valor === p)?.etiqueta ?? p).join(" · ")
                      ) : (
                        <span className="inline-flex items-center gap-2 font-medium text-ladrillo">
                          <Punto tono="accion" />
                          Sin alcance definido
                        </span>
                      )}
                    </p>
                    {t.motivoDevolucion && (
                      <p className="mt-2 text-sm text-tinta-suave">
                        <span className="font-medium text-tinta">Motivo: {t.motivoDevolucion.campoEtiqueta}.</span> {t.motivoDevolucion.comentario}
                      </p>
                    )}
                  </div>
                  {t.ficha.costeReforma ? (
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="font-display text-xl leading-7 font-semibold text-tinta tabular-nums">{formatEuros(t.ficha.costeReforma as string)}</p>
                      <p className="text-[12px] text-tinta-tenue">coste estimado</p>
                    </div>
                  ) : null}
                  <ChevronRight className="size-5 shrink-0 text-tinta-tenue transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-tinta" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
