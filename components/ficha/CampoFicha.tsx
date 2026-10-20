"use client";

// Pinta un campo de la ficha según su tipo y muestra su validación en tiempo real.

import { Check, CircleAlert, CornerUpLeft } from "lucide-react";
import { formatEuros, formatNumero, hoyISO, parseNumero } from "@/lib/format";
import type { DefinicionCampo, Ficha, RespuestaSiNo, ValorCampo } from "@/lib/types";
import { textoValor, validarCampo } from "@/lib/validation";
import { CLASE_INPUT, claseBoton, Estado, IconoCompleto, MarcaObligatorio } from "../ui";
import { CampoFotos } from "./CampoFotos";

const TIPOS_GRUPO: DefinicionCampo["tipo"][] = ["siNo", "siNoComentario", "valoracion", "multiSeleccion", "casillas"];

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
  /** La etapa todavía no se ha alcanzado. */
  enEtapaFutura: boolean;
  soloLectura: boolean;
  /** Reformas ha devuelto la vivienda por este campo. */
  devuelto?: boolean;
}

export function CampoFicha({ def, valor, ficha, onCambio, enEtapaFutura, soloLectura, devuelto }: Props) {
  const r = validarCampo(def, valor, ficha);
  const idInput = `input-${def.clave}`;
  const idAyuda = `ayuda-${def.clave}`;
  const pendiente = def.obligatorio && !r.completo && !enEtapaFutura && !soloLectura;
  const mostrarError = Boolean(r.error) && !soloLectura;
  const marcado = devuelto && !soloLectura;
  // En los grupos (botones, casillas) la etiqueta no apunta al primer control: si no, le
  // cambiaría el nombre accesible y al pulsarla se activaría esa primera opción.
  const Etiqueta = TIPOS_GRUPO.includes(def.tipo) || soloLectura ? "p" : "label";

  return (
    <div
      id={`campo-${def.clave}`}
      className={`-m-2 rounded-lg p-2 transition-[background-color,box-shadow] ${marcado ? "ring-2 ring-azul/35" : ""} ${ocupaAnchoCompleto(def) ? "@lg:col-span-2" : ""}`}
    >
      <div className="mb-2 flex min-h-5 flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <Etiqueta htmlFor={Etiqueta === "label" ? idInput : undefined} className="flex items-center text-sm leading-5 font-medium text-tinta">
          {def.etiqueta}
          {def.unidad && def.tipo !== "moneda" && <span className="sr-only"> ({def.unidad})</span>}
          {def.obligatorio && <MarcaObligatorio pendiente={pendiente && !marcado} />}
        </Etiqueta>
        <EstadoCampo def={def} completo={r.completo} devuelto={marcado} />
      </div>

      {soloLectura ? (
        <ValorSoloLectura def={def} valor={valor} />
      ) : (
        <Entrada def={def} valor={valor} onCambio={onCambio} id={idInput} invalido={mostrarError} describedBy={def.ayuda || mostrarError ? idAyuda : undefined} />
      )}

      {!soloLectura && (mostrarError || def.ayuda) && (
        <p id={idAyuda} className={`mt-2 flex items-start gap-1.5 text-[13px] leading-5 ${mostrarError ? "animar-despliegue font-medium text-error" : "text-secundario"}`}>
          {mostrarError && <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />}
          {mostrarError ? r.error : def.ayuda}
        </p>
      )}
      {!soloLectura && def.tipo === "moneda" && r.completo && formatNumero(valor as string) !== String(valor).trim() && (
        <p className="mt-2 text-[13px] text-secundario tabular-nums">= {formatEuros(valor as string)}</p>
      )}
    </div>
  );
}

function EstadoCampo({ def, completo, devuelto }: { def: DefinicionCampo; completo: boolean; devuelto?: boolean }) {
  if (devuelto)
    return (
      <Estado tono="accion" icono={<CornerUpLeft className="size-3.5" aria-hidden />}>
        Devuelto por Reformas
      </Estado>
    );
  if (!def.obligatorio) return <span className="text-[12px] text-secundario">Opcional</span>;
  if (completo)
    return (
      <span title="Completo">
        <IconoCompleto className="size-4" animar />
        <span className="sr-only">Completo</span>
      </span>
    );
  return null;
}

