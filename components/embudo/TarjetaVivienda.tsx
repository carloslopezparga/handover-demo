import Link from "next/link";
import { formatEuros, plural } from "@/lib/format";
import type { Traspaso, Vivienda } from "@/lib/types";
import { camposPendientes, devolucionPendiente, progresoEtapa } from "@/lib/validation";
import { Estado, Segmentos } from "../ui";
import { InsigniaTraspaso } from "../reformas/InsigniaTraspaso";

export function TarjetaVivienda({ vivienda, traspaso }: { vivienda: Vivienda; traspaso?: Traspaso }) {
  const { ficha } = vivienda;
  const precioAcordado = ficha.precioAcordado as string | undefined;
  const precio = precioAcordado || (ficha.precioPedido as string | undefined);
  const zona = [ficha.barrio, ficha.ciudad].filter(Boolean).join(", ");

  return (
    <Link
      href={`/vivienda/${vivienda.id}`}
      className="group block rounded-lg border border-borde bg-white p-3 transition-[border-color,box-shadow] duration-150 hover:border-borde-fuerte hover:shadow-suave"
    >
      <p className="text-[15px] leading-5 font-semibold text-pretty text-tinta">{(ficha.direccion as string) || "Sin dirección"}</p>
      <p className="mt-1 truncate text-[13px] text-tinta-tenue">{zona || "Sin zona"}</p>
      <p className="mt-2 text-sm text-tinta tabular-nums">
        <span className="font-semibold">{precio ? formatEuros(precio) : "Sin precio"}</span>
        <span className="ml-1 text-[13px] text-tinta-tenue">{precioAcordado ? "acordado" : "pedido"}</span>
      </p>
      {vivienda.etapa === "traspasada" ? <PieTraspasada traspaso={traspaso} /> : <PieEnEmbudo vivienda={vivienda} />}
    </Link>
  );
}

function PieEnEmbudo({ vivienda }: { vivienda: Vivienda }) {
  if (vivienda.etapa === "traspasada") return null;
  const { completos, total } = progresoEtapa(vivienda, vivienda.etapa);
  const pendientes = camposPendientes(vivienda);
  const devuelta = vivienda.devolucion && devolucionPendiente(vivienda);
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <Segmentos completos={completos} total={total} listo={pendientes.length === 0} className="flex-1" />
        <span className="text-[12px] font-medium text-tinta-tenue tabular-nums">
          {completos}/{total}
        </span>
      </div>
      {devuelta ? (
        <Estado tono="accion" className="whitespace-normal">
          Devuelta: {vivienda.devolucion!.campoEtiqueta}
        </Estado>
      ) : pendientes.length > 0 ? (
        <span title={pendientes.map((p) => p.etiqueta).join(", ")} className="block">
          <Estado tono="accion">{pendientes.length === 1 ? "Falta 1 campo" : `Faltan ${plural(pendientes.length, "campo")}`}</Estado>
        </span>
      ) : (
        <Estado tono="completo">Lista para avanzar</Estado>
      )}
    </div>
  );
}

function PieTraspasada({ traspaso }: { traspaso?: Traspaso }) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
      {traspaso ? <InsigniaTraspaso estado={traspaso.estado} /> : <span className="text-[13px] text-tinta-tenue">Sin traspaso</span>}
      {traspaso && <span className="text-[12px] font-medium text-tinta-tenue tabular-nums">{traspaso.id}</span>}
    </div>
  );
}
