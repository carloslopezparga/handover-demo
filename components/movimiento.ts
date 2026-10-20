// Ayudas de movimiento: respetar prefers-reduced-motion en lo que se anima desde JS y
// recordar qué vivienda se acaba de traspasar para animar su llegada al embudo.

export function prefiereMenosMovimiento(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Scroll suave salvo que la persona haya pedido menos movimiento. */
export function comportamientoScroll(): ScrollBehavior {
  return prefiereMenosMovimiento() ? "auto" : "smooth";
}

// Vive en memoria (no en localStorage): solo sirve para el momento en que se vuelve al
// embudo tras firmar, sin recargar la página.
const VIGENCIA_LLEGADA_MS = 10 * 60 * 1000;
let llegada: { viviendaId: string; momento: number } | null = null;

/** Al firmar: la próxima vez que se abra el embudo, la vivienda «llega» a Traspasadas. */
export function anunciarLlegada(viviendaId: string) {
  llegada = { viviendaId, momento: Date.now() };
}

export function leerLlegada(): string | null {
  if (!llegada || Date.now() - llegada.momento > VIGENCIA_LLEGADA_MS) return null;
  return llegada.viviendaId;
}

export function olvidarLlegada() {
  llegada = null;
}
