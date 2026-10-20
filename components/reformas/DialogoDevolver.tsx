"use client";

// "Devolver a Supply": Reformas elige el campo que falta o está mal y deja un comentario.

import { useState } from "react";
import { ETAPAS } from "@/lib/stages";
import type { Traspaso } from "@/lib/types";
import { validarCampo } from "@/lib/validation";
import { Dialogo } from "../Dialogo";
import { Boton, CLASE_ETIQUETA, CLASE_INPUT, MarcaObligatorio } from "../ui";

/** Primer campo obligatorio incompleto de la copia, para proponerlo por defecto. */
function campoSugerido(t: Traspaso): string {
  for (const etapa of ETAPAS) {
    for (const c of etapa.campos) {
      if (c.obligatorio && !validarCampo(c, t.ficha[c.clave] ?? null, t.ficha).completo) return c.clave;
    }
  }
  return "";
}

interface Props {
  traspaso: Traspaso;
  abierto: boolean;
  onCerrar: () => void;
  onDevolver: (campo: string, comentario: string) => void;
}

export function DialogoDevolver({ traspaso, abierto, onCerrar, onDevolver }: Props) {
  const [campo, setCampo] = useState(() => campoSugerido(traspaso));
  const [comentario, setComentario] = useState("");
  const [intentado, setIntentado] = useState(false);

  const campoValido = campo !== "";
  const comentarioValido = comentario.trim().length >= 5;

  function confirmar() {
    setIntentado(true);
    if (!campoValido || !comentarioValido) return;
    onDevolver(campo, comentario);
  }

  return (
    <Dialogo
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Devolver a Supply"
      descripcion="La vivienda vuelve a la etapa Firma con una alerta visible para el captador."
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton onClick={confirmar}>Devolver a Supply</Boton>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <label htmlFor="dev-campo" className={CLASE_ETIQUETA}>
            ¿Qué campo falta o está mal?
            <MarcaObligatorio pendiente={!campoValido} />
          </label>
          <select id="dev-campo" value={campo} onChange={(e) => setCampo(e.target.value)} className={CLASE_INPUT} aria-invalid={intentado && !campoValido}>
            <option value="">Selecciona un campo…</option>
            {ETAPAS.map((etapa) => (
              <optgroup key={etapa.id} label={etapa.nombre}>
                {etapa.campos.map((c) => (
                  <option key={c.clave} value={c.clave}>
                    {c.etiqueta}
                  </option>
                ))}
              </optgroup>
            ))}
            <optgroup label="Otros">
              <option value="otro">Otro motivo</option>
            </optgroup>
          </select>
          {intentado && !campoValido && <p className="mt-2 text-[13px] font-medium text-ladrillo">Elige el campo afectado.</p>}
        </div>
        <div>
          <label htmlFor="dev-comentario" className={CLASE_ETIQUETA}>
            Comentario para Supply
            <MarcaObligatorio pendiente={!comentarioValido} />
          </label>
          <textarea
            id="dev-comentario"
            rows={3}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Ej.: Faltan los m² útiles; sin ellos no podemos presupuestar suelos."
            className={CLASE_INPUT}
            aria-invalid={intentado && !comentarioValido}
          />
          {intentado && !comentarioValido && <p className="mt-2 text-[13px] font-medium text-ladrillo">Explica brevemente el motivo (mínimo 5 caracteres).</p>}
        </div>
      </div>
    </Dialogo>
  );
}
