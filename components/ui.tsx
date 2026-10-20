// Piezas de interfaz reutilizables: botones, estados, progreso por segmentos, estados vacíos
// y de carga. Mantienen el mismo aspecto en todas las pantallas.
//
// Reglas de color (tokens en app/globals.css): azul solo para lo que pide acción o atención,
// marino para «completo» (siempre con check), tinta y grises para todo lo demás.
// Radios: 8 px en controles, 12 px en paneles. Espaciado en múltiplos de 4 px.

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

/** Estilo común de inputs, selects y textareas (40 px de alto en una línea). */
export const CLASE_INPUT =
  "block w-full rounded-lg border border-borde-fuerte bg-superficie px-3 py-[7px] text-base leading-6 text-tinta shadow-suave placeholder:text-secundario/80 transition-[border-color,box-shadow] duration-150 hover:border-secundario/60 focus:border-azul focus:outline-none focus:ring-[3px] focus:ring-azul/15 aria-[invalid=true]:border-error aria-[invalid=true]:focus:ring-error/15 disabled:bg-fondo-2 disabled:text-secundario sm:text-[15px]";

type Variante = "primario" | "secundario" | "fantasma";
type Tamano = "sm" | "md" | "lg";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-azul text-white shadow-suave hover:bg-azul-hover active:bg-azul-hover disabled:bg-fondo-2 disabled:text-secundario disabled:shadow-none",
  secundario: "border border-borde-fuerte bg-superficie text-tinta shadow-suave hover:border-secundario/50 hover:bg-fondo disabled:text-secundario",
  fantasma: "text-pizarra hover:bg-fondo-2 hover:text-tinta",
};

const TAMANOS: Record<Tamano, string> = {
  sm: "h-8 gap-1.5 px-3 text-sm",
  md: "h-10 gap-2 px-4 text-[15px]",
  lg: "h-12 gap-2 px-5 text-base",
};

const BASE_BOTON =
  "inline-flex shrink-0 items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:active:translate-y-0";

export function claseBoton(variante: Variante = "primario", tamano: Tamano = "md") {
  return `${BASE_BOTON} ${TAMANOS[tamano]} ${VARIANTES[variante]}`;
}

export function Boton({ variante = "primario", tamano = "md", className = "", ...props }: ComponentProps<"button"> & { variante?: Variante; tamano?: Tamano }) {
  return <button type="button" className={`${claseBoton(variante, tamano)} ${className}`} {...props} />;
}

export function BotonEnlace({ variante = "secundario", tamano = "md", className = "", ...props }: ComponentProps<typeof Link> & { variante?: Variante; tamano?: Tamano }) {
  return <Link className={`${claseBoton(variante, tamano)} ${className}`} {...props} />;
}

export type TonoEstado = "accion" | "completo" | "actual" | "neutro" | "aviso";

const PUNTOS: Record<Exclude<TonoEstado, "completo">, string> = {
  accion: "bg-azul",
  actual: "bg-azul ring-[3px] ring-azul/20",
  neutro: "border-[1.5px] border-secundario",
  aviso: "bg-piloto",
};

const TEXTOS_ESTADO: Record<TonoEstado, string> = {
  accion: "text-azul",
  completo: "text-marino",
  actual: "text-tinta",
  neutro: "text-pizarra",
  aviso: "text-piloto",
};

export function Punto({ tono, className = "" }: { tono: Exclude<TonoEstado, "completo">; className?: string }) {
  return <span className={`inline-block size-2 shrink-0 rounded-full ${PUNTOS[tono]} ${className}`} aria-hidden />;
}

