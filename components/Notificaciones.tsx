"use client";

// Notificaciones flotantes ("toasts"), p. ej. "Traspaso enviado a reformas".

import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type Tipo = "exito" | "info" | "aviso";

export interface Notificacion {
  titulo: string;
  descripcion?: string;
  tipo?: Tipo;
  accion?: { etiqueta: string; href: string };
}

interface NotificacionActiva extends Notificacion {
  id: number;
}

const Contexto = createContext<((n: Notificacion) => void) | null>(null);

const ICONOS: Record<Tipo, ReactNode> = {
  exito: <CheckCircle2 className="size-[18px] text-[#9fc3bf]" strokeWidth={2} aria-hidden />,
  info: <Info className="size-[18px] text-crema/70" strokeWidth={2} aria-hidden />,
  aviso: <TriangleAlert className="size-[18px] text-ambar-borde" strokeWidth={2} aria-hidden />,
};

export function NotificacionesProvider({ children }: { children: ReactNode }) {
  const [lista, setLista] = useState<NotificacionActiva[]>([]);
  const contador = useRef(0);

  const cerrar = useCallback((id: number) => setLista((l) => l.filter((n) => n.id !== id)), []);

  const notificar = useCallback(
    (n: Notificacion) => {
      const id = ++contador.current;
      setLista((l) => [...l.slice(-1), { ...n, id }]);
      window.setTimeout(() => cerrar(id), 7000);
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
            className="animar-entrada pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl bg-tinta py-3 pr-2 pl-4 text-crema shadow-elevada"
          >
            <div className="mt-[3px] shrink-0">{ICONOS[n.tipo ?? "exito"]}</div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] leading-6 font-semibold">{n.titulo}</p>
              {n.descripcion && <p className="text-sm text-crema/70">{n.descripcion}</p>}
              {n.accion && (
                <Link href={n.accion.href} onClick={() => cerrar(n.id)} className="mt-2 inline-flex items-center gap-1 rounded text-sm font-semibold text-[#f2b8a3] underline decoration-[#f2b8a3]/40 underline-offset-4 transition-colors hover:decoration-[#f2b8a3]">
                  {n.accion.etiqueta}
                </Link>
              )}
            </div>
            <button type="button" onClick={() => cerrar(n.id)} className="rounded-lg p-2 text-crema/50 transition-colors hover:bg-white/10 hover:text-crema" aria-label="Cerrar notificación">
              <X className="size-4" />
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
