"use client";

// PANTALLA 5 · Panel de métricas del traspaso Supply → Reformas.

import type { ReactNode } from "react";
import { Cargando, EstadoVacio, Tarjeta, TituloPagina, TituloSeccion } from "@/components/ui";
import { formatDuracion, plural } from "@/lib/format";
import { calcularMetricas } from "@/lib/metrics";
import { useStore } from "@/lib/store";

const TRES_DIAS_MS = 3 * 24 * 3_600_000;

/** Colores de las marcas (el texto siempre va en tinta). */
const MARCA = {
  neutra: "#a39983",
  completo: "var(--color-salvia)",
  accion: "var(--color-ladrillo)",
  antes: "#a39983",
  pista: "var(--color-crema-oscuro)",
};

function porcentaje(valor: number | null): number | null {
  return valor == null ? null : Math.round(valor * 100);
}

export default function MetricasPage() {
  const { cargado, viviendas, traspasos } = useStore();
  if (!cargado) return <Cargando filas={4} />;

  const m = calcularMetricas(viviendas, traspasos);
  const maxEtapa = Math.max(1, ...m.porEtapa.map((e) => e.viviendas));
  const maxMotivo = Math.max(1, ...m.motivos.map((x) => x.veces));
  const ratio = (d: { aceptados: number; revisados: number }) => (d.revisados ? d.aceptados / d.revisados : null);

  return (
    <>
      <TituloPagina antetitulo="Supply → Reformas" titulo="Métricas" descripcion="Calidad del traspaso y estado del embudo, calculados en tiempo real con los datos de la demo." />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Tarjeta className="p-6 sm:p-8">
          <Etiqueta>Traspasos completos a la primera</Etiqueta>
          <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2">
            <Cifra valor={porcentaje(m.pctALaPrimera)} unidad="%" grande />
            <p className="pb-2 text-[15px] text-tinta-suave tabular-nums">
              {m.aceptadosALaPrimera} de {plural(m.primerosRevisados, "revisado")}
              {m.pendientesRevision > 0 && <span className="text-tinta-tenue"> · {m.pendientesRevision} pendiente{m.pendientesRevision === 1 ? "" : "s"} de revisión</span>}
            </p>
          </div>

          <div className="mt-8 border-t border-borde pt-6">
            <p className="mb-4 text-sm font-medium text-tinta">Antes y después del bloqueo</p>
            <ul className="space-y-4">
              <FilaComparacion etiqueta="Antes" detalle="1 de cada 4 llegaba incompleto" valor={0.75} aproximado color={MARCA.antes} />
              <FilaComparacion
                etiqueta="Con ficha completa"
                detalle={`${m.conFichaCompleta.aceptados} de ${m.conFichaCompleta.revisados} aceptados`}
                valor={ratio(m.conFichaCompleta)}
                color={MARCA.completo}
              />
              {m.conPendientes.revisados > 0 && (
                <FilaComparacion
                  etiqueta="Con campos pendientes"
                  detalle={`${m.conPendientes.aceptados} de ${m.conPendientes.revisados} · firmados en modo piloto`}
                  valor={ratio(m.conPendientes)}
                  color={MARCA.accion}
                />
              )}
            </ul>
            <p className="mt-6 text-[13px] text-tinta-tenue">El total mezcla ambos casos y aún tiene pocos datos; el desglose es lo que muestra el efecto del bloqueo.</p>
          </div>
        </Tarjeta>

        <Tarjeta className="flex flex-col p-6 sm:p-8">
          <Etiqueta>Tiempo medio firma → traspaso</Etiqueta>
          <p className="mt-3 font-display text-[56px] leading-none font-semibold tracking-[-0.035em] text-tinta tabular-nums sm:text-[64px]">
            {m.tiempoMedioFirmaTraspasoMs == null ? "—" : formatDuracion(m.tiempoMedioFirmaTraspasoMs)}
          </p>
          <p className="mt-3 text-[15px] text-tinta-suave">El traspaso se genera automáticamente al firmar.</p>
          <div className="mt-8 border-t border-borde pt-6">
            <p className="mb-4 text-sm font-medium text-tinta">Antes y después</p>
            <EscalaTiempo ms={m.tiempoMedioFirmaTraspasoMs} />
          </div>
        </Tarjeta>
      </div>

      <div className="mt-4 grid divide-y divide-borde rounded-xl border border-borde bg-papel sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Indicador etiqueta="Devoluciones a Supply" valor={<Cifra valor={m.devoluciones} />} detalle={m.totalTraspasos ? `de ${plural(m.totalTraspasos, "traspaso")} en total` : "Sin traspasos"} />
        <Indicador
          etiqueta="Fichas completas en su etapa"
          valor={<Cifra valor={porcentaje(m.pctFichasCompletas)} unidad="%" />}
          detalle={`${m.fichasCompletas} de ${plural(m.viviendasEnEmbudo, "vivienda")} en el embudo`}
          grafico={<Unidades completas={m.fichasCompletas} total={m.viviendasEnEmbudo} />}
        />
        <Indicador etiqueta="Avances en modo piloto con campos pendientes" valor={<Cifra valor={m.avancesConPendientes} />} detalle="Registrados en el historial de cada ficha" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Tarjeta className="p-6 sm:p-8">
          <TituloSeccion detalle={`${plural(viviendas.length, "vivienda")} en total`}>Viviendas por etapa</TituloSeccion>
          <ul className="mt-6 space-y-3">
            {m.porEtapa.map((e) => (
              <FilaBarra
                key={e.id}
                etiqueta={e.nombre}
                valor={e.viviendas}
                max={maxEtapa}
                sufijo={e.viviendas === 1 ? "vivienda" : "viviendas"}
                color={e.id === "traspasada" ? MARCA.completo : MARCA.neutra}
              />
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta className="p-6 sm:p-8">
          <TituloSeccion detalle="Campo señalado por Reformas al devolver">Motivos de devolución</TituloSeccion>
          {m.motivos.length === 0 ? (
            <EstadoVacio ilustracion="grafico" titulo="Sin devoluciones" descripcion="Cuando Reformas devuelva un traspaso, el motivo aparecerá aquí." />
          ) : (
            <ul className="mt-6 space-y-3">
              {m.motivos.map((x) => (
                <FilaBarra key={x.campo} etiqueta={x.campo} valor={x.veces} max={maxMotivo} sufijo={x.veces === 1 ? "vez" : "veces"} color={MARCA.neutra} />
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </>
  );
}

function Etiqueta({ children }: { children: ReactNode }) {
  return <p className="text-[15px] font-medium text-tinta-suave">{children}</p>;
}

/** Cifra en la fuente de títulos; la unidad va más pequeña para que el número mande. */
function Cifra({ valor, unidad, grande = false }: { valor: number | null; unidad?: string; grande?: boolean }) {
  return (
    <p className={`font-display leading-none font-semibold tracking-[-0.035em] text-tinta tabular-nums ${grande ? "text-[72px] sm:text-[88px]" : "text-5xl"}`}>
      {valor == null ? "—" : valor}
      {valor != null && unidad && <span className="ml-1 text-[0.45em] font-medium tracking-normal text-tinta-suave">{unidad}</span>}
    </p>
  );
}

function Indicador({ etiqueta, valor, detalle, grafico }: { etiqueta: string; valor: ReactNode; detalle: string; grafico?: ReactNode }) {
  return (
    <div className="flex flex-col p-6 sm:p-8">
      <Etiqueta>{etiqueta}</Etiqueta>
      <div className="mt-3">{valor}</div>
      <p className="mt-3 text-sm text-tinta-tenue tabular-nums">{detalle}</p>
      {grafico && <div className="mt-4">{grafico}</div>}
    </div>
  );
}

/** Barra fina en SVG: extremo redondeado de 4 px y base recta. */
function BarraSvg({ fraccion, color, pista = false, alto = 8, titulo }: { fraccion: number; color: string; pista?: boolean; alto?: number; titulo: string }) {
  const ancho = `${Math.min(1, Math.max(0, fraccion)) * 100}%`;
  return (
    <svg className="block w-full overflow-visible" height={alto} role="img" aria-label={titulo}>
      <title>{titulo}</title>
      {pista && <rect width="100%" height={alto} rx={alto / 2} fill={MARCA.pista} />}
      {fraccion > 0 && (
        <>
          <rect width={ancho} height={alto} rx={4} fill={color} className="transition-[width] duration-500" />
          <rect width={Math.min(4, alto)} height={alto} fill={color} />
        </>
      )}
      {!pista && <line x1="0.5" x2="0.5" y1={-2} y2={alto + 2} stroke="var(--color-borde-fuerte)" />}
    </svg>
  );
}

function FilaComparacion({ etiqueta, detalle, valor, color, aproximado = false }: { etiqueta: string; detalle: string; valor: number | null; color: string; aproximado?: boolean }) {
  const pct = porcentaje(valor);
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-2 sm:grid-cols-[180px_minmax(0,1fr)_80px] sm:items-center">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-medium text-tinta">
          <span className="size-2 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
          {etiqueta}
        </p>
        <p className="pl-4 text-[13px] text-tinta-tenue">{detalle}</p>
      </div>
      <div className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto">
        <BarraSvg fraccion={valor ?? 0} color={color} pista titulo={`${etiqueta}: ${pct == null ? "sin datos" : `${pct} %`}`} />
      </div>
      <p className="col-start-2 row-start-1 text-right font-display text-xl font-semibold whitespace-nowrap text-tinta tabular-nums sm:col-start-auto sm:row-start-auto">
        {pct == null ? "—" : `${aproximado ? "≈" : ""}${pct} %`}
      </p>
    </li>
  );
}

function FilaBarra({ etiqueta, valor, max, sufijo, color }: { etiqueta: string; valor: number; max: number; sufijo: string; color: string }) {
  return (
    <li className="grid grid-cols-[112px_minmax(0,1fr)_32px] items-center gap-4 sm:grid-cols-[140px_minmax(0,1fr)_32px]">
      <span className="truncate text-[15px] text-tinta">{etiqueta}</span>
      <BarraSvg fraccion={valor / max} color={color} titulo={`${etiqueta}: ${valor} ${sufijo}`} />
      <span className="text-right text-[15px] font-semibold text-tinta tabular-nums">{valor}</span>
    </li>
  );
}

/** Un punto por vivienda del embudo: relleno (salvia) si su ficha está completa en su etapa. */
function Unidades({ completas, total }: { completas: number; total: number }) {
  const paso = 16;
  return (
    <svg width={Math.max(total * paso - 4, 0)} height={12} role="img" aria-label={`${completas} de ${total} fichas completas`} className="block">
      {Array.from({ length: total }, (_, i) =>
        i < completas ? (
          <circle key={i} cx={i * paso + 6} cy={6} r={6} fill={MARCA.completo} />
        ) : (
          <circle key={i} cx={i * paso + 6} cy={6} r={5.25} fill="none" stroke="var(--color-borde-fuerte)" strokeWidth={1.5} />
        ),
      )}
    </svg>
  );
}

/** Escala de 0 a 3 días: punto para el tiempo actual, franja para la estimación de antes. */
function EscalaTiempo({ ms }: { ms: number | null }) {
  const x = ms == null ? null : Math.min(1, ms / TRES_DIAS_MS);
  return (
    <div>
      <svg className="block w-full overflow-visible" height={16} role="img" aria-label={`Ahora: ${ms == null ? "sin datos" : formatDuracion(ms).toLowerCase()}. Antes: entre 2 y 3 días.`}>
        <line x1="0" x2="100%" y1="8" y2="8" stroke="var(--color-borde-fuerte)" />
        {[0, 1 / 3, 2 / 3, 1].map((t) => (
          <line key={t} x1={`${t * 100}%`} x2={`${t * 100}%`} y1="4" y2="12" stroke="var(--color-borde-fuerte)" />
        ))}
        <rect x="66.667%" width="33.333%" y="4" height="8" rx="4" fill={MARCA.antes} />
        {x != null && <circle cx={`${x * 100}%`} cy="8" r="6" fill={MARCA.completo} stroke="var(--color-papel)" strokeWidth={2} />}
      </svg>
      <div className="mt-2 flex justify-between text-[12px] text-tinta-tenue tabular-nums">
        <span>0</span>
        <span>1 día</span>
        <span>2 días</span>
        <span>3 días</span>
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-tinta-suave">
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ background: MARCA.completo }} aria-hidden />
          Ahora: {ms == null ? "—" : formatDuracion(ms).toLowerCase()}
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2 w-4 rounded-full" style={{ background: MARCA.antes }} aria-hidden />
          Antes: ≈2–3 días (estimación)
        </li>
      </ul>
    </div>
  );
}
