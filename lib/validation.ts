// Reglas de validación de la ficha. Leen la configuración de `lib/stages.ts`:
// aquí no hay ningún campo concreto, solo cómo se valida cada TIPO de campo.

import { ETAPAS, buscarCampo, indiceEtapa } from "./stages";
import { formatEuros, formatFecha, formatNumero, parseFecha, parseNumero } from "./format";
import type { DefinicionCampo, EtapaId, Ficha, RespuestaSiNo, ValorCampo, Vivienda } from "./types";

export interface ResultadoCampo {
  /** El campo cumple todo lo necesario para contar como completo. */
  completo: boolean;
  /** No se ha rellenado nada todavía. */
  vacio: boolean;
  /** Mensaje cuando hay algo escrito pero no es válido. */
  error?: string;
}

const RE_EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const RE_URL = /^(https?:\/\/\S+|\/\S+)$/;

export function esUrlImagenValida(url: string): boolean {
  return RE_URL.test(url.trim());
}

function texto(valor: ValorCampo): string {
  return typeof valor === "string" ? valor.trim() : typeof valor === "number" ? String(valor) : "";
}

function lista(valor: ValorCampo): string[] {
  return Array.isArray(valor) ? valor : [];
}

export function validarCampo(def: DefinicionCampo, valor: ValorCampo, ficha: Ficha): ResultadoCampo {
  switch (def.tipo) {
    case "texto":
    case "textoLargo": {
      const t = texto(valor);
      if (!t) return { completo: false, vacio: true };
      if (t.length < 3) return { completo: false, vacio: false, error: "Demasiado corto" };
      return { completo: true, vacio: false };
    }
    case "contacto": {
      const t = texto(valor);
      if (!t) return { completo: false, vacio: true };
      const digitos = t.replace(/\D/g, "").length;
      if (digitos < 9 && !RE_EMAIL.test(t)) {
        return { completo: false, vacio: false, error: "Incluye un teléfono (9 cifras) o un email" };
      }
      return { completo: true, vacio: false };
    }
    case "numero":
    case "entero":
    case "moneda":
    case "porcentaje": {
      const t = texto(valor);
      if (!t) return { completo: false, vacio: true };
      const n = parseNumero(t);
      if (n == null) return { completo: false, vacio: false, error: "Escribe un número válido (p. ej. 85 o 85,5)" };
      if (def.tipo === "entero" && !Number.isInteger(n)) return { completo: false, vacio: false, error: "Debe ser un número entero" };
      const fmt = def.tipo === "moneda" ? formatEuros : formatNumero;
      if (def.min != null && n < def.min) return { completo: false, vacio: false, error: `Mínimo ${fmt(def.min)}${def.tipo === "moneda" ? "" : sufijo(def)}` };
      if (def.max != null && n > def.max) return { completo: false, vacio: false, error: `Máximo ${fmt(def.max)}${def.tipo === "moneda" ? "" : sufijo(def)}` };
      if (def.noMayorQue) {
        const otro = parseNumero(texto(ficha[def.noMayorQue] ?? null));
        if (otro != null && n > otro) {
          const etiquetaOtro = buscarCampo(def.noMayorQue)?.campo.etiqueta ?? def.noMayorQue;
          return { completo: false, vacio: false, error: `No puede superar los ${etiquetaOtro} (${formatNumero(otro)})` };
        }
      }
      return { completo: true, vacio: false };
    }
    case "seleccion":
    case "siNo": {
      const t = texto(valor);
      return t ? { completo: true, vacio: false } : { completo: false, vacio: true };
    }
    case "siNoComentario": {
      const r = (valor as RespuestaSiNo | null) ?? { respuesta: "", comentario: "" };
      const comentario = (r.comentario ?? "").trim();
      if (!r.respuesta && !comentario) return { completo: false, vacio: true };
      if (!r.respuesta) return { completo: false, vacio: false, error: "Indica sí o no" };
      if (comentario.length < 3) return { completo: false, vacio: false, error: "Añade un comentario breve" };
      return { completo: true, vacio: false };
    }
    case "valoracion": {
      const n = parseNumero(texto(valor));
      if (n == null) return { completo: false, vacio: true };
      return n >= 1 && n <= 5 ? { completo: true, vacio: false } : { completo: false, vacio: false, error: "Valor entre 1 y 5" };
    }
    case "fecha": {
      const t = texto(valor);
      if (!t) return { completo: false, vacio: true };
      return parseFecha(t) ? { completo: true, vacio: false } : { completo: false, vacio: false, error: "Fecha no válida" };
    }
    case "multiSeleccion": {
      const l = lista(valor);
      const min = def.minElementos ?? 1;
      if (l.length === 0) return { completo: false, vacio: true };
      return l.length >= min ? { completo: true, vacio: false } : { completo: false, vacio: false, error: `Selecciona al menos ${min}` };
    }
    case "casillas": {
      const l = lista(valor);
      if (l.length === 0) return { completo: false, vacio: true };
      if (def.todasObligatorias) {
        const faltan = (def.opciones ?? []).filter((o) => !l.includes(o.valor));
        if (faltan.length > 0) return { completo: false, vacio: false, error: `Falta: ${faltan.map((o) => o.etiqueta).join(", ")}` };
      }
      return { completo: true, vacio: false };
    }
    case "fotos": {
      const l = lista(valor);
      const min = def.minElementos ?? 1;
      if (l.length === 0) return { completo: false, vacio: true };
      const invalidas = l.filter((u) => !esUrlImagenValida(u)).length;
      if (invalidas > 0) return { completo: false, vacio: false, error: `${invalidas} URL no válida` };
      if (l.length < min) {
        const faltan = min - l.length;
        return { completo: false, vacio: false, error: `${l.length} de ${min}: falta${faltan === 1 ? "" : "n"} ${faltan} foto${faltan === 1 ? "" : "s"}` };
      }
      return { completo: true, vacio: false };
    }
  }
}

