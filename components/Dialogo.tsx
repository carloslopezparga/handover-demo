"use client";

// Ventana modal accesible: se cierra con Escape o pulsando fuera y bloquea el scroll del fondo.

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

interface Props {
  abierto: boolean;
  titulo: string;
  descripcion?: string;
  onCerrar: () => void;
  children: ReactNode;
  pie?: ReactNode;
}

export function Dialogo({ abierto, titulo, descripcion, onCerrar, children, pie }: Props) {
  const idTitulo = useId();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const anterior = document.activeElement as HTMLElement | null;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", alPulsar);
    document.body.style.overflow = "hidden";
    // Lleva el foco al primer elemento interactivo del diálogo.
    requestAnimationFrame(() => {
      panel.current?.querySelector<HTMLElement>("input, select, textarea, button:not([data-cerrar])")?.focus();
    });
    return () => {
      document.removeEventListener("keydown", alPulsar);
      document.body.style.overflow = "";
      anterior?.focus?.();
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-tinta/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={onCerrar}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="animar-entrada max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-papel shadow-elevada sm:max-w-lg sm:rounded-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-borde px-6 py-4">
          <div>
            <h2 id={idTitulo} className="text-lg font-bold text-tinta">
              {titulo}
            </h2>
            {descripcion && <p className="mt-0.5 text-[15px] text-tinta-suave">{descripcion}</p>}
          </div>
          <button
            type="button"
            data-cerrar
            onClick={onCerrar}
            className="-mr-2 rounded-lg p-2 text-tinta-suave hover:bg-crema-oscuro hover:text-tinta"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {pie && <div className="flex flex-col-reverse gap-2 border-t border-borde px-6 py-4 sm:flex-row sm:justify-end">{pie}</div>}
      </div>
    </div>
  );
}
