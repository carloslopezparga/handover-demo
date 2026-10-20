"use client";

// PANTALLA 5 · Panel de métricas del traspaso Supply → Reformas.
// Al entrar, las cifras cuentan hasta su valor y las barras crecen desde cero.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { prefiereMenosMovimiento } from "@/components/movimiento";
import { Cargando, IconoCompleto, Ilustracion, Tarjeta, TituloPagina, TituloSeccion } from "@/components/ui";
import { formatDuracion, plural } from "@/lib/format";
import { calcularMetricas } from "@/lib/metrics";
import { useStore } from "@/lib/store";

const TRES_DIAS_MS = 3 * 24 * 3_600_000;

/** Colores de las marcas (el texto siempre va en tinta o gris). */
const MARCA = {
  neutra: "var(--color-secundario)",
  completo: "var(--color-marino)",
  piloto: "var(--color-piloto)",
  clave: "var(--color-azul)",
  pista: "var(--color-fondo-2)",
};

const retraso = (ms: number) => ({ "--retraso": `${ms}ms` }) as CSSProperties;

function porcentaje(valor: number | null): number | null {
  return valor == null ? null : Math.round(valor * 100);
}

/** Cuenta desde el valor mostrado hasta el objetivo (ease-out). Sin animación si se pide menos movimiento. */
function useCuenta(objetivo: number | null, duracion = 900): number | null {
  const [valor, setValor] = useState<number | null>(() => (objetivo == null || prefiereMenosMovimiento() ? objetivo : 0));
  const mostrado = useRef(valor ?? 0);

  useEffect(() => {
    if (objetivo == null) return;
    const total = prefiereMenosMovimiento() ? 0 : duracion;
    const desde = mostrado.current;
    let inicio: number | null = null;
    let marco = 0;
    const paso = (t: number) => {
      inicio ??= t;
      const p = total === 0 ? 1 : Math.min(1, (t - inicio) / total);
      const actual = Math.round(desde + (objetivo - desde) * (1 - Math.pow(1 - p, 3)));
      mostrado.current = actual;
      setValor(actual);
      if (p < 1) marco = requestAnimationFrame(paso);
    };
    marco = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(marco);
  }, [objetivo, duracion]);

  return objetivo == null ? null : valor;
}

