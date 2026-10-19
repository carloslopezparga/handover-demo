"use client";

// Pinta un campo de la ficha según su tipo y muestra su validación en tiempo real.

import { Check, CircleAlert, CircleCheck, CornerUpLeft } from "lucide-react";
import { formatEuros, formatNumero, hoyISO, parseNumero } from "@/lib/format";
import type { DefinicionCampo, Ficha, RespuestaSiNo, ValorCampo } from "@/lib/types";
import { textoValor, validarCampo } from "@/lib/validation";
import { CLASE_INPUT } from "../ui";
import { CampoFotos } from "./CampoFotos";

const ETIQUETAS_VALORACION = ["Reforma integral", "Reforma importante", "Reforma media", "Lavado de cara", "Entrar a vivir"];

/** Campos que ocupan todo el ancho de la rejilla. */
export function ocupaAnchoCompleto(def: DefinicionCampo): boolean {
  return ["textoLargo", "siNoComentario", "multiSeleccion", "fotos", "casillas", "valoracion", "contacto"].includes(def.tipo) || def.clave === "direccion" || def.clave === "estadoInstalaciones";
}

interface Props {
  def: DefinicionCampo;
  valor: ValorCampo;
  ficha: Ficha;
  onCambio: (valor: ValorCampo) => void;
  /** El campo pertenece a la etapa en curso: los obligatorios se destacan. */
  enEtapaActual: boolean;
  /** La etapa todavía no se ha alcanzado. */
  enEtapaFutura: boolean;
  soloLectura: boolean;
  /** Reformas ha devuelto la vivienda por este campo. */
  devuelto?: boolean;
}

export function CampoFicha({ def, valor, ficha, onCambio, enEtapaActual, enEtapaFutura, soloLectura, devuelto }: Props) {
  const r = validarCampo(def, valor, ficha);
  const idInput = `input-${def.clave}`;
  const idAyuda = `ayuda-${def.clave}`;
  const pendienteDestacado = def.obligatorio && !r.completo && !enEtapaFutura && !soloLectura;
  const mostrarError = Boolean(r.error) && !soloLectura;

  return (
    <div
      id={`campo-${def.clave}`}
      className={`rounded-xl border p-3.5 transition-colors sm:p-4 ${
        devuelto && !soloLectura
          ? "border-ladrillo bg-ladrillo-claro/60 ring-2 ring-ladrillo/25"
          : pendienteDestacado && enEtapaActual
            ? "border-ladrillo/35 bg-ladrillo-claro/40"
            : pendienteDestacado
              ? "border-ladrillo/25 bg-ladrillo-claro/25"
              : "border-transparent bg-transparent"
      } ${ocupaAnchoCompleto(def) ? "md:col-span-2" : ""}`}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <label htmlFor={idInput} className="text-[15px] font-semibold text-tinta">
          {def.etiqueta}
          {def.unidad && def.tipo !== "moneda" && <span className="sr-only"> ({def.unidad})</span>}
        </label>
        <EstadoCampo def={def} completo={r.completo} enEtapaFutura={enEtapaFutura} devuelto={devuelto && !soloLectura} />
      </div>

      {soloLectura ? (
        <ValorSoloLectura def={def} valor={valor} />
      ) : (
        <Entrada def={def} valor={valor} onCambio={onCambio} id={idInput} invalido={mostrarError} describedBy={def.ayuda || mostrarError ? idAyuda : undefined} />
      )}

      {!soloLectura && (mostrarError || def.ayuda) && (
        <p id={idAyuda} className={`mt-2 flex items-start gap-1.5 text-sm ${mostrarError ? "font-medium text-ladrillo" : "text-tinta-tenue"}`}>
          {mostrarError && <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />}
          {mostrarError ? r.error : def.ayuda}
        </p>
      )}
      {!soloLectura && def.tipo === "moneda" && r.completo && formatNumero(valor as string) !== String(valor).trim() && (
        <p className="mt-1.5 text-sm text-tinta-tenue">= {formatEuros(valor as string)}</p>
      )}
    </div>
  );
}

