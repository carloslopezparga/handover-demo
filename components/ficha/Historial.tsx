// Historial de cambios de etapa, del más reciente al más antiguo.

import { formatFechaHora } from "@/lib/format";
import { NOMBRE_ESTADO } from "@/lib/stages";
import type { EventoHistorial } from "@/lib/types";

export function Historial({ eventos }: { eventos: EventoHistorial[] }) {
  const ordenados = [...eventos].reverse();
  return (
    <section aria-labelledby="titulo-historial" className="rounded-xl border border-borde bg-superficie px-4 py-4 sm:px-6 sm:py-5">
      <h2 id="titulo-historial" className="mb-1 font-display text-lg leading-6 font-semibold tracking-[-0.01em] text-tinta">
        Historial de etapas
      </h2>
      <ol className="divide-y divide-borde">
        {ordenados.map((e, i) => (
          <li key={e.id} className="flex items-start gap-3 py-3">
            <span className={`mt-[7px] size-1.5 shrink-0 rounded-full ${i === 0 ? "bg-azul" : "bg-borde-fuerte"}`} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-tinta">{e.desde ? `${NOMBRE_ESTADO[e.desde]} → ${NOMBRE_ESTADO[e.hasta]}` : `Alta en ${NOMBRE_ESTADO[e.hasta]}`}</p>
              {e.nota && <p className="text-[13px] text-secundario">{e.nota}</p>}
              {e.camposPendientes && e.camposPendientes.length > 0 && (
                <p className="mt-1 flex items-center gap-2 text-[13px] font-medium text-piloto">
                  <span className="size-1.5 shrink-0 rounded-full bg-piloto" aria-hidden />
                  Pendientes: {e.camposPendientes.join(", ")}
                </p>
              )}
            </div>
            <time dateTime={e.fecha} className="shrink-0 text-[13px] text-secundario tabular-nums">
              {formatFechaHora(e.fecha)}
            </time>
          </li>
        ))}
      </ol>
    </section>
  );
}