function sufijo(def: DefinicionCampo): string {
  return def.unidad ? ` ${def.unidad}` : "";
}

export interface CampoPendiente {
  clave: string;
  etiqueta: string;
  etapaId: EtapaId;
  etapaNombre: string;
  motivo: string;
  /** El campo lo ha devuelto Reformas. */
  devuelto?: boolean;
}

/** Serializa un valor para comparar si ha cambiado. */
export function serializarValor(valor: ValorCampo | undefined): string {
  return JSON.stringify(valor ?? null);
}

/** ¿La devolución de Reformas sigue sin atender (ni corregida ni marcada como revisada)? */
export function devolucionPendiente(v: Vivienda): boolean {
  const d = v.devolucion;
  if (!d || d.revisada) return false;
  return serializarValor(v.ficha[d.campo]) === d.valorAlDevolver;
}

/**
 * Lo que impide salir de la etapa actual: campos obligatorios sin completar de esta
 * etapa y de las anteriores, más el campo devuelto por Reformas si aún no se ha revisado.
 */
export function camposPendientes(v: Vivienda): CampoPendiente[] {
  if (v.etapa === "traspasada") return [];
  const idx = indiceEtapa(v.etapa);
  const pendientes: CampoPendiente[] = [];
  ETAPAS.slice(0, idx + 1).forEach((etapa) => {
    etapa.campos.forEach((campo) => {
      if (!campo.obligatorio) return;
      const r = validarCampo(campo, v.ficha[campo.clave] ?? null, v.ficha);
      if (!r.completo) {
        pendientes.push({ clave: campo.clave, etiqueta: campo.etiqueta, etapaId: etapa.id, etapaNombre: etapa.nombre, motivo: r.error ?? "Sin rellenar" });
      }
    });
  });
  if (v.devolucion && devolucionPendiente(v)) {
    const existente = pendientes.find((p) => p.clave === v.devolucion!.campo);
    if (existente) {
      existente.devuelto = true;
    } else {
      const encontrado = buscarCampo(v.devolucion.campo);
      pendientes.unshift({
        clave: v.devolucion.campo,
        etiqueta: v.devolucion.campoEtiqueta,
        etapaId: encontrado?.etapa.id ?? "firma",
        etapaNombre: encontrado?.etapa.nombre ?? "Firma",
        motivo: "Devuelto por Reformas: revisar",
        devuelto: true,
      });
    }
  }
  return pendientes;
}

/** Progreso de los campos obligatorios de UNA etapa. */
export function progresoEtapa(v: Vivienda, etapaId: EtapaId): { completos: number; total: number } {
  const etapa = ETAPAS.find((e) => e.id === etapaId)!;
  const obligatorios = etapa.campos.filter((c) => c.obligatorio);
  const completos = obligatorios.filter((c) => validarCampo(c, v.ficha[c.clave] ?? null, v.ficha).completo).length;
  return { completos, total: obligatorios.length };
}

/** ¿Están completos todos los obligatorios de la etapa en la que está la vivienda? */
export function fichaCompletaEnSuEtapa(v: Vivienda): boolean {
  if (v.etapa === "traspasada") return true;
  const { completos, total } = progresoEtapa(v, v.etapa);
  return completos === total;
}

/** Texto legible de un valor, para la vista de solo lectura. */
export function textoValor(def: DefinicionCampo, valor: ValorCampo | undefined): string {
  if (valor == null || valor === "") return "—";
  switch (def.tipo) {
    case "moneda":
      return formatEuros(valor as string);
    case "numero":
    case "entero":
    case "porcentaje": {
      const n = formatNumero(valor as string);
      return n === "—" ? String(valor) : `${n}${def.unidad ? ` ${def.unidad}` : ""}`;
    }
    case "seleccion":
      return def.opciones?.find((o) => o.valor === valor)?.etiqueta ?? String(valor);
    case "siNo":
      return valor === "si" ? "Sí" : valor === "no" ? "No" : "—";
    case "siNoComentario": {
      const r = valor as RespuestaSiNo;
      const resp = r.respuesta === "si" ? "Sí" : r.respuesta === "no" ? "No" : "—";
      return r.comentario ? `${resp} · ${r.comentario}` : resp;
    }
    case "valoracion":
      return `${valor} de 5`;
    case "fecha":
      return formatFecha(valor as string);
    case "multiSeleccion":
    case "casillas": {
      const l = lista(valor);
      if (l.length === 0) return "—";
      return l.map((x) => def.opciones?.find((o) => o.valor === x)?.etiqueta ?? x).join(", ");
    }
    case "fotos":
      return `${lista(valor).length} fotos`;
    default:
      return String(valor);
  }
}