/** Check blanco sobre círculo marino: la marca de «completo» (el color nunca va solo). */
export function IconoCompleto({ className = "size-3.5", animar = false, style }: { className?: string; animar?: boolean; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 16 16" className={`shrink-0 ${animar ? "animar-pop" : ""} ${className}`} style={style} aria-hidden>
      <circle cx="8" cy="8" r="8" className="fill-marino" />
      <path d="M4.6 8.3l2.2 2.2 4.6-4.8" fill="none" stroke="white" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Estado en texto con un punto de color delante (o el check, si es «completo»). `envolver` deja partir línea. */
export function Estado({ tono, children, className = "", icono, envolver = false }: { tono: TonoEstado; children: ReactNode; className?: string; icono?: ReactNode; envolver?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[13px] font-medium ${envolver ? "" : "whitespace-nowrap"} ${TEXTOS_ESTADO[tono]} ${className}`}>
      {icono ?? (tono === "completo" ? <IconoCompleto /> : <Punto tono={tono} />)}
      {children}
    </span>
  );
}

/**
 * Progreso como un trazo fino por campo obligatorio. Los trazos se rellenan en azul con una
 * transición y pasan a marino cuando no queda nada pendiente (`listo` permite exigir más,
 * p. ej. que no falte nada de etapas anteriores).
 */
export function Segmentos({ completos, total, listo, className = "", grosor = "h-1" }: { completos: number; total: number; listo?: boolean; className?: string; grosor?: string }) {
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
        <span key={i} className={`relative min-w-1 flex-1 overflow-hidden rounded-full bg-borde-fuerte/80 ${grosor}`}>
          <span
            className={`absolute inset-0 origin-left rounded-full transition-[transform,background-color] duration-500 ease-[var(--ease-salida)] ${
              i < completos ? "scale-x-100" : "scale-x-0"
            } ${completo ? "bg-marino" : "bg-azul"}`}
            style={{ transitionDelay: `${i * 40}ms` }}
          />
        </span>
      ))}
    </div>
  );
}

/** Etiqueta de formulario. */
export const CLASE_ETIQUETA = "mb-2 flex items-center text-sm font-medium text-tinta";

/** Indicador sutil de obligatorio: un punto azul junto a la etiqueta mientras falte el dato. */
export function MarcaObligatorio({ pendiente = true }: { pendiente?: boolean }) {
  return (
    <>
      {pendiente && <span className="animar-pop ml-2 inline-block size-1.5 shrink-0 rounded-full bg-azul" title="Obligatorio" aria-hidden />}
      <span className="sr-only"> (obligatorio)</span>
    </>
  );
}

/** Pastilla pequeña (p. ej. «Nuevo», «Etapa actual»). Azul solo si pide atención. */
export function Pastilla({ children, tono = "neutro", className = "" }: { children: ReactNode; tono?: "atencion" | "neutro"; className?: string }) {
  const estilo = tono === "atencion" ? "bg-azul-claro text-azul-hover" : "bg-fondo-2 text-pizarra";
  return <span className={`inline-flex h-5 items-center rounded-full px-2 text-[12px] leading-none font-semibold whitespace-nowrap ${estilo} ${className}`}>{children}</span>;
}

/** Panel blanco con borde fino y sin sombra: la jerarquía la dan el aire y la tipografía. */
export function Tarjeta({ children, className = "", ...props }: ComponentProps<"div">) {
  return (
    <div className={`rounded-xl border border-borde bg-superficie ${className}`} {...props}>
      {children}
    </div>
  );
}

/** Título de bloque dentro de un panel blanco. */
export function TituloSeccion({ children, detalle, className = "" }: { children: ReactNode; detalle?: ReactNode; className?: string }) {
  return (
    <div className={`mb-4 ${className}`}>
      <h2 className="font-display text-xl leading-7 font-semibold tracking-[-0.01em] text-tinta">{children}</h2>
      {detalle && <p className="mt-0.5 text-sm text-secundario">{detalle}</p>}
    </div>
  );
}

export type NombreIlustracion = "casa" | "bandeja" | "busqueda" | "grafico" | "aviso";

/** Ilustraciones de línea para los estados vacíos: trazo gris y un único detalle en azul. */
export function Ilustracion({ nombre, className = "" }: { nombre: NombreIlustracion; className?: string }) {
  const trazo = { stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const acento = { ...trazo, stroke: "var(--color-azul)" };
  return (
    <svg viewBox="0 0 120 80" className={`text-secundario ${className}`} aria-hidden>
      <path d="M16 70h88" {...trazo} strokeDasharray="1 5" />
      {nombre === "casa" && (
        <>
          <path d="M40 70V42l20-15 20 15v28" className="fill-fondo-2" stroke="none" />
          <path d="M40 70V42l20-15 20 15v28M34 46l26-20 26 20" {...trazo} />
          <path d="M54 70V56h12v14M46 46h8v6h-8z" {...trazo} />
          <path d="M84 34h12M90 28v12" {...acento} strokeWidth={1.75} />
        </>
      )}
      {nombre === "bandeja" && (
        <>
          <path d="M30 46l8-14h44l8 14v16a4 4 0 0 1-4 4H34a4 4 0 0 1-4-4z" className="fill-fondo-2" stroke="none" />
          <path d="M44 20h32v22H44z" className="fill-superficie" {...trazo} />
          <path d="M50 28h20" {...acento} />
          <path d="M50 34h12" {...trazo} />
          <path d="M44 32h-6l-8 14M76 32h6l8 14M30 46v16a4 4 0 0 0 4 4h52a4 4 0 0 0 4-4V46" {...trazo} />
          <path d="M30 46h16l4 6h20l4-6h16" {...trazo} />
        </>
      )}
      {nombre === "busqueda" && (
        <>
          <path d="M38 14h30l10 10v40H38z" className="fill-fondo-2" stroke="none" />
          <path d="M38 14h30l10 10v40H38zM68 14v10h10" {...trazo} />
          <path d="M45 32h18M45 39h12" {...trazo} />
          <circle cx="72" cy="50" r="10" className="fill-superficie" {...acento} />
          <path d="M79 57l9 9" {...acento} strokeWidth={2} />
        </>
      )}
      {nombre === "grafico" && (
        <>
          <path d="M30 16v50h62" {...trazo} />
          <path d="M40 58h8v8h-8zM56 52h8v14h-8zM72 44h8v22h-8z" className="fill-fondo-2" stroke="none" />
          <path d="M36 46c10-2 16 2 24-1s14-9 30-6" {...acento} strokeDasharray="3 4" />
        </>
      )}
      {nombre === "aviso" && (
        <>
          <path d="M60 18l28 48H32z" className="fill-fondo-2" stroke="none" />
          <path d="M60 18l28 48H32z" {...trazo} />
          <path d="M60 36v14" {...acento} strokeWidth={2} />
          <circle cx="60" cy="57" r="1.5" fill="var(--color-azul)" />
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
        <p className="text-[13px] text-secundario-fondo">{titulo}</p>
      </div>
    );
  }
  return (
    <div className="animar-entrada mx-auto flex max-w-lg flex-col items-center justify-center rounded-xl border border-borde bg-superficie px-6 py-16 text-center shadow-suave sm:mt-12">
      <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-fondo">
        <Ilustracion nombre={ilustracion} className="w-20" />
      </div>
      <p className="font-display text-2xl leading-8 font-semibold tracking-[-0.01em] text-tinta">{titulo}</p>
      {descripcion && <p className="mt-2 max-w-sm text-[15px] text-pretty text-secundario">{descripcion}</p>}
      {accion && <div className="mt-8">{accion}</div>}
    </div>
  );
}

function Bloque({ className = "" }: { className?: string }) {
  return <div className={`esqueleto rounded-lg ${className}`} />;
}

/** Esqueleto de carga (con la forma de la pantalla) mientras se leen los datos del navegador. */
export function Cargando({ tipo = "lista" }: { tipo?: "embudo" | "ficha" | "lista" | "metricas" }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando datos…</span>
      <div className="mb-8 space-y-3 lg:mb-10">
        <Bloque className="h-4 w-20" />
        <Bloque className="h-9 w-72 max-w-full" />
        <Bloque className="h-4 w-96 max-w-full" />
      </div>
      {tipo === "embudo" && (
        <div className="grid gap-3 md:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="space-y-2 rounded-xl bg-fondo-2/70 p-1.5">
              <Bloque className="m-2 h-4 w-20" />
              {Array.from({ length: i % 2 === 0 ? 2 : 1 }, (_, j) => (
                <div key={j} className="h-32 rounded-lg border border-borde bg-superficie p-3">
                  <Bloque className="h-4 w-4/5" />
                  <Bloque className="mt-2 h-3 w-1/2" />
                  <Bloque className="mt-6 h-1 w-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {tipo === "ficha" && (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex gap-4">
                <Bloque className="size-5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Bloque className="h-5 w-40" />
                  <Bloque className="h-3 w-64 max-w-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="order-first h-72 rounded-xl border border-borde bg-superficie p-6 lg:order-none">
            <Bloque className="h-3 w-24" />
            <Bloque className="mt-3 h-6 w-48" />
            <Bloque className="mt-8 h-14 w-24" />
          </div>
        </div>
      )}
      {tipo === "lista" && (
        <div className="divide-y divide-borde rounded-xl border border-borde bg-superficie">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-3 p-6">
              <Bloque className="h-3 w-48" />
              <Bloque className="h-5 w-80 max-w-full" />
              <Bloque className="h-3 w-56" />
            </div>
          ))}
        </div>
      )}
      {tipo === "metricas" && (
        <div className="grid gap-4 lg:grid-cols-[7fr_5fr]">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="h-80 rounded-xl border border-borde bg-superficie p-8">
              <Bloque className="h-4 w-56" />
              <Bloque className="mt-6 h-20 w-40" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TituloPagina({ antetitulo, titulo, descripcion, acciones }: { antetitulo?: ReactNode; titulo: string; descripcion?: ReactNode; acciones?: ReactNode }) {
  return (
    <header className="animar-entrada mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-10">
      <div className="min-w-0">
        {antetitulo && <div className="mb-2 text-[13px] font-medium text-secundario-fondo">{antetitulo}</div>}
        <h1 className="font-display text-[30px] leading-[1.1] font-semibold tracking-[-0.015em] text-balance text-tinta sm:text-[38px]">{titulo}</h1>
        {descripcion && <div className="mt-3 max-w-2xl text-[15px] text-pretty text-secundario-fondo">{descripcion}</div>}
      </div>
      {acciones && <div className="flex shrink-0 flex-wrap gap-2">{acciones}</div>}
    </header>
  );
}

/** Ruta de navegación corta: «Embudo › VIV-1017». */
export function Migas({ items }: { items: { etiqueta: string; href?: string }[] }) {
  return (
    <nav aria-label="Ruta" className="mb-4 text-[13px] font-medium text-secundario-fondo">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={it.etiqueta} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 text-secundario-fondo/70" aria-hidden />}
            {it.href ? (
              <Link href={it.href} className="rounded transition-colors hover:text-tinta">
                {it.etiqueta}
              </Link>
            ) : (
              <span aria-current="page" className="text-pizarra tabular-nums">
                {it.etiqueta}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Check de éxito animado: círculo que aparece con un pequeño rebote, una onda que se expande
 * una vez y el trazo del check que se dibuja. Con `animar` a false, se muestra fijo.
 */
export function CheckExito({
  animar = true,
  className = "size-12",
  tono = "marino",
  retraso = 0,
}: {
  animar?: boolean;
  className?: string;
  tono?: "marino" | "azul";
  /** Milisegundos antes de empezar (p. ej. para esperar a que termine un scroll). */
  retraso?: number;
}) {
  const fondo = tono === "azul" ? "bg-azul" : "bg-marino";
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${className}`} aria-hidden>
      {animar && <span className={`animar-onda absolute inset-0 rounded-full ${fondo}`} style={{ animationDelay: `${retraso + 260}ms` }} />}
      <span className={`relative flex size-full items-center justify-center rounded-full ${fondo} ${animar ? "animar-pop" : ""}`} style={{ "--retraso": `${retraso}ms` } as CSSProperties}>
        <svg viewBox="0 0 24 24" className="size-1/2" fill="none">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={animar ? "trazo-dibujado" : ""}
            style={{ "--longitud": 22, "--retraso": `${retraso + 180}ms` } as CSSProperties}
          />
        </svg>
      </span>
    </span>
  );
}