function EstadoCampo({ def, completo, enEtapaFutura, devuelto }: { def: DefinicionCampo; completo: boolean; enEtapaFutura: boolean; devuelto?: boolean }) {
  if (devuelto)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-ladrillo px-2 py-0.5 text-[12px] font-bold text-white">
        <CornerUpLeft className="size-3" aria-hidden />
        Devuelto por Reformas
      </span>
    );
  if (!def.obligatorio) return <span className="text-[13px] text-tinta-tenue">Opcional</span>;
  if (completo)
    return (
      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-salvia">
        <CircleCheck className="size-4" aria-hidden />
        Completo
      </span>
    );
  if (enEtapaFutura) return <span className="text-[13px] text-tinta-tenue">Obligatorio</span>;
  return <span className="rounded-full bg-ladrillo-claro px-2 py-0.5 text-[12px] font-bold uppercase tracking-wide text-ladrillo-oscuro">Obligatorio</span>;
}

function ValorSoloLectura({ def, valor }: { def: DefinicionCampo; valor: ValorCampo }) {
  if (def.tipo === "fotos") return <CampoFotos valor={Array.isArray(valor) ? valor : []} onCambio={() => {}} soloLectura id={`input-${def.clave}`} />;
  if (def.tipo === "multiSeleccion" && Array.isArray(valor) && valor.length > 0)
    return (
      <div className="flex flex-wrap gap-1.5">
        {valor.map((v) => (
          <span key={v} className="rounded-full bg-salvia-claro px-2.5 py-1 text-sm font-medium text-salvia-oscuro">
            {def.opciones?.find((o) => o.valor === v)?.etiqueta ?? v}
          </span>
        ))}
      </div>
    );
  const texto = textoValor(def, valor);
  return <p className={`text-base ${texto === "—" ? "text-ladrillo" : "text-tinta"}`}>{texto === "—" ? "Sin dato" : texto}</p>;
}

interface PropsEntrada {
  def: DefinicionCampo;
  valor: ValorCampo;
  onCambio: (v: ValorCampo) => void;
  id: string;
  invalido: boolean;
  describedBy?: string;
}

