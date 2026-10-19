// Cálculo de las métricas del panel a partir de viviendas y traspasos.

import { COLUMNAS_EMBUDO } from "./stages";
import type { Traspaso, Vivienda } from "./types";
import { fichaCompletaEnSuEtapa } from "./validation";

export interface Metricas {
  /** % de viviendas cuyo PRIMER traspaso se aceptó sin devolución (sobre las ya revisadas). */
  pctALaPrimera: number | null;
  aceptadosALaPrimera: number;
  primerosRevisados: number;
  /** Desglose de esos primeros traspasos según se firmaran con la ficha completa o con campos pendientes (modo piloto). */
  conFichaCompleta: { aceptados: number; revisados: number };
  conPendientes: { aceptados: number; revisados: number };
  pendientesRevision: number;
  totalTraspasos: number;
  devoluciones: number;
  motivos: { campo: string; veces: number }[];
  porEtapa: { id: string; nombre: string; viviendas: number }[];
  pctFichasCompletas: number | null;
  fichasCompletas: number;
  viviendasEnEmbudo: number;
  /** Tiempo medio entre "Firmar" y la creación del traspaso, en milisegundos. */
  tiempoMedioFirmaTraspasoMs: number | null;
  avancesConPendientes: number;
}

export function calcularMetricas(viviendas: Vivienda[], traspasos: Traspaso[]): Metricas {
  // Primer traspaso de cada vivienda (el más antiguo).
  const primeros = new Map<string, Traspaso>();
  [...traspasos]
    .sort((a, b) => a.creadoEn.localeCompare(b.creadoEn))
    .forEach((t) => {
      if (!primeros.has(t.viviendaId)) primeros.set(t.viviendaId, t);
    });
  const revisados = [...primeros.values()].filter((t) => t.estado !== "Pendiente de revisión");
  const aceptadosALaPrimera = revisados.filter((t) => t.estado === "Aceptado").length;
  const desglose = (lista: Traspaso[]) => ({ aceptados: lista.filter((t) => t.estado === "Aceptado").length, revisados: lista.length });
  const firmadosConPendientes = (t: Traspaso) => (t.camposPendientes?.length ?? 0) > 0;

  const devueltos = traspasos.filter((t) => t.estado === "Devuelto a Supply");
  const conteo = new Map<string, number>();
  devueltos.forEach((t) => {
    const campo = t.motivoDevolucion?.campoEtiqueta ?? "Sin motivo";
    conteo.set(campo, (conteo.get(campo) ?? 0) + 1);
  });

  const enEmbudo = viviendas.filter((v) => v.etapa !== "traspasada");
  const completas = enEmbudo.filter(fichaCompletaEnSuEtapa).length;

  const tiempos = traspasos.map((t) => new Date(t.creadoEn).getTime() - new Date(t.firmadoEn).getTime()).filter((ms) => Number.isFinite(ms));

  return {
    pctALaPrimera: revisados.length ? aceptadosALaPrimera / revisados.length : null,
    aceptadosALaPrimera,
    primerosRevisados: revisados.length,
    conFichaCompleta: desglose(revisados.filter((t) => !firmadosConPendientes(t))),
    conPendientes: desglose(revisados.filter(firmadosConPendientes)),
    pendientesRevision: traspasos.filter((t) => t.estado === "Pendiente de revisión").length,
    totalTraspasos: traspasos.length,
    devoluciones: devueltos.length,
    motivos: [...conteo.entries()].map(([campo, veces]) => ({ campo, veces })).sort((a, b) => b.veces - a.veces),
    porEtapa: COLUMNAS_EMBUDO.map((c) => ({ id: c.id, nombre: c.nombre, viviendas: viviendas.filter((v) => v.etapa === c.id).length })),
    pctFichasCompletas: enEmbudo.length ? completas / enEmbudo.length : null,
    fichasCompletas: completas,
    viviendasEnEmbudo: enEmbudo.length,
    tiempoMedioFirmaTraspasoMs: tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : null,
    avancesConPendientes: viviendas.reduce((n, v) => n + v.historial.filter((e) => e.camposPendientes?.length).length, 0),
  };
}
