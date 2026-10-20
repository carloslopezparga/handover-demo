import { CornerUpLeft } from "lucide-react";
import Link from "next/link";
import { formatEuros, plural } from "@/lib/format";
import type { Traspaso, Vivienda } from "@/lib/types";
import { camposPendientes, devolucionPendiente, progresoEtapa } from "@/lib/validation";
import { Estado, Pastilla, Segmentos } from "../ui";
import { InsigniaTraspaso } from "../reformas/InsigniaTraspaso";

export function TarjetaVivienda({ vivienda, traspaso, recienLlegada = false }: { vivienda: Vivienda; traspaso?: Traspaso; recienLlegada?: boolean }) {
  const { ficha } = vivienda;
  const precioAcordado = ficha.precioAcordado as string | undefined;
  const precio = precioAcordado || (ficha.precioPedido as string | undefined);
  const zona = [ficha.barrio, ficha.ciudad].filter(Boolean).join(", ");

  return (
    <Link
      href={`/vivienda/${vivienda.id}`}
      className="group block rounded-lg border border-borde bg-superficie p-3 transition-[border-color,box-shadow,transform] duration-200 ease-[var(--ease-suave)] hover:-translate-y-0.5 hover:border-borde-fuerte hover:shadow-elevacion"
    >
      {recienLlegada && (
        <Pastilla tono="atencion" className="mb-2">
          Recién traspasada
        </Pastilla>
      )}
      <p className="text-[15px] leading-5 font-semibold text-pretty text-tinta">{(ficha.direccion as string) || "Sin dirección"}</p>
      <p className="mt-1 truncate text-[13px] text-secundario">{zona || "Sin zona"}</p>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
        <span className="text-[15px] font-semibold text-tinta">{precio ? formatEuros(precio) : "Sin precio"}</span>
        <span className="text-[13px] text-secundario">{precioAcordado ? "acordado" : "pedido"}</span>
      </p>
      <div className="mt-3 border-t border-borde pt-3">
        {vivienda.etapa === "traspasada" ? <PieTraspasada traspaso={traspaso} /> : <PieEnEmbudo vivienda={vivienda} />}
      </div>
    </Link>
  );
}

function PieEnEmbudo({ vivienda }: { vivienda: Vivienda }) {
  if (vivienda.etapa === "traspasada") return null;
  const { completos, total } = progresoEtapa(vivienda, vivienda.etapa);
  const pendientes = camposPendientes(vivienda);
  const devuelta = vivienda.devolucion && devolucionPendiente(vivienda);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Segmentos completos={completos} total={total} listo={pendientes.length === 0} className="flex-1" />
        <span className="text-[12px] font-semibold text-pizarra tabular-nums">
          {completos}/{total}
        </span>
      </div>
      {devuelta ? (
        <Estado tono="accion" envolver icono={<CornerUpLeft className="size-3.5 shrink-0" aria-hidden />}>
          Devuelta: {vivienda.devolucion!.campoEtiqueta}
        </Estado>
      ) : pendientes.length > 0 ? (
        <span title={pendientes.map((p) => p.etiqueta).join(", ")} className="block">
          <Estado tono="accion" envolver>{pendientes.length === 1 ? "Falta 1 campo" : `Faltan ${plural(pendientes.length, "campo")}`}</Estado>
        </span>
      ) : (
        <Estado tono="completo" envolver>
          Lista para avanzar
        </Estado>
      )}
    </div>
  );
}

function PieTraspasada({ traspaso }: { traspaso?: Traspaso }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
      {traspaso ? <InsigniaTraspaso estado={traspaso.estado} /> : <span className="text-[13px] text-secundario">Sin traspaso</span>}
      {traspaso && <span className="text-[12px] font-medium text-secundario tabular-nums">{traspaso.id}</span>}
    </div>
  );
}