function Entrada({ def, valor, onCambio, id, invalido, describedBy }: PropsEntrada) {
  const comunes = { id, "aria-invalid": invalido, "aria-describedby": describedBy };
  const texto = typeof valor === "string" ? valor : typeof valor === "number" ? String(valor) : "";

  switch (def.tipo) {
    case "texto":
    case "contacto":
      return <input {...comunes} type="text" value={texto} onChange={(e) => onCambio(e.target.value)} placeholder={def.placeholder} className={CLASE_INPUT} autoComplete="off" />;

    case "textoLargo":
      return <textarea {...comunes} rows={3} value={texto} onChange={(e) => onCambio(e.target.value)} placeholder={def.placeholder} className={CLASE_INPUT} />;

    case "numero":
    case "entero":
    case "moneda":
    case "porcentaje":
      return (
        <div className="relative">
          <input
            {...comunes}
            type="text"
            inputMode={def.tipo === "entero" ? "numeric" : "decimal"}
            value={texto}
            onChange={(e) => onCambio(e.target.value)}
            placeholder={def.placeholder}
            className={`${CLASE_INPUT} ${def.unidad ? "pr-12" : ""}`}
            autoComplete="off"
          />
          {def.unidad && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[15px] font-medium text-tinta-tenue">{def.unidad}</span>}
        </div>
      );

    case "seleccion":
      return (
        <select {...comunes} value={texto} onChange={(e) => onCambio(e.target.value)} className={`${CLASE_INPUT} ${texto ? "" : "text-tinta-tenue"}`}>
          <option value="">Selecciona…</option>
          {def.opciones?.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
      );

    case "siNo":
      return <SelectorSiNo id={id} valor={texto} onCambio={onCambio} etiqueta={def.etiqueta} />;

    case "siNoComentario": {
      const r = (valor as RespuestaSiNo | null) ?? { respuesta: "", comentario: "" };
      return (
        <div className="space-y-2.5">
          <SelectorSiNo id={id} valor={r.respuesta} onCambio={(v) => onCambio({ ...r, respuesta: v as RespuestaSiNo["respuesta"] })} etiqueta={def.etiqueta} />
          <textarea
            aria-label={`Comentario: ${def.etiqueta}`}
            aria-invalid={invalido}
            aria-describedby={describedBy}
            rows={2}
            value={r.comentario}
            onChange={(e) => onCambio({ ...r, comentario: e.target.value })}
            placeholder={def.placeholder ?? "Comentario"}
            className={CLASE_INPUT}
          />
        </div>
      );
    }

    case "valoracion": {
      const n = parseNumero(texto);
      return (
        <div>
          <div role="radiogroup" aria-label={def.etiqueta} className="grid grid-cols-5 gap-1.5 sm:max-w-md">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                id={i === 1 ? id : undefined}
                type="button"
                role="radio"
                aria-checked={n === i}
                onClick={() => onCambio(i)}
                className={`rounded-lg border py-2.5 text-base font-semibold transition-colors ${
                  n === i ? "border-tinta bg-tinta text-crema" : "border-borde-fuerte bg-white text-tinta hover:bg-crema"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-sm text-tinta-suave">{n ? `${n} · ${ETIQUETAS_VALORACION[n - 1]}` : "Sin valorar"}</p>
        </div>
      );
    }

    case "fecha":
      return (
        <div className="flex gap-2">
          <input {...comunes} type="date" value={texto} onChange={(e) => onCambio(e.target.value)} className={CLASE_INPUT} />
          <button type="button" onClick={() => onCambio(hoyISO())} className="shrink-0 rounded-lg border border-borde-fuerte bg-white px-3 text-[15px] font-medium text-tinta hover:bg-crema">
            Hoy
          </button>
        </div>
      );

    case "multiSeleccion": {
      const lista = Array.isArray(valor) ? valor : [];
      return (
        <div className="flex flex-wrap gap-2" role="group" aria-label={def.etiqueta}>
          {def.opciones?.map((o, i) => {
            const activo = lista.includes(o.valor);
            return (
              <button
                key={o.valor}
                id={i === 0 ? id : undefined}
                type="button"
                aria-pressed={activo}
                onClick={() => onCambio(activo ? lista.filter((x) => x !== o.valor) : [...lista, o.valor])}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[15px] font-medium transition-colors ${
                  activo ? "border-salvia bg-salvia text-white" : "border-borde-fuerte bg-white text-tinta hover:border-tinta-tenue"
                }`}
              >
                {activo && <Check className="size-4" aria-hidden />}
                {o.etiqueta}
              </button>
            );
          })}
        </div>
      );
    }

    case "casillas": {
      const lista = Array.isArray(valor) ? valor : [];
      return (
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
          {def.opciones?.map((o, i) => (
            <label key={o.valor} className="flex cursor-pointer items-center gap-2.5 text-base text-tinta">
              <input
                id={i === 0 ? id : undefined}
                type="checkbox"
                checked={lista.includes(o.valor)}
                onChange={(e) => onCambio(e.target.checked ? [...lista, o.valor] : lista.filter((x) => x !== o.valor))}
                className="size-5 cursor-pointer rounded accent-salvia"
              />
              {o.etiqueta}
            </label>
          ))}
        </div>
      );
    }

    case "fotos":
      return <CampoFotos id={id} valor={Array.isArray(valor) ? valor : []} onCambio={onCambio} minimo={def.minElementos ?? 1} />;
  }
}

function SelectorSiNo({ id, valor, onCambio, etiqueta }: { id: string; valor: string; onCambio: (v: string) => void; etiqueta: string }) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="inline-flex rounded-lg border border-borde-fuerte bg-white p-1">
      {[
        { v: "si", e: "Sí" },
        { v: "no", e: "No" },
      ].map((o, i) => (
        <button
          key={o.v}
          id={i === 0 ? id : undefined}
          type="button"
          role="radio"
          aria-checked={valor === o.v}
          onClick={() => onCambio(o.v)}
          className={`min-w-20 rounded-md px-4 py-1.5 text-base font-semibold transition-colors ${valor === o.v ? "bg-tinta text-crema" : "text-tinta hover:bg-crema"}`}
        >
          {o.e}
        </button>
      ))}
    </div>
  );
}
