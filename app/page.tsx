"use client";

// PANTALLA 1 · Embudo de Supply: una columna por etapa más las viviendas traspasadas.

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { DialogoNuevaVivienda } from "@/components/embudo/DialogoNuevaVivienda";
import { TarjetaVivienda } from "@/components/embudo/TarjetaVivienda";
import { Boton, Cargando, EstadoVacio, Punto, TituloPagina } from "@/components/ui";
import { plural } from "@/lib/format";
import { COLUMNAS_EMBUDO } from "@/lib/stages";
import { useStore } from "@/lib/store";
import type { Vivienda } from "@/lib/types";
import { camposPendientes } from "@/lib/validation";

/** Fecha del último cambio de etapa: las que acaban de moverse aparecen arriba. */
function ultimoMovimiento(v: Vivienda): string {
  return v.historial.at(-1)?.fecha ?? v.creadaEn;
}

export default function EmbudoPage() {
  const { cargado, viviendas, traspasos } = useStore();
  const [nuevaAbierta, setNuevaAbierta] = useState(false);

  const columnas = useMemo(
    () =>
      COLUMNAS_EMBUDO.map((col) => ({
        ...col,
        viviendas: viviendas.filter((v) => v.etapa === col.id).sort((a, b) => ultimoMovimiento(b).localeCompare(ultimoMovimiento(a))),
      })),
    [viviendas],
  );

  if (!cargado) return <Cargando filas={6} />;

  const enEmbudo = viviendas.filter((v) => v.etapa !== "traspasada");
  const conPendientes = enEmbudo.filter((v) => camposPendientes(v).length > 0).length;
  /** Último traspaso de cada vivienda (la lista está ordenada del más nuevo al más antiguo). */
  const traspasoDe = (id: string) => traspasos.find((t) => t.viviendaId === id);

  return (
    <>
      <TituloPagina
        antetitulo="Supply"
        titulo="Embudo de viviendas"
        descripcion={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="tabular-nums">{plural(enEmbudo.length, "vivienda")} en el embudo</span>
            {conPendientes > 0 ? (
              <span className="inline-flex items-center gap-2 font-medium text-ladrillo tabular-nums">
                <Punto tono="accion" />
                {plural(conPendientes, "ficha")} con campos pendientes
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 font-medium text-salvia">
                <Punto tono="completo" />
                Todas las fichas completas
              </span>
            )}
          </span>
        }
        acciones={
          <Boton onClick={() => setNuevaAbierta(true)}>
            <Plus className="size-4" strokeWidth={2.25} aria-hidden />
            Nueva vivienda
          </Boton>
        }
      />

      <div className="desplazable -mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[repeat(6,minmax(152px,1fr))] md:gap-3">
          {columnas.map((col) => (
            <section key={col.id} aria-labelledby={`col-${col.id}`} className="flex min-w-0 flex-col">
              <header className="mb-3 flex items-baseline justify-between gap-2 border-b border-borde pb-2">
                <h2 id={`col-${col.id}`} className="font-display text-base font-semibold tracking-[-0.01em] text-tinta">
                  {col.nombre}
                </h2>
                <span className="text-[13px] font-medium text-tinta-tenue tabular-nums" aria-label={plural(col.viviendas.length, "vivienda")}>
                  {col.viviendas.length}
                </span>
              </header>
              <div className="flex flex-1 flex-col gap-2">
                {col.viviendas.length === 0 ? (
                  <EstadoVacio compacto ilustracion="casa" titulo="Sin viviendas en esta etapa" />
                ) : (
                  col.viviendas.map((v) => <TarjetaVivienda key={v.id} vivienda={v} traspaso={traspasoDe(v.id)} />)
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      <DialogoNuevaVivienda abierto={nuevaAbierta} onCerrar={() => setNuevaAbierta(false)} />
    </>
  );
}
