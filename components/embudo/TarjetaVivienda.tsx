import { CircleCheck, CornerUpLeft, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { formatEuros, plural } from "@/lib/format";
import type { Traspaso, Vivienda } from "@/lib/types";
import { camposPendientes, progresoEtapa } from "@/lib/validation";
import { BarraProgreso, Insignia } from "../ui";
import { InsigniaTraspaso } from "../reformas/InsigniaTraspaso";

export function TarjetaVivienda({ vivienda, traspaso }: { vivienda: Vivienda; traspaso?: Traspaso }) {
  const { ficha } = vivienda;
  const precioAcordado = ficha.precioAcordado as string | undefined;
  const precio = precioAcordado || (ficha.precioPedido as string | undefined);
  const zona = [ficha.barrio, ficha.ciudad].filter(Boolean).join(", ");

  return (
    <Link
      href={`/vivienda/${vivienda.id}`}
      className="group block rounded-xl border border-borde bg-papel p-4 shadow-suave transition hover:-translate-y-px hover:border-borde-fuerte hover:shadow-elevada focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
    >
      <p className="text-[13px] font-medium text-tinta-tenue">{zona || "Sin zona"}</p>
      <p className="mt-0.5 font-semibold leading-snug text-tinta group-hover:underline group-hover:decoration-borde-fuerte group-hover:underline-offset-4">
        {(ficha.direccion as string) || "Sin dirección"}
      </p>
      <p className="mt-2 text-[15px] text-tinta">
        <span className="font-semibold">{precio ? formatEuros(precio) : "Sin precio"}</span>
        <span className="ml-1.5 text-[13px] text-tinta-tenue">{precioAcordado ? "acordado" : "pedido"}</span>
      </p>
      {vivienda.etapa === "traspasada" ? <PieTraspasada traspaso={traspaso} /> : <PieEnEmbudo vivienda={vivienda} />}
    </Link>
  );
}

function PieEnEmbudo({ vivienda }: { vivienda: Vivienda }) {
  if (vivienda.etapa === "traspasada") return null;
  const { completos, total } = progresoEtapa(vivienda, vivienda.etapa);
  const pendientes = camposPendientes(vivienda);
  return (
    <div className="mt-3 border-t border-borde pt-3">
      <div className="mb-1.5 flex items-center justify-between text-[13px]">
        <span className="font-medium text-tinta-suave">
          {completos} de {total} campos completos
        </span>
      </div>
      <BarraProgreso completos={completos} total={total} />
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {vivienda.devolucion && (
          <Insignia tono="alerta">
            <CornerUpLeft className="size-3.5" aria-hidden />
            Devuelta: {vivienda.devolucion.campoEtiqueta}
          </Insignia>
        )}
        {pendientes.length > 0 ? (
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ladrillo" title={pendientes.map((p) => p.etiqueta).join(", ")}>
            <TriangleAlert className="size-3.5" aria-hidden />
            {pendientes.length === 1 ? "Falta 1 campo" : `Faltan ${plural(pendientes.length, "campo")}`}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-salvia">
            <CircleCheck className="size-3.5" aria-hidden />
            Lista para avanzar
          </span>
        )}
      </div>
    </div>
  );
}

function PieTraspasada({ traspaso }: { traspaso?: Traspaso }) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-borde pt-3">
      <span className="text-[13px] font-medium text-tinta-suave">{traspaso ? traspaso.id : "Sin traspaso"}</span>
      {traspaso && <InsigniaTraspaso estado={traspaso.estado} />}
    </div>
  );
}
