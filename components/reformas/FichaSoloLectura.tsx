// Ficha completa en solo lectura, tal y como se copió en el traspaso.

import { ETAPAS } from "@/lib/stages";
import type { DefinicionCampo, Ficha } from "@/lib/types";
import { textoValor, validarCampo } from "@/lib/validation";
import { CampoFotos } from "../ficha/CampoFotos";
import { Punto } from "../ui";

function Valor({ def, ficha }: { def: DefinicionCampo; ficha: Ficha }) {
  const valor = ficha[def.clave] ?? null;
  const r = validarCampo(def, valor, ficha);
  if (def.obligatorio && !r.completo) {
    return (
      <span className="inline-flex items-center gap-2 font-medium text-ladrillo">
        <Punto tono="accion" />
        {r.vacio ? "Sin dato" : `${textoValor(def, valor)} · ${r.error}`}
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
    <div className="divide-y divide-borde rounded-xl border border-borde bg-white">
      {ETAPAS.map((etapa, i) => (
        <section key={etapa.id} className="grid gap-2 px-4 py-6 sm:px-6 md:grid-cols-[176px_minmax(0,1fr)] md:gap-8">
          <h3 className="flex items-baseline gap-2 font-display text-base font-semibold tracking-[-0.01em] text-tinta">
            <span className="text-[13px] font-medium text-tinta-tenue tabular-nums">{i + 1}</span>
            {etapa.nombre}
          </h3>
          <dl>
            {etapa.campos.map((c) =>
              c.tipo === "fotos" && !fotosEnResumen ? (
                <div key={c.clave} className="py-2">
                  <dt className="mb-2 text-[13px] font-medium text-tinta-tenue">{c.etiqueta}</dt>
                  <dd>
                    <CampoFotos id={`ro-${c.clave}`} valor={Array.isArray(ficha[c.clave]) ? (ficha[c.clave] as string[]) : []} onCambio={() => {}} soloLectura />
                  </dd>
                </div>
              ) : (
                <div
                  key={c.clave}
                  className={`grid gap-1 rounded-md py-2 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-4 ${resaltar === c.clave ? "-mx-2 bg-ladrillo-claro/70 px-2" : ""}`}
                >
                  <dt className="text-[13px] font-medium text-tinta-tenue sm:text-sm sm:font-normal">{c.etiqueta}</dt>
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
