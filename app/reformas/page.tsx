"use client";

// PANTALLA 4 · Bandeja de reformas (módulo de Reformas): lista de traspasos con su estado.

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { InsigniaTraspaso } from "@/components/reformas/InsigniaTraspaso";
import { Cargando, EstadoVacio, Pastilla, Punto, TituloPagina } from "@/components/ui";
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

  if (!cargado) return <Cargando tipo="lista" />;

  const ordenados = [...traspasos].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
  const visibles = filtro === "todos" ? ordenados : ordenados.filter((t) => t.estado === filtro);
  const contar = (id: (typeof FILTROS)[number]["id"]) => (id === "todos" ? traspasos.length : traspasos.filter((t) => t.estado === id).length);

  return (
    <>
      <TituloPagina
        antetitulo="Reformas"
        titulo="Bandeja de traspasos"
        descripcion="Cada vivienda firmada llega aquí automáticamente con su ficha completa."
      />

      <div className="desplazable mb-6 flex gap-6 overflow-x-auto border-b border-borde" role="tablist" aria-label="Filtrar por estado">
        {FILTROS.map((f) => {
          const activo = filtro === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={activo}
              onClick={() => setFiltro(f.id)}
              className={`relative inline-flex h-11 shrink-0 items-center gap-2 text-[15px] font-medium transition-colors duration-150 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:transition-colors ${
                activo ? "text-tinta after:bg-azul" : "text-secundario-fondo after:bg-transparent hover:text-tinta"
              }`}
            >
              {f.etiqueta}
              <span
                className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[12px] font-semibold tabular-nums transition-colors ${
                  activo ? "bg-azul-claro text-azul-hover" : "bg-fondo-2 text-secundario-fondo"
                }`}
              >
                {contar(f.id)}
              </span>
            </button>
          );
        })}
      </div>

      {traspasos.length === 0 ? (
        <EstadoVacio ilustracion="bandeja" titulo="Todavía no hay traspasos" descripcion="Se crean automáticamente cuando Supply firma una vivienda." />
      ) : visibles.length === 0 ? (
        <EstadoVacio ilustracion="bandeja" titulo="No hay traspasos con este estado" descripcion="Prueba con otro filtro." />
      ) : (
        <ul key={filtro} className="divide-y divide-borde overflow-hidden rounded-xl border border-borde bg-superficie shadow-suave">
          {visibles.map((t, i) => {
            const partidas = Array.isArray(t.ficha.alcanceReforma) ? (t.ficha.alcanceReforma as string[]) : [];
            const nuevo = t.estado === "Pendiente de revisión" && ahora - new Date(t.creadoEn).getTime() < DIEZ_MINUTOS;
            const foto = Array.isArray(t.ficha.fotos) ? (t.ficha.fotos as string[])[0] : undefined;
            return (
              <li key={t.id} className="animar-entrada" style={{ "--retraso": `${60 + i * 50}ms` } as CSSProperties}>
                <Link href={`/reformas/${t.id}`} className="group flex items-center gap-4 px-4 py-4 transition-colors duration-150 hover:bg-fondo/70 sm:gap-6 sm:px-6 sm:py-5">
                  <div className="hidden size-16 shrink-0 overflow-hidden rounded-lg bg-fondo-2 ring-1 ring-tinta/5 sm:block">
                    {foto && <img src={foto} alt="" className="size-full origin-top scale-[1.35] object-cover transition-transform duration-300 group-hover:scale-[1.42]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <InsigniaTraspaso estado={t.estado} />
                      {nuevo && <Pastilla tono="atencion">Nuevo</Pastilla>}
                      <span className="text-[13px] text-secundario-fondo tabular-nums">
                        {t.id} · recibido {formatFechaHora(t.creadoEn)}
                      </span>
                    </div>
                    <p className="mt-2 text-base leading-6 font-semibold text-tinta">
                      {(t.ficha.direccion as string) || "Sin dirección"}
                      {t.ficha.barrio ? <span className="block font-normal text-secundario-fondo sm:ml-2 sm:inline">{t.ficha.barrio as string}</span> : null}
                    </p>
                    <p className="mt-1 text-sm text-pizarra">
                      {partidas.length > 0 ? (
                        partidas.map((p) => PARTIDAS_REFORMA.find((x) => x.valor === p)?.etiqueta ?? p).join(" · ")
                      ) : (
                        <span className="inline-flex items-center gap-2 font-medium text-azul">
                          <Punto tono="accion" />
                          Sin alcance definido
                        </span>
                      )}
                    </p>
                    {t.motivoDevolucion && (
                      <p className="mt-2 text-sm text-pizarra">
                        <span className="font-medium text-tinta">Motivo: {t.motivoDevolucion.campoEtiqueta}.</span> {t.motivoDevolucion.comentario}
                      </p>
                    )}
                  </div>
                  {t.ficha.costeReforma ? (
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="font-display text-2xl leading-8 font-semibold text-tinta tabular-nums">{formatEuros(t.ficha.costeReforma as string)}</p>
                      <p className="text-[12px] text-secundario-fondo">coste estimado</p>
                    </div>
                  ) : null}
                  <ChevronRight className="size-5 shrink-0 text-secundario-fondo transition-[transform,color] duration-150 group-hover:translate-x-0.5 group-hover:text-tinta" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
