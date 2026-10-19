"use client";

// PANTALLA 5 · Panel de métricas del traspaso Supply → Reformas.

import { BarChart3 } from "lucide-react";
import type { ReactNode } from "react";
import { Cargando, EstadoVacio, Tarjeta, TituloPagina } from "@/components/ui";
import { formatDuracion, plural } from "@/lib/format";
import { calcularMetricas } from "@/lib/metrics";
import { useStore } from "@/lib/store";

function pct(valor: number | null): string {
  return valor == null ? "—" : `${Math.round(valor * 100)} %`;
}

export default function MetricasPage() {
  const { cargado, viviendas, traspasos } = useStore();
  if (!cargado) return <Cargando filas={4} />;

  const m = calcularMetricas(viviendas, traspasos);
  const maxEtapa = Math.max(1, ...m.porEtapa.map((e) => e.viviendas));
  const maxMotivo = Math.max(1, ...m.motivos.map((x) => x.veces));

  return (
    <>
      <TituloPagina antetitulo="Supply → Reformas" titulo="Panel de métricas" descripcion="Calidad del traspaso y estado del embudo, calculados en tiempo real con los datos de la demo." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          titulo="Traspasos completos a la primera"
          valor={pct(m.pctALaPrimera)}
          detalle={`${m.aceptadosALaPrimera} de ${plural(m.primerosRevisados, "revisado")}${m.pendientesRevision ? ` · ${m.pendientesRevision} pendiente${m.pendientesRevision === 1 ? "" : "s"}` : ""}`}
          desglose={
            <>
              Con ficha completa: <strong className="font-semibold text-salvia">{m.conFichaCompleta.aceptados} de {m.conFichaCompleta.revisados}</strong>
              {m.conPendientes.revisados > 0 && (
                <>
                  {" "}
                  · con campos pendientes:{" "}
                  <strong className="font-semibold text-ladrillo">
                    {m.conPendientes.aceptados} de {m.conPendientes.revisados}
                  </strong>
                </>
              )}
            </>
          }
          referencia="Antes: ≈75 % (1 de cada 4 llegaba incompleto)"
          destacado
        />
        <Kpi
          titulo="Devoluciones a Supply"
          valor={String(m.devoluciones)}
          detalle={m.totalTraspasos ? `de ${plural(m.totalTraspasos, "traspaso")} en total` : "Sin traspasos"}
        />
        <Kpi
          titulo="Fichas completas en su etapa"
          valor={pct(m.pctFichasCompletas)}
          detalle={`${m.fichasCompletas} de ${plural(m.viviendasEnEmbudo, "vivienda")} en el embudo`}
        />
        <Kpi
          titulo="Tiempo medio firma → traspaso"
          valor={m.tiempoMedioFirmaTraspasoMs == null ? "—" : formatDuracion(m.tiempoMedioFirmaTraspasoMs)}
          detalle="Se genera automáticamente al firmar"
          referencia="Antes: ≈2–3 días (estimación)"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Tarjeta className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-tinta">Viviendas por etapa</h2>
          <p className="mb-4 text-sm text-tinta-suave">{plural(viviendas.length, "vivienda")} en total</p>
          <ul className="space-y-3">
            {m.porEtapa.map((e) => (
              <FilaBarra key={e.id} etiqueta={e.nombre} valor={e.viviendas} max={maxEtapa} sufijo={e.viviendas === 1 ? "vivienda" : "viviendas"} />
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-tinta">Motivos de devolución más frecuentes</h2>
          <p className="mb-4 text-sm text-tinta-suave">Campo señalado por Reformas al devolver</p>
          {m.motivos.length === 0 ? (
            <EstadoVacio icono={<BarChart3 className="size-7" />} titulo="Sin devoluciones" descripcion="Cuando Reformas devuelva un traspaso, el motivo aparecerá aquí." />
          ) : (
            <ul className="space-y-3">
              {m.motivos.map((x) => (
                <FilaBarra key={x.campo} etiqueta={x.campo} valor={x.veces} max={maxMotivo} sufijo={x.veces === 1 ? "vez" : "veces"} />
              ))}
            </ul>
          )}
          <div className="mt-6 rounded-xl bg-crema px-4 py-3">
            <p className="text-sm text-tinta-suave">Avances registrados en modo piloto con campos pendientes</p>
            <p className="text-2xl font-bold text-tinta">{m.avancesConPendientes}</p>
          </div>
        </Tarjeta>
      </div>
    </>
  );
}

interface PropsKpi {
  titulo: string;
  valor: string;
  detalle: string;
  desglose?: ReactNode;
  referencia?: ReactNode;
  destacado?: boolean;
}

function Kpi({ titulo, valor, detalle, desglose, referencia, destacado }: PropsKpi) {
  return (
    <Tarjeta className={`flex flex-col p-5 ${destacado ? "border-tinta/20 ring-1 ring-tinta/10" : ""}`}>
      <p className="text-[15px] font-semibold text-tinta-suave">{titulo}</p>
      <p className="mt-2 text-4xl font-bold tracking-tight text-tinta tabular-nums">{valor}</p>
      <p className="mt-1 text-sm text-tinta-suave">{detalle}</p>
      {desglose && <p className="mt-2 rounded-lg bg-crema px-2.5 py-1.5 text-sm text-tinta-suave">{desglose}</p>}
      {referencia && (
        <div className="mt-auto pt-3">
          <p className="border-t border-borde pt-3 text-sm text-tinta-tenue">{referencia}</p>
        </div>
      )}
    </Tarjeta>
  );
}

function FilaBarra({ etiqueta, valor, max, sufijo }: { etiqueta: string; valor: number; max: number; sufijo: string }) {
  const ancho = (valor / max) * 100;
  return (
    <li className="grid grid-cols-[120px_1fr_auto] items-center gap-3 sm:grid-cols-[150px_1fr_auto]" title={`${etiqueta}: ${valor} ${sufijo}`}>
      <span className="truncate text-[15px] text-tinta">{etiqueta}</span>
      <span className="h-3 rounded-full bg-crema-oscuro">
        <span className="block h-full rounded-full bg-salvia transition-all duration-500" style={{ width: `${valor === 0 ? 0 : Math.max(ancho, 3)}%` }} />
      </span>
      <span className="w-8 text-right text-[15px] font-semibold text-tinta tabular-nums">{valor}</span>
    </li>
  );
}