function ValorSoloLectura({ def, valor }: { def: DefinicionCampo; valor: ValorCampo }) {
  if (def.tipo === "fotos") return <CampoFotos valor={Array.isArray(valor) ? valor : []} onCambio={() => {}} soloLectura id={`input-${def.clave}`} />;
  const texto = textoValor(def, valor);
  return <p className={`text-[15px] ${texto === "—" ? "font-medium text-azul" : "text-tinta"}`}>{texto === "—" ? "Sin dato" : texto}</p>;
}

interface PropsEntrada {
  def: DefinicionCampo;
  valor: ValorCampo;
  onCambio: (v: ValorCampo) => void;
  id: string;
  invalido: boolean;
  describedBy?: string;
}

/** Botón de un grupo segmentado (Sí/No, valoración). */
const CLASE_SEGMENTO = "h-[34px] rounded-md px-4 text-sm font-semibold transition-colors duration-150";

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
            className={`${CLASE_INPUT} tabular-nums ${def.unidad ? "pr-12" : ""}`}
            autoComplete="off"
          />
          {def.unidad && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-secundario">{def.unidad}</span>}
        </div>
      );

    case "seleccion":
      return (
        <select {...comunes} value={texto} onChange={(e) => onCambio(e.target.value)} className={`${CLASE_INPUT} ${texto ? "" : "text-secundario"}`}>
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
        <div className="space-y-3">
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div role="radiogroup" aria-label={def.etiqueta} className="grid w-full grid-cols-5 rounded-lg border border-borde-fuerte bg-superficie p-0.5 shadow-suave sm:w-auto sm:min-w-72">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                id={i === 1 ? id : undefined}
                type="button"
                role="radio"
                aria-checked={n === i}
                onClick={() => onCambio(i)}
                className={`${CLASE_SEGMENTO} tabular-nums ${n === i ? "bg-tinta text-white" : "text-tinta hover:bg-fondo-2"}`}
              >
                {i}
              </button>
            ))}
          </div>
          <p className="text-[13px] text-secundario">{n ? ETIQUETAS_VALORACION[n - 1] : "Sin valorar"}</p>
        </div>
      );
    }

    case "fecha":
      return (
        <div className="flex gap-2">
          <input {...comunes} type="date" value={texto} onChange={(e) => onCambio(e.target.value)} className={`${CLASE_INPUT} tabular-nums`} />
          <button type="button" onClick={() => onCambio(hoyISO())} className={claseBoton("secundario")}>
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
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] ${
                  activo ? "border-tinta bg-tinta text-white" : "border-borde-fuerte bg-superficie text-tinta shadow-suave hover:border-secundario/50 hover:bg-fondo"
                }`}
              >
                {activo && <Check className="animar-pop size-3.5" aria-hidden />}
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
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
          {def.opciones?.map((o, i) => (
            <label key={o.valor} className="flex cursor-pointer items-center gap-3 text-[15px] text-tinta">
              <input
                id={i === 0 ? id : undefined}
                type="checkbox"
                checked={lista.includes(o.valor)}
                onChange={(e) => onCambio(e.target.checked ? [...lista, o.valor] : lista.filter((x) => x !== o.valor))}
                className="size-[18px] cursor-pointer rounded accent-tinta"
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
    <div role="radiogroup" aria-label={etiqueta} className="inline-flex rounded-lg border border-borde-fuerte bg-superficie p-0.5 shadow-suave">
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
          className={`${CLASE_SEGMENTO} min-w-20 ${valor === o.v ? "bg-tinta text-white" : "text-tinta hover:bg-fondo-2"}`}
        >
          {o.e}
        </button>
      ))}
    </div>
  );
}
