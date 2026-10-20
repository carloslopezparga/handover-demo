"use client";

// Notificaciones flotantes ("toasts"), p. ej. "Traspaso enviado a reformas".
// Entran desde abajo y, al cerrarse, salen desvaneciéndose antes de desaparecer.

import { Check, Info, TriangleAlert, X } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Tipo = "exito" | "info" | "aviso";

export interface Notificacion {
  titulo: string;
  descripcion?: string;
  tipo?: Tipo;
  accion?: { etiqueta: string; href: string };
}

interface NotificacionActiva extends Notificacion {
  id: number;
  saliendo?: boolean;
}

const Contexto = createContext<((n: Notificacion) => void) | null>(null);

const DURACION_MS = 7000;
const SALIDA_MS = 180;

const ICONOS: Record<Tipo, ReactNode> = {
  exito: (
    <span className="animar-pop flex size-6 items-center justify-center rounded-full bg-azul text-white" style={{ "--retraso": "120ms" } as CSSProperties}>
      <Check className="size-3.5" aria-hidden />
    </span>
  ),
  info: (
    <span className="flex size-6 items-center justify-center rounded-full bg-tinta-2 text-white/80">
      <Info className="size-4" aria-hidden />
    </span>
  ),
  aviso: (
    <span className="flex size-6 items-center justify-center rounded-full bg-piloto text-white">
      <TriangleAlert className="size-3.5" aria-hidden />
    </span>
  ),
};

export function NotificacionesProvider({ children }: { children: ReactNode }) {
  const [lista, setLista] = useState<NotificacionActiva[]>([]);
  const contador = useRef(0);

  const cerrar = useCallback((id: number) => {
    setLista((l) => l.map((n) => (n.id === id ? { ...n, saliendo: true } : n)));
    window.setTimeout(() => setLista((l) => l.filter((n) => n.id !== id)), SALIDA_MS);
  }, []);

  const notificar = useCallback(
    (n: Notificacion) => {
      const id = ++contador.current;
      // Un aviso a la vez: el anterior sale con su animación y deja sitio al nuevo.
      setLista((l) => [...l.map((x) => (x.saliendo ? x : { ...x, saliendo: true })), { ...n, id }]);
      window.setTimeout(() => setLista((l) => l.filter((x) => !x.saliendo || x.id === id)), SALIDA_MS);
      window.setTimeout(() => cerrar(id), DURACION_MS);
    },
    [cerrar],
  );

  const valor = useMemo(() => notificar, [notificar]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:px-8" aria-live="polite">
        {lista.map((n) => (
          <div
            key={n.id}
            role="status"
            className={`sobre-oscuro pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border border-tinta-2 bg-tinta py-3 pr-2 pl-3 text-white shadow-flotante ${n.saliendo ? "aviso-sale" : "aviso-entra"}`}
          >
            <div className="mt-px shrink-0">{ICONOS[n.tipo ?? "exito"]}</div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] leading-6 font-semibold">{n.titulo}</p>
              {n.descripcion && <p className="text-sm text-white/70">{n.descripcion}</p>}
              {n.accion && (
                <Link
                  href={n.accion.href}
                  onClick={() => cerrar(n.id)}
                  className="mt-2 inline-flex items-center gap-1 rounded text-sm font-semibold text-azul-claro underline decoration-azul-claro/40 underline-offset-4 transition-colors hover:decoration-azul-claro"
                >
                  {n.accion.etiqueta}
                </Link>
              )}
            </div>
            <button type="button" onClick={() => cerrar(n.id)} className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white" aria-label="Cerrar notificación">
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </Contexto.Provider>
  );
}

export function useNotificar() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useNotificar debe usarse dentro de <NotificacionesProvider>");
  return ctx;
}
