// Piezas de interfaz reutilizables: botones, estados con punto de color, progreso por
// segmentos, estados vacíos y de carga. Mantienen el mismo aspecto en todas las pantallas.
//
// Reglas de color: ladrillo solo para lo que requiere acción, salvia solo para «completo»,
// tinta para todo lo demás. Radios: 8 px en controles, 12 px en paneles. Espaciado en
// múltiplos de 4 px.

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/** Estilo común de inputs, selects y textareas (40 px de alto en una línea). */
export const CLASE_INPUT =
  "block w-full rounded-lg border border-borde-fuerte bg-white px-3 py-[7px] text-base leading-6 text-tinta placeholder:text-tinta-tenue/75 transition-[border-color,box-shadow] duration-150 hover:border-[#c2b79f] focus:border-tinta focus:outline-none focus:ring-[3px] focus:ring-tinta/10 aria-[invalid=true]:border-ladrillo aria-[invalid=true]:focus:ring-ladrillo/15 disabled:bg-crema disabled:text-tinta-suave sm:text-[15px]";

type Variante = "primario" | "accion" | "secundario" | "fantasma";
type Tamano = "sm" | "md" | "lg";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-tinta text-crema hover:bg-tinta-hover disabled:bg-crema-oscuro disabled:text-tinta-tenue",
  accion: "bg-ladrillo text-white hover:bg-ladrillo-oscuro disabled:bg-crema-oscuro disabled:text-tinta-tenue",
  secundario: "border border-borde-fuerte bg-white text-tinta shadow-suave hover:border-[#c2b79f] hover:bg-crema/60 disabled:text-tinta-tenue",
  fantasma: "text-tinta-suave hover:bg-crema-oscuro/70 hover:text-tinta",
};

const TAMANOS: Record<Tamano, string> = {
  sm: "h-8 gap-1.5 px-3 text-sm",
  md: "h-10 gap-2 px-4 text-[15px]",
  lg: "h-12 gap-2 px-5 text-base",
};

const BASE_BOTON =
  "inline-flex shrink-0 items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed";

function claseBoton(variante: Variante = "primario", tamano: Tamano = "md") {
  return `${BASE_BOTON} ${TAMANOS[tamano]} ${VARIANTES[variante]}`;
}

export function Boton({ variante = "primario", tamano = "md", className = "", ...props }: ComponentProps<"button"> & { variante?: Variante; tamano?: Tamano }) {
  return <button type="button" className={`${claseBoton(variante, tamano)} ${className}`} {...props} />;
}

export function BotonEnlace({ variante = "secundario", tamano = "md", className = "", ...props }: ComponentProps<typeof Link> & { variante?: Variante; tamano?: Tamano }) {
  return <Link className={`${claseBoton(variante, tamano)} ${className}`} {...props} />;
}

export type TonoEstado = "accion" | "completo" | "actual" | "neutro" | "aviso";

const PUNTOS: Record<TonoEstado, string> = {
  accion: "bg-ladrillo",
  completo: "bg-salvia",
  actual: "bg-tinta",
  neutro: "border-[1.5px] border-tinta-tenue/70",
  aviso: "bg-ambar-borde",
};

const TEXTOS_ESTADO: Record<TonoEstado, string> = {
  accion: "text-ladrillo",
  completo: "text-salvia",
  actual: "text-tinta",
  neutro: "text-tinta-suave",
  aviso: "text-ambar",
};

export function Punto({ tono, className = "" }: { tono: TonoEstado; className?: string }) {
  return <span className={`inline-block size-2 shrink-0 rounded-full ${PUNTOS[tono]} ${className}`} aria-hidden />;
}

/** Estado en texto con un punto de color delante (en lugar de insignias en píldora). */
export function Estado({ tono, children, className = "" }: { tono: TonoEstado; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[13px] font-medium whitespace-nowrap ${TEXTOS_ESTADO[tono]} ${className}`}>
      <Punto tono={tono} />
      {children}
    </span>
  );
}

/**
 * Progreso como un trazo fino por campo obligatorio. Solo se vuelve salvia al completarse;
 * `listo` permite exigir más (p. ej. que no quede nada pendiente de etapas anteriores).
 */
export function Segmentos({ completos, total, listo, className = "" }: { completos: number; total: number; listo?: boolean; className?: string }) {
  const completo = listo ?? completos >= total;
  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={completos}
      aria-label={`${completos} de ${total} campos obligatorios completos`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1 min-w-1 flex-1 rounded-full transition-colors duration-300 ${i < completos ? (completo ? "bg-salvia" : "bg-tinta/70") : "bg-borde-fuerte/80"}`}
        />
      ))}
    </div>
  );
}

/** Etiqueta de formulario. */
export const CLASE_ETIQUETA = "mb-2 flex items-center text-sm font-medium text-tinta";

/** Indicador sutil de obligatorio: un punto ladrillo junto a la etiqueta mientras falte el dato. */
export function MarcaObligatorio({ pendiente = true }: { pendiente?: boolean }) {
  return (
    <>
      {pendiente && <span className="ml-2 inline-block size-1.5 shrink-0 rounded-full bg-ladrillo" title="Obligatorio" aria-hidden />}
      <span className="sr-only"> (obligatorio)</span>
    </>
  );
}

/** Panel con borde fino y sin sombra: la jerarquía la dan el aire y la tipografía. */
export function Tarjeta({ children, className = "", ...props }: ComponentProps<"div">) {
  return (
    <div className={`rounded-xl border border-borde bg-papel ${className}`} {...props}>
      {children}
    </div>
  );
}