export default function MetricasPage() {
  const { cargado, viviendas, traspasos } = useStore();
  if (!cargado) return <Cargando tipo="metricas" />;

  const m = calcularMetricas(viviendas, traspasos);
  const maxEtapa = Math.max(1, ...m.porEtapa.map((e) => e.viviendas));
  const maxMotivo = Math.max(1, ...m.motivos.map((x) => x.veces));
  const ratio = (d: { aceptados: number; revisados: number }) => (d.revisados ? d.aceptados / d.revisados : null);

  return (
    <>
      <TituloPagina antetitulo="Supply → Reformas" titulo="Métricas" descripcion="Calidad del traspaso y estado del embudo, calculados en tiempo real con los datos de la demo." />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Tarjeta className="animar-entrada p-6 shadow-suave sm:p-8" style={retraso(60)}>
          <Etiqueta>Traspasos completos a la primera</Etiqueta>
          <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2">
            <Cifra valor={porcentaje(m.pctALaPrimera)} unidad="%" grande clave />
            <p className="pb-2 text-[15px] text-pizarra tabular-nums">
              {m.aceptadosALaPrimera} de {plural(m.primerosRevisados, "revisado")}
              {m.pendientesRevision > 0 && <span className="text-secundario"> · {m.pendientesRevision} pendiente{m.pendientesRevision === 1 ? "" : "s"} de revisión</span>}
            </p>
          </div>

          <div className="mt-8 border-t border-borde pt-6">
            <p className="mb-4 text-sm font-semibold text-tinta">Antes y después del bloqueo</p>
            <ul className="space-y-5">
              <FilaComparacion etiqueta="Antes" detalle="1 de cada 4 llegaba incompleto" valor={0.75} aproximado color={MARCA.neutra} orden={0} />
              <FilaComparacion
                etiqueta="Con ficha completa"
                detalle={`${m.conFichaCompleta.aceptados} de ${m.conFichaCompleta.revisados} aceptados`}
                valor={ratio(m.conFichaCompleta)}
                color={MARCA.completo}
                orden={1}
                marca={<IconoCompleto />}
              />
              {m.conPendientes.revisados > 0 && (
                <FilaComparacion
                  etiqueta="Con campos pendientes"
                  detalle={`${m.conPendientes.aceptados} de ${m.conPendientes.revisados} · firmados en modo piloto`}
                  valor={ratio(m.conPendientes)}
                  color={MARCA.piloto}
                  orden={2}
                />
              )}
            </ul>
            <p className="mt-6 text-[13px] text-secundario">El total mezcla ambos casos y aún tiene pocos datos; el desglose es lo que muestra el efecto del bloqueo.</p>
          </div>
        </Tarjeta>

        <Tarjeta className="animar-entrada flex flex-col p-6 shadow-suave sm:p-8" style={retraso(120)}>
          <Etiqueta>Tiempo medio firma → traspaso</Etiqueta>
          <p className="mt-3 font-display text-[56px] leading-none font-semibold tracking-[-0.02em] text-azul tabular-nums sm:text-[64px]">
            {m.tiempoMedioFirmaTraspasoMs == null ? "—" : formatDuracion(m.tiempoMedioFirmaTraspasoMs)}
          </p>
          <p className="mt-3 text-[15px] text-pizarra">El traspaso se genera automáticamente al firmar.</p>
          <div className="mt-8 border-t border-borde pt-6">
            <p className="mb-4 text-sm font-semibold text-tinta">Antes y después</p>
            <EscalaTiempo ms={m.tiempoMedioFirmaTraspasoMs} />
          </div>
        </Tarjeta>
      </div>

      <div className="animar-entrada mt-4 grid divide-y divide-borde rounded-xl border border-borde bg-superficie shadow-suave sm:grid-cols-3 sm:divide-x sm:divide-y-0" style={retraso(180)}>
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
        <Tarjeta className="animar-entrada p-6 shadow-suave sm:p-8" style={retraso(240)}>
          <TituloSeccion detalle={`${plural(viviendas.length, "vivienda")} en total`}>Viviendas por etapa</TituloSeccion>
          <ul className="mt-6 space-y-3">
            {m.porEtapa.map((e, i) => (
              <FilaBarra
                key={e.id}
                etiqueta={e.nombre}
                valor={e.viviendas}
                max={maxEtapa}
                sufijo={e.viviendas === 1 ? "vivienda" : "viviendas"}
                color={e.id === "traspasada" ? MARCA.completo : MARCA.neutra}
                marca={e.id === "traspasada" ? <IconoCompleto /> : undefined}
                orden={i}
              />
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta className="animar-entrada p-6 shadow-suave sm:p-8" style={retraso(300)}>
          <TituloSeccion detalle="Campo señalado por Reformas al devolver">Motivos de devolución</TituloSeccion>
          {m.motivos.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border border-dashed border-borde-fuerte px-4 py-8 text-center">
              <Ilustracion nombre="grafico" className="w-24" />
              <p className="font-medium text-tinta">Sin devoluciones</p>
              <p className="max-w-xs text-sm text-secundario">Cuando Reformas devuelva un traspaso, el motivo aparecerá aquí.</p>
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {m.motivos.map((x, i) => (
                <FilaBarra key={x.campo} etiqueta={x.campo} valor={x.veces} max={maxMotivo} sufijo={x.veces === 1 ? "vez" : "veces"} color={MARCA.neutra} orden={i} />
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </>
  );
}

function Etiqueta({ children }: { children: ReactNode }) {
  return <p className="text-[15px] font-medium text-pizarra">{children}</p>;
}

/** Cifra en serif que cuenta hasta su valor; la unidad va más pequeña para que el número mande. */
function Cifra({ valor, unidad, grande = false, clave = false }: { valor: number | null; unidad?: string; grande?: boolean; clave?: boolean }) {
  const mostrado = useCuenta(valor);
  return (
    <p className={`font-display leading-none font-semibold tracking-[-0.02em] tabular-nums ${clave ? "text-azul" : "text-tinta"} ${grande ? "text-[72px] sm:text-[88px]" : "text-5xl"}`}>
      <span aria-hidden>{mostrado == null ? "—" : mostrado}</span>
      <span className="sr-only">{valor == null ? "Sin datos" : valor}</span>
      {valor != null && unidad && <span className="ml-1.5 font-sans text-[0.38em] font-semibold tracking-normal text-secundario">{unidad}</span>}
    </p>
  );
}

function Indicador({ etiqueta, valor, detalle, grafico }: { etiqueta: string; valor: ReactNode; detalle: string; grafico?: ReactNode }) {
  return (
    <div className="flex flex-col p-6 sm:p-8">
      <Etiqueta>{etiqueta}</Etiqueta>
      <div className="mt-3">{valor}</div>
      <p className="mt-3 text-sm text-secundario tabular-nums">{detalle}</p>
      {grafico && <div className="mt-4">{grafico}</div>}
    </div>
  );
}

/** Barra fina en SVG que crece desde cero: extremo redondeado y base recta. */
function BarraSvg({ fraccion, color, pista = false, alto = 8, titulo, orden = 0 }: { fraccion: number; color: string; pista?: boolean; alto?: number; titulo: string; orden?: number }) {
  const ancho = `${Math.min(1, Math.max(0, fraccion)) * 100}%`;
  return (
    <svg className="block w-full overflow-visible" height={alto} role="img" aria-label={titulo}>
      <title>{titulo}</title>
      {pista && <rect width="100%" height={alto} rx={alto / 2} fill={MARCA.pista} />}
      {fraccion > 0 && (
        <g className="barra-crece" style={retraso(250 + orden * 90)}>
          <rect width={ancho} height={alto} rx={alto / 2} fill={color} />
          <rect width={Math.min(alto / 2, 4)} height={alto} fill={color} />
        </g>
      )}
      {!pista && <line x1="0.5" x2="0.5" y1={-2} y2={alto + 2} stroke="var(--color-borde-fuerte)" />}
    </svg>
  );
}

function FilaComparacion({
  etiqueta,
  detalle,
  valor,
  color,
  aproximado = false,
  orden,
  marca,
}: {
  etiqueta: string;
  detalle: string;
  valor: number | null;
  color: string;
  aproximado?: boolean;
  orden: number;
  marca?: ReactNode;
}) {
  const pct = porcentaje(valor);
  const mostrado = useCuenta(pct);
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-2 sm:grid-cols-[184px_minmax(0,1fr)_80px] sm:items-center">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-medium text-tinta">
          {marca ?? <span className="size-2.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden />}
          {etiqueta}
        </p>
        <p className="pl-[22px] text-[13px] text-secundario">{detalle}</p>
      </div>
      <div className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto">
        <BarraSvg fraccion={valor ?? 0} color={color} pista alto={10} titulo={`${etiqueta}: ${pct == null ? "sin datos" : `${pct} %`}`} orden={orden} />
      </div>
      <p className="col-start-2 row-start-1 text-right font-display text-[22px] font-semibold whitespace-nowrap text-tinta tabular-nums sm:col-start-auto sm:row-start-auto" aria-hidden>
        {mostrado == null ? "—" : `${aproximado ? "≈" : ""}${mostrado} %`}
      </p>
    </li>
  );
}

function FilaBarra({ etiqueta, valor, max, sufijo, color, orden, marca }: { etiqueta: string; valor: number; max: number; sufijo: string; color: string; orden: number; marca?: ReactNode }) {
  return (
    <li className="grid grid-cols-[120px_minmax(0,1fr)_32px] items-center gap-4 sm:grid-cols-[148px_minmax(0,1fr)_32px]">
      <span className="flex min-w-0 items-center gap-2 text-[15px] text-tinta">
        {marca}
        <span className="truncate">{etiqueta}</span>
      </span>
      <BarraSvg fraccion={valor / max} color={color} titulo={`${etiqueta}: ${valor} ${sufijo}`} orden={orden} />
      <span className="text-right text-[15px] font-semibold text-tinta tabular-nums">{valor}</span>
    </li>
  );
}

/** Un punto por vivienda del embudo: marino con check si su ficha está completa en su etapa. */
function Unidades({ completas, total }: { completas: number; total: number }) {
  const paso = 18;
  return (
    <svg width={Math.max(total * paso - 4, 0)} height={14} role="img" aria-label={`${completas} de ${total} fichas completas`} className="block overflow-visible">
      {Array.from({ length: total }, (_, i) =>
        i < completas ? (
          <g key={i} className="animar-pop" style={{ ...retraso(400 + i * 70), transformBox: "fill-box", transformOrigin: "center" }}>
            <circle cx={i * paso + 7} cy={7} r={7} fill={MARCA.completo} />
            <path d={`M${i * paso + 4} 7.2l2 2 4-4.2`} fill="none" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ) : (
          <circle key={i} cx={i * paso + 7} cy={7} r={6.25} fill="none" stroke="var(--color-borde-fuerte)" strokeWidth={1.5} />
        ),
      )}
    </svg>
  );
}

/** Escala de 0 a 3 días: punto azul para el tiempo actual, franja gris para la estimación de antes. */
function EscalaTiempo({ ms }: { ms: number | null }) {
  const x = ms == null ? null : Math.min(1, ms / TRES_DIAS_MS);
  return (
    <div>
      <svg className="block w-full overflow-visible" height={16} role="img" aria-label={`Ahora: ${ms == null ? "sin datos" : formatDuracion(ms).toLowerCase()}. Antes: entre 2 y 3 días.`}>
        <line x1="0" x2="100%" y1="8" y2="8" stroke="var(--color-borde-fuerte)" />
        {[0, 1 / 3, 2 / 3, 1].map((t) => (
          <line key={t} x1={`${t * 100}%`} x2={`${t * 100}%`} y1="4" y2="12" stroke="var(--color-borde-fuerte)" />
        ))}
        <g className="barra-crece" style={retraso(350)}>
          <rect x="66.667%" width="33.333%" y="4" height="8" rx="4" fill={MARCA.neutra} />
        </g>
        {x != null && (
          <circle
            cx={`${x * 100}%`}
            cy="8"
            r="7"
            fill={MARCA.clave}
            stroke="var(--color-superficie)"
            strokeWidth={2}
            className="animar-pop"
            style={{ ...retraso(500), transformBox: "fill-box", transformOrigin: "center" }}
          />
        )}
      </svg>
      <div className="mt-2 flex justify-between text-[12px] text-secundario tabular-nums">
        <span>0</span>
        <span>1 día</span>
        <span>2 días</span>
        <span>3 días</span>
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-pizarra">
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ background: MARCA.clave }} aria-hidden />
          Ahora: {ms == null ? "—" : formatDuracion(ms).toLowerCase()}
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2 w-4 rounded-full" style={{ background: MARCA.neutra }} aria-hidden />
          Antes: ≈2–3 días (estimación)
        </li>
      </ul>
    </div>
  );
}
