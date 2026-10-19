// Utilidades de formato en español de España.

/**
 * Convierte texto escrito por una persona en España a número.
 * Admite "185.000", "185000", "6,2", "6.2" y "1.234,5". Devuelve null si no es un número.
 */
export function parseNumero(texto: string | number | null | undefined): number | null {
  if (typeof texto === "number") return Number.isFinite(texto) ? texto : null;
  if (texto == null) return null;
  let t = String(texto).trim().replace(/\s|€|%/g, "");
  if (t === "") return null;
  if (t.includes(",")) {
    // Coma decimal: los puntos son separadores de miles.
    t = t.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(t)) {
    // "185.000" → miles
    t = t.replace(/\./g, "");
  }
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

const fmtEuros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const fmtNumero = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });

export function formatEuros(valor: string | number | null | undefined): string {
  const n = parseNumero(valor as string);
  return n == null ? "—" : fmtEuros.format(n);
}

export function formatNumero(valor: string | number | null | undefined): string {
  const n = parseNumero(valor as string);
  return n == null ? "—" : fmtNumero.format(n);
}

export function formatFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = parseFecha(iso);
  if (!d) return "—";
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export function formatFechaHora(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} · ${d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`;
}

/** Interpreta "YYYY-MM-DD" como fecha local (sin desfase de zona horaria) o un ISO completo. */
export function parseFecha(valor: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Fecha de hoy en formato "YYYY-MM-DD" (hora local). */
export function hoyISO(desplazamientoDias = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + desplazamientoDias);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function formatDuracion(ms: number): string {
  if (ms < 60_000) return "Inmediato";
  const min = Math.round(ms / 60_000);
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `${h} h`;
  return `${Math.round(h / 24)} días`;
}

export function plural(n: number, singular: string, pluralForma?: string): string {
  return `${n} ${n === 1 ? singular : (pluralForma ?? `${singular}s`)}`;
}
