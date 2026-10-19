// Ficha completa en solo lectura, tal y como se copió en el traspaso.

import { CircleAlert } from "lucide-react";
import { ETAPAS } from "@/lib/stages";
import type { DefinicionCampo, Ficha } from "@/lib/types";
import { textoValor, validarCampo } from "@/lib/validation";
import { CampoFotos } from "../ficha/CampoFotos";

function Valor({ def, ficha }: { def: DefinicionCampo; ficha: Ficha }) {
  const valor = ficha[def.clave] ?? null;
  const r = validarCampo(def, valor, ficha);
  if (def.obligatorio && !r.completo) {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-ladrillo">
        <CircleAlert className="size-4" aria-hidden />
        {r.vacio ? "Sin dato" : `${textoValor(def, valor)} · ${r.error}`}
      </span>
    );
  }
  if (def.tipo === "multiSeleccion" && Array.isArray(valor) && valor.length > 0) {
    return (
      <span className="flex flex-wrap gap-1.5">
        {valor.map((v) => (
          <span key={v} className="rounded-full bg-salvia-claro px-2.5 py-0.5 text-sm font-medium text-salvia-oscuro">
            {def.opciones?.find((o) => o.valor === v)?.etiqueta ?? v}
          </span>
        ))}
      </span>
    );
  }
  const texto = textoValor(def, valor);
  return <span className={texto === "—" ? "text-tinta-tenue" : "text-tinta"}>{texto}</span>;
}

interface Props {
  ficha: Ficha;
  /** Campo a resaltar (el motivo de la devolución). */
  resaltar?: string;
  /** Las fotos ya se muestran en otra parte de la página: aquí solo se cuentan. */
  fotosEnResumen?: boolean;
}

export function FichaSoloLectura({ ficha, resaltar, fotosEnResumen = false }: Props) {
  return (
    <div className="space-y-4">
      {ETAPAS.map((etapa) => (
        <section key={etapa.id} className="rounded-2xl border border-borde bg-papel shadow-suave">
          <h3 className="border-b border-borde px-5 py-3 text-[15px] font-bold text-tinta">{etapa.nombre}</h3>
          <dl className="divide-y divide-borde">
            {etapa.campos.map((c) =>
              c.tipo === "fotos" && !fotosEnResumen ? (
                <div key={c.clave} className="px-5 py-3.5">
                  <dt className="mb-2 text-sm font-medium text-tinta-suave">{c.etiqueta}</dt>
                  <dd>
                    <CampoFotos id={`ro-${c.clave}`} valor={Array.isArray(ficha[c.clave]) ? (ficha[c.clave] as string[]) : []} onCambio={() => {}} soloLectura />
                  </dd>
                </div>
              ) : (
                <div key={c.clave} className={`grid gap-1 px-5 py-3 sm:grid-cols-[220px_1fr] sm:gap-4 ${resaltar === c.clave ? "bg-ladrillo-claro/60" : ""}`}>
                  <dt className="text-sm font-medium text-tinta-suave">{c.etiqueta}</dt>
                  <dd className="text-[15px]">
                    <Valor def={c} ficha={ficha} />
                  </dd>
                </div>
              ),
            )}
          </dl>
        </section>
      ))}
    </div>
  );
}
