"use client";

// PANTALLA 4 · Bandeja de reformas (módulo Reno): lista de traspasos con su estado.

import { ChevronRight, Inbox } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { InsigniaTraspaso } from "@/components/reformas/InsigniaTraspaso";
import { Cargando, EstadoVacio, Insignia, TituloPagina } from "@/components/ui";
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

      <div className="mb-4 flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Filtrar por estado">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[15px] font-semibold transition-colors ${
              filtro === f.id ? "border-tinta bg-tinta text-crema" : "border-borde-fuerte bg-papel text-tinta-suave hover:text-tinta"
            }`}
          >
            {f.etiqueta}
            <span className={`rounded-full px-1.5 text-[13px] ${filtro === f.id ? "bg-white/15" : "bg-crema-oscuro"}`}>{contar(f.id)}</span>
          </button>
        ))}
      </div>

      {traspasos.length === 0 ? (
        <EstadoVacio icono={<Inbox className="size-8" />} titulo="Todavía no hay traspasos" descripcion="Se crean automáticamente cuando Supply firma una vivienda." />
      ) : visibles.length === 0 ? (
        <EstadoVacio icono={<Inbox className="size-8" />} titulo="No hay traspasos con este estado" />
      ) : (
        <ul className="space-y-2.5">
          {visibles.map((t) => {
            const partidas = Array.isArray(t.ficha.alcanceReforma) ? (t.ficha.alcanceReforma as string[]) : [];
            const nuevo = t.estado === "Pendiente de revisión" && ahora - new Date(t.creadoEn).getTime() < DIEZ_MINUTOS;
            return (
              <li key={t.id}>
                <Link
                  href={`/reformas/${t.id}`}
                  className={`group flex items-center gap-4 rounded-xl border bg-papel p-4 shadow-suave transition hover:border-borde-fuerte hover:shadow-elevada sm:p-5 ${
                    t.estado === "Pendiente de revisión" ? "border-ambar-borde" : "border-borde"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <InsigniaTraspaso estado={t.estado} />
                      {nuevo && <Insignia tono="info">Nuevo</Insignia>}
                      <span className="text-sm font-medium text-tinta-tenue">
                        {t.id} · recibido {formatFechaHora(t.creadoEn)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[17px] font-semibold text-tinta group-hover:underline group-hover:underline-offset-4">
                      {(t.ficha.direccion as string) || "Sin dirección"}
                      <span className="ml-2 text-[15px] font-normal text-tinta-suave">{(t.ficha.barrio as string) || ""}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {partidas.length > 0 ? (
                        partidas.map((p) => (
                          <span key={p} className="rounded-full bg-crema-oscuro px-2.5 py-0.5 text-[13px] font-medium text-tinta-suave">
                            {PARTIDAS_REFORMA.find((x) => x.valor === p)?.etiqueta ?? p}
                          </span>
                        ))
                      ) : (
                        <span className="text-[13px] font-semibold text-ladrillo">Sin alcance definido</span>
                      )}
                      <span className="ml-1 text-[15px] font-semibold text-tinta">{t.ficha.costeReforma ? formatEuros(t.ficha.costeReforma as string) : ""}</span>
                    </div>
                    {t.motivoDevolucion && (
                      <p className="mt-2 text-sm text-ladrillo-oscuro">
                        <strong className="font-semibold">Motivo:</strong> {t.motivoDevolucion.campoEtiqueta} · {t.motivoDevolucion.comentario}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-tinta-tenue transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