/** Título de bloque dentro de una página. */
export function TituloSeccion({ children, detalle, className = "" }: { children: ReactNode; detalle?: ReactNode; className?: string }) {
  return (
    <div className={`mb-4 ${className}`}>
      <h2 className="font-display text-[19px] leading-7 font-semibold tracking-[-0.01em] text-tinta">{children}</h2>
      {detalle && <p className="text-sm text-tinta-tenue">{detalle}</p>}
    </div>
  );
}

export type NombreIlustracion = "casa" | "bandeja" | "busqueda" | "grafico" | "aviso";

/** Ilustraciones de línea para los estados vacíos. */
export function Ilustracion({ nombre, className = "" }: { nombre: NombreIlustracion; className?: string }) {
  const trazo = { stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <svg viewBox="0 0 120 80" className={`text-tinta-tenue/70 ${className}`} aria-hidden>
      <path d="M16 70h88" {...trazo} strokeDasharray="1 5" />
      {nombre === "casa" && (
        <>
          <path d="M40 70V42l20-15 20 15v28" className="fill-crema-oscuro" stroke="none" />
          <path d="M40 70V42l20-15 20 15v28M34 46l26-20 26 20" {...trazo} />
          <path d="M54 70V56h12v14M46 46h8v6h-8z" {...trazo} />
          <path d="M84 34h12M90 28v12" {...trazo} strokeWidth={1.25} />
        </>
      )}
      {nombre === "bandeja" && (
        <>
          <path d="M30 46l8-14h44l8 14v16a4 4 0 0 1-4 4H34a4 4 0 0 1-4-4z" className="fill-crema-oscuro" stroke="none" />
          <path d="M44 20h32v22H44z" className="fill-papel" {...trazo} />
          <path d="M50 28h20M50 34h12" {...trazo} />
          <path d="M44 32h-6l-8 14M76 32h6l8 14M30 46v16a4 4 0 0 0 4 4h52a4 4 0 0 0 4-4V46" {...trazo} />
          <path d="M30 46h16l4 6h20l4-6h16" {...trazo} />
        </>
      )}
      {nombre === "busqueda" && (
        <>
          <path d="M38 14h30l10 10v40H38z" className="fill-crema-oscuro" stroke="none" />
          <path d="M38 14h30l10 10v40H38zM68 14v10h10" {...trazo} />
          <path d="M45 32h18M45 39h12" {...trazo} />
          <circle cx="72" cy="50" r="10" className="fill-papel" {...trazo} />
          <path d="M79 57l9 9" {...trazo} strokeWidth={2} />
        </>
      )}
      {nombre === "grafico" && (
        <>
          <path d="M30 16v50h62" {...trazo} />
          <path d="M40 58h8v8h-8zM56 58h8v8h-8zM72 58h8v8h-8z" className="fill-crema-oscuro" stroke="none" />
          <path d="M36 46c10-2 16 2 24-1s14-9 30-6" {...trazo} strokeDasharray="3 4" />
        </>
      )}
      {nombre === "aviso" && (
        <>
          <path d="M60 18l28 48H32z" className="fill-crema-oscuro" stroke="none" />
          <path d="M60 18l28 48H32z" {...trazo} />
          <path d="M60 36v14" {...trazo} strokeWidth={2} />
          <circle cx="60" cy="57" r="1.5" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

export function EstadoVacio({
  ilustracion = "bandeja",
  titulo,
  descripcion,
  accion,
  compacto = false,
}: {
  ilustracion?: NombreIlustracion;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  compacto?: boolean;
}) {
  if (compacto) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-borde-fuerte px-4 py-6 text-center">
        <Ilustracion nombre={ilustracion} className="w-16" />
        <p className="text-[13px] text-tinta-tenue">{titulo}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <Ilustracion nombre={ilustracion} className="mb-4 w-32" />
      <p className="font-display text-lg font-semibold text-tinta">{titulo}</p>
      {descripcion && <p className="mt-1 max-w-sm text-[15px] text-tinta-suave">{descripcion}</p>}
      {accion && <div className="mt-6">{accion}</div>}
    </div>
  );
}

/** Esqueleto de carga mientras se leen los datos del navegador. */
export function Cargando({ filas = 3 }: { filas?: number }) {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando datos…</span>
      <div className="space-y-3">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-crema-oscuro" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-crema-oscuro/70" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: filas }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-crema-oscuro/70" />
        ))}
      </div>
    </div>
  );
}

export function TituloPagina({ antetitulo, titulo, descripcion, acciones }: { antetitulo?: ReactNode; titulo: string; descripcion?: ReactNode; acciones?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-10">
      <div className="min-w-0">
        {antetitulo && <div className="mb-2 text-[13px] font-medium text-tinta-tenue">{antetitulo}</div>}
        <h1 className="font-display text-[28px] leading-[1.1] font-semibold tracking-[-0.025em] text-balance text-tinta sm:text-[34px]">{titulo}</h1>
        {descripcion && <div className="mt-2 max-w-2xl text-[15px] text-pretty text-tinta-suave">{descripcion}</div>}
      </div>
      {acciones && <div className="flex shrink-0 flex-wrap gap-2">{acciones}</div>}
    </header>
  );
}

/** Ruta de navegación corta: «Embudo › VIV-1017». */
export function Migas({ items }: { items: { etiqueta: string; href?: string }[] }) {
  return (
    <nav aria-label="Ruta" className="mb-4 text-[13px] font-medium text-tinta-tenue">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={it.etiqueta} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 text-tinta-tenue/60" aria-hidden />}
            {it.href ? (
              <Link href={it.href} className="rounded transition-colors hover:text-tinta">
                {it.etiqueta}
              </Link>
            ) : (
              <span aria-current="page" className="text-tinta-suave tabular-nums">
                {it.etiqueta}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
