// Historial de cambios de etapa, del más reciente al más antiguo.

import { formatFechaHora } from "@/lib/format";
import { NOMBRE_ESTADO } from "@/lib/stages";
import type { EventoHistorial } from "@/lib/types";

export function Historial({ eventos }: { eventos: EventoHistorial[] }) {
  const ordenados = [...eventos].reverse();
  return (
    <div className="rounded-2xl border border-borde bg-papel p-5 shadow-suave">
      <p className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-tinta-tenue">Historial de etapas</p>
      <ol className="space-y-3">
        {ordenados.map((e, i) => (
          <li key={e.id} className="relative flex gap-3">
            <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${i === 0 ? "bg-tinta" : "bg-borde-fuerte"}`} aria-hidden />
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-tinta">
                {e.desde ? `${NOMBRE_ESTADO[e.desde]} → ${NOMBRE_ESTADO[e.hasta]}` : `Alta en ${NOMBRE_ESTADO[e.hasta]}`}
              </p>
              <p className="text-[13px] text-tinta-tenue">{formatFechaHora(e.fecha)}</p>
              {e.nota && <p className="mt-0.5 text-sm text-tinta-suave">{e.nota}</p>}
              {e.camposPendientes && e.camposPendientes.length > 0 && (
                <p className="mt-1 inline-block rounded-md bg-ambar-claro px-2 py-0.5 text-[13px] font-medium text-ambar">Pendientes: {e.camposPendientes.join(", ")}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
