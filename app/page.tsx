"use client";

// PANTALLA 1 · Embudo de Supply: una columna por etapa más las viviendas traspasadas.

import { Inbox, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { DialogoNuevaVivienda } from "@/components/embudo/DialogoNuevaVivienda";
import { TarjetaVivienda } from "@/components/embudo/TarjetaVivienda";
import { Boton, Cargando, TituloPagina } from "@/components/ui";
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
          <>
            {plural(enEmbudo.length, "vivienda")} en el embudo ·{" "}
            <span className={conPendientes > 0 ? "font-semibold text-ladrillo" : "text-salvia"}>
              {conPendientes > 0 ? `${plural(conPendientes, "ficha")} con campos pendientes` : "todas las fichas completas"}
            </span>
          </>
        }
        acciones={
          <Boton onClick={() => setNuevaAbierta(true)}>
            <Plus className="size-4" aria-hidden />
            Nueva vivienda
          </Boton>
        }
      />

      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
        <div className="grid grid-cols-1 gap-4 md:min-w-[1320px] md:grid-cols-6">
          {columnas.map((col) => (
            <section key={col.id} aria-labelledby={`col-${col.id}`} className="flex flex-col rounded-2xl bg-crema-oscuro/60 p-2.5">
              <header className="flex items-center justify-between px-1.5 pt-1 pb-3">
                <h2 id={`col-${col.id}`} className="text-[15px] font-bold text-tinta">
                  {col.nombre}
                </h2>
                <span className="rounded-full bg-papel px-2 py-0.5 text-[13px] font-semibold text-tinta-suave">{col.viviendas.length}</span>
              </header>
              <div className="flex flex-1 flex-col gap-2.5">
                {col.viviendas.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-borde-fuerte px-3 py-8 text-center text-sm text-tinta-tenue">
                    <Inbox className="size-5" aria-hidden />
                    Sin viviendas en esta etapa
                  </div>
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
