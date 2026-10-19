// Piezas de interfaz reutilizables: botones, insignias, barras de progreso,
// estados vacíos y de carga. Mantienen el mismo aspecto en todas las pantallas.

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/** Estilo común de inputs, selects y textareas. */
export const CLASE_INPUT =
  "w-full rounded-lg border border-borde-fuerte bg-white px-3 py-2.5 text-base text-tinta placeholder:text-tinta-tenue transition-colors focus:border-tinta focus:outline-none focus:ring-2 focus:ring-tinta/15 aria-[invalid=true]:border-ladrillo aria-[invalid=true]:focus:ring-ladrillo/20 disabled:bg-crema disabled:text-tinta-suave";

type Variante = "primario" | "secundario" | "exito" | "fantasma" | "peligro";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-ladrillo text-white hover:bg-ladrillo-oscuro shadow-suave disabled:bg-borde-fuerte disabled:text-tinta-suave",
  secundario: "bg-papel text-tinta border border-borde-fuerte hover:bg-crema-oscuro disabled:text-tinta-tenue",
  exito: "bg-salvia text-white hover:bg-salvia-oscuro shadow-suave disabled:bg-borde-fuerte",
  fantasma: "text-tinta-suave hover:bg-crema-oscuro hover:text-tinta",
  peligro: "bg-papel text-ladrillo border border-ladrillo/50 hover:bg-ladrillo-claro",
};

const BASE_BOTON =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta disabled:cursor-not-allowed";

export function Boton({ variante = "primario", className = "", ...props }: ComponentProps<"button"> & { variante?: Variante }) {
  return <button type="button" className={`${BASE_BOTON} ${VARIANTES[variante]} ${className}`} {...props} />;
}

export function BotonEnlace({ variante = "secundario", className = "", ...props }: ComponentProps<typeof Link> & { variante?: Variante }) {
  return <Link className={`${BASE_BOTON} ${VARIANTES[variante]} ${className}`} {...props} />;
}

type TonoInsignia = "neutro" | "exito" | "aviso" | "alerta" | "info";

const TONOS: Record<TonoInsignia, string> = {
  neutro: "bg-crema-oscuro text-tinta-suave",
  exito: "bg-salvia-claro text-salvia-oscuro",
  aviso: "bg-ambar-claro text-ambar",
  alerta: "bg-ladrillo-claro text-ladrillo-oscuro",
  info: "bg-tinta text-crema",
};

export function Insignia({ tono = "neutro", children, className = "" }: { tono?: TonoInsignia; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${TONOS[tono]} ${className}`}>
      {children}
    </span>
  );
}

export function BarraProgreso({ completos, total, className = "" }: { completos: number; total: number; className?: string }) {
  const pct = total === 0 ? 100 : Math.round((completos / total) * 100);
  const completo = completos >= total;
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-crema-oscuro ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={completos}
      aria-label={`${completos} de ${total} campos completos`}
    >
      <div className={`h-full rounded-full transition-all duration-300 ${completo ? "bg-salvia" : "bg-ladrillo"}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Tarjeta({ children, className = "", ...props }: ComponentProps<"div">) {
  return (
    <div className={`rounded-xl border border-borde bg-papel shadow-suave ${className}`} {...props}>
      {children}
    </div>
  );
}

export function EstadoVacio({ icono, titulo, descripcion, accion }: { icono?: ReactNode; titulo: string; descripcion?: string; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-borde-fuerte px-6 py-10 text-center">
      {icono && <div className="mb-3 text-tinta-tenue">{icono}</div>}
      <p className="text-base font-semibold text-tinta">{titulo}</p>
      {descripcion && <p className="mt-1 max-w-sm text-[15px] text-tinta-suave">{descripcion}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}

/** Esqueleto de carga mientras se leen los datos del navegador. */
export function Cargando({ filas = 3 }: { filas?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando datos…</span>
      <div className="h-8 w-64 animate-pulse rounded-lg bg-crema-oscuro" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: filas }, (_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-crema-oscuro" />
        ))}
      </div>
    </div>
  );
}

export function TituloPagina({ antetitulo, titulo, descripcion, acciones }: { antetitulo?: string; titulo: string; descripcion?: ReactNode; acciones?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {antetitulo && <p className="mb-1 text-[13px] font-semibold uppercase tracking-wider text-tinta-tenue">{antetitulo}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-tinta sm:text-[28px]">{titulo}</h1>
        {descripcion && <p className="mt-1 text-[15px] text-tinta-suave">{descripcion}</p>}
      </div>
      {acciones && <div className="flex shrink-0 flex-wrap gap-2">{acciones}</div>}
    </div>
  );
}
