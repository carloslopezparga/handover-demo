"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import { Dialogo } from "../Dialogo";
import { useNotificar } from "../Notificaciones";
import { Boton, CLASE_INPUT } from "../ui";

export function DialogoNuevaVivienda({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const { crearVivienda } = useStore();
  const notificar = useNotificar();
  const router = useRouter();
  const [direccion, setDireccion] = useState("");
  const [barrio, setBarrio] = useState("");
  const [ciudad, setCiudad] = useState("Madrid");
  const [intentado, setIntentado] = useState(false);

  const direccionValida = direccion.trim().length >= 5;

  function cerrar() {
    setDireccion("");
    setBarrio("");
    setCiudad("Madrid");
    setIntentado(false);
    onCerrar();
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    setIntentado(true);
    if (!direccionValida) return;
    const id = crearVivienda({ direccion, barrio, ciudad });
    cerrar();
    notificar({ titulo: "Vivienda creada en Lead", descripcion: "Completa la ficha para poder cualificarla." });
    router.push(`/vivienda/${id}`);
  }

  return (
    <Dialogo
      abierto={abierto}
      onCerrar={cerrar}
      titulo="Nueva vivienda"
      descripcion="Empieza con la dirección; el resto se completa en la ficha."
      pie={
        <>
          <Boton variante="secundario" onClick={cerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" form="form-nueva-vivienda">
            Crear y abrir ficha
          </Boton>
        </>
      }
    >
      <form id="form-nueva-vivienda" onSubmit={enviar} className="space-y-4" noValidate>
        <div>
          <label htmlFor="nv-direccion" className="mb-1.5 block text-[15px] font-semibold text-tinta">
            Dirección <span className="text-ladrillo">*</span>
          </label>
          <input
            id="nv-direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Calle, número, piso y puerta"
            className={CLASE_INPUT}
            aria-invalid={intentado && !direccionValida}
            aria-describedby="nv-direccion-error"
            autoComplete="off"
          />
          {intentado && !direccionValida && (
            <p id="nv-direccion-error" className="mt-1.5 text-sm font-medium text-ladrillo">
              Escribe una dirección (mínimo 5 caracteres).
            </p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nv-barrio" className="mb-1.5 block text-[15px] font-semibold text-tinta">
              Barrio
            </label>
            <input id="nv-barrio" value={barrio} onChange={(e) => setBarrio(e.target.value)} placeholder="Ej.: Tetuán" className={CLASE_INPUT} autoComplete="off" />
          </div>
          <div>
            <label htmlFor="nv-ciudad" className="mb-1.5 block text-[15px] font-semibold text-tinta">
              Ciudad
            </label>
            <input id="nv-ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} className={CLASE_INPUT} autoComplete="off" />
          </div>
        </div>
      </form>
    </Dialogo>
  );
}
