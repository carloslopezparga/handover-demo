"use client";

// PANTALLA 1 · Embudo de Supply: una columna por etapa más las viviendas traspasadas.

import { Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { DialogoNuevaVivienda } from "@/components/embudo/DialogoNuevaVivienda";
import { TarjetaVivienda } from "@/components/embudo/TarjetaVivienda";
import { leerLlegada, olvidarLlegada, prefiereMenosMovimiento } from "@/components/movimiento";
import { Boton, Cargando, EstadoVacio, IconoCompleto, Punto, TituloPagina } from "@/components/ui";
import { plural } from "@/lib/format";
import { COLUMNAS_EMBUDO } from "@/lib/stages";
import { useStore } from "@/lib/store";
import type { Vivienda } from "@/lib/types";
import { camposPendientes } from "@/lib/validation";

/** Fecha del último cambio de etapa: las que acaban de moverse aparecen arriba. */
function ultimoMovimiento(v: Vivienda): string {
  return v.historial.at(-1)?.fecha ?? v.creadaEn;
}

const retraso = (ms: number) => ({ "--retraso": `${Math.min(ms, 600)}ms` }) as CSSProperties;

export default function EmbudoPage() {
  const { cargado, viviendas, traspasos } = useStore();
  const [nuevaAbierta, setNuevaAbierta] = useState(false);
  // Vivienda recién firmada en esta sesión: «llega» a Traspasadas con una transición.
  const [llegada] = useState(leerLlegada);
  const tablero = useRef<HTMLDivElement>(null);

  const columnas = useMemo(
    () =>
      COLUMNAS_EMBUDO.map((col) => ({
        ...col,
        viviendas: viviendas.filter((v) => v.etapa === col.id).sort((a, b) => ultimoMovimiento(b).localeCompare(ultimoMovimiento(a))),
      })),
    [viviendas],
  );

  // La tarjeta se desliza desde la columna Firma hasta Traspasadas (en móvil, aparece desde arriba).
  useEffect(() => {
    if (!cargado || !llegada) return;
    const tarjeta = tablero.current?.querySelector<HTMLElement>(`[data-columna="traspasada"] [data-vivienda="${llegada}"]`);
    if (!tarjeta) return;
    olvidarLlegada();
    if (prefiereMenosMovimiento()) return;
    const origen = tablero.current?.querySelector<HTMLElement>('[data-columna="firma"]');
    const destino = tarjeta.closest<HTMLElement>("[data-columna]");
    let desde = "translateY(-24px) scale(1.02)";
    if (origen && destino) {
      const dx = origen.getBoundingClientRect().left - destino.getBoundingClientRect().left;
      if (Math.abs(dx) > 1) desde = `translateX(${dx}px) rotate(-2deg) scale(1.02)`;
    }
    // Como un arrastre de kanban: aparece «levantada» sobre Firma, se desliza y se posa.
    const levantada = "drop-shadow(0 16px 24px rgb(11 18 32 / 0.18))";
    const animacion = tarjeta.animate(
      [
        { transform: desde, opacity: 0, filter: levantada, easing: "ease-out" },
        { transform: desde, opacity: 1, filter: levantada, offset: 0.15, easing: "cubic-bezier(0.65, 0, 0.35, 1)" },
        { transform: "scale(1.02)", opacity: 1, filter: levantada, offset: 0.8, easing: "ease-out" },
        { transform: "none", opacity: 1, filter: "drop-shadow(0 0 0 rgb(11 18 32 / 0))" },
      ],
      { duration: 1300, delay: 350, fill: "backwards" },
    );
    return () => animacion.cancel();
  }, [cargado, llegada]);

  if (!cargado) return <Cargando tipo="embudo" />;

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
              <span className="inline-flex items-center gap-2 font-medium text-azul tabular-nums">
                <Punto tono="accion" />
                {plural(conPendientes, "ficha")} con campos pendientes
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 font-medium text-marino">
                <IconoCompleto />
                Todas las fichas completas
              </span>
            )}
          </span>
        }
        acciones={
          <Boton onClick={() => setNuevaAbierta(true)}>
            <Plus className="size-4" aria-hidden />
            Nueva vivienda
          </Boton>
        }
      />

      <div className="desplazable -mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 2xl:-mx-12 2xl:px-12">
        <div ref={tablero} className="grid grid-cols-1 gap-4 md:grid-cols-[repeat(6,minmax(160px,1fr))] md:gap-2 2xl:gap-3">
          {columnas.map((col, i) => (
            <section
              key={col.id}
              data-columna={col.id}
              aria-labelledby={`col-${col.id}`}
              className="animar-entrada flex min-w-0 flex-col rounded-xl bg-fondo-2/80 p-1.5"
              style={retraso(i * 50)}
            >
              <header className="flex items-center justify-between gap-1.5 px-1.5 pt-1.5 pb-2.5 2xl:px-2">
                <h2 id={`col-${col.id}`} className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-tinta">
                  {col.id === "traspasada" && <IconoCompleto />}
                  <span className="truncate">{col.nombre}</span>
                </h2>
                <span
                  className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-superficie px-1.5 text-[12px] font-semibold text-pizarra tabular-nums ring-1 ring-borde"
                  aria-label={plural(col.viviendas.length, "vivienda")}
                >
                  {col.viviendas.length}
                </span>
              </header>
              <ul className="flex flex-1 flex-col gap-1.5">
                {col.viviendas.length === 0 ? (
                  <li>
                    <EstadoVacio compacto ilustracion="casa" titulo="Sin viviendas en esta etapa" />
                  </li>
                ) : (
                  col.viviendas.map((v, j) => {
                    const recien = v.id === llegada && col.id === "traspasada";
                    return (
                      <li key={v.id} data-vivienda={v.id} className={`relative ${recien ? "" : "animar-entrada"}`} style={recien ? undefined : retraso(80 + i * 50 + j * 40)}>
                        <TarjetaVivienda vivienda={v} traspaso={traspasoDe(v.id)} recienLlegada={recien} />
                        {recien && <span className="halo-llegada pointer-events-none absolute inset-0 rounded-lg" aria-hidden />}
                      </li>
                    );
                  })
                )}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <DialogoNuevaVivienda abierto={nuevaAbierta} onCerrar={() => setNuevaAbierta(false)} />
    </>
  );
}
