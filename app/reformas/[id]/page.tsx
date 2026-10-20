"use client";

// Detalle de un traspaso en Reformas: ficha completa en solo lectura y acciones Aceptar / Devolver.

import { Check, CornerUpLeft, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type CSSProperties, type ReactNode } from "react";
import { useNotificar } from "@/components/Notificaciones";
import { DialogoDevolver } from "@/components/reformas/DialogoDevolver";
import { FichaSoloLectura } from "@/components/reformas/FichaSoloLectura";
import { InsigniaTraspaso } from "@/components/reformas/InsigniaTraspaso";
import { CampoFotos } from "@/components/ficha/CampoFotos";
import { Boton, BotonEnlace, Cargando, CheckExito, EstadoVacio, Migas, Punto, TituloSeccion } from "@/components/ui";
import { formatDuracion, formatFechaHora } from "@/lib/format";
import { buscarCampo } from "@/lib/stages";
import { useStore } from "@/lib/store";
import type { Ficha, Traspaso } from "@/lib/types";
import { textoValor } from "@/lib/validation";

/** Datos clave para el equipo de obra, en el orden en que los necesita: alcance, cifras y logística. */
const RESUMEN_CIFRAS = ["costeReforma", "m2Utiles", "m2Construidos", "estadoVivienda"];
const RESUMEN_DETALLE = ["estadoInstalaciones", "accesoLlaves", "contactoObra", "fechaFirma"];

export default function DetalleTraspasoPage() {
  const { id } = useParams<{ id: string }>();
  const { cargado, traspasos } = useStore();
  const traspaso = traspasos.find((t) => t.id === id);

  if (!cargado) return <Cargando tipo="lista" />;
  if (!traspaso) {
    return (
      <EstadoVacio
        ilustracion="busqueda"
        titulo="No encontramos este traspaso"
        descripcion="Puede que se haya reiniciado la demo o que el enlace no sea correcto."
        accion={<BotonEnlace href="/reformas">Volver a la bandeja</BotonEnlace>}
      />
    );
  }
  return <DetalleTraspaso key={traspaso.id} traspaso={traspaso} />;
}

function DetalleTraspaso({ traspaso: t }: { traspaso: Traspaso }) {
  const { aceptarTraspaso, devolverTraspaso } = useStore();
  const notificar = useNotificar();
  const [devolviendo, setDevolviendo] = useState(false);
  // Se acaba de aceptar desde esta pantalla: el aviso de «Aceptado» entra con el check animado.
  const [recienAceptado, setRecienAceptado] = useState(false);
  const pendiente = t.estado === "Pendiente de revisión";
  const fotos = Array.isArray(t.ficha.fotos) ? (t.ficha.fotos as string[]) : [];

  return (
    <div className="mx-auto max-w-5xl">
      <Migas items={[{ etiqueta: "Reformas", href: "/reformas" }, { etiqueta: t.id }]} />

      <header className="animar-entrada mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-10">
        <div className="min-w-0">
          <InsigniaTraspaso estado={t.estado} className="text-sm" />
          <h1 className="mt-3 font-display text-[30px] leading-[1.1] font-semibold tracking-[-0.015em] text-balance text-tinta sm:text-[38px]">
            {(t.ficha.direccion as string) || "Sin dirección"}
          </h1>
          <p className="mt-2 text-[15px] text-secundario-fondo">
            {[t.ficha.barrio, t.ficha.ciudad].filter(Boolean).join(", ")} · Recibido {formatFechaHora(t.creadoEn)} (
            {formatDuracion(new Date(t.creadoEn).getTime() - new Date(t.firmadoEn).getTime()).toLowerCase()} tras la firma) ·{" "}
            <Link href={`/vivienda/${t.viviendaId}`} className="rounded font-medium text-tinta underline decoration-tinta/25 underline-offset-4 transition-colors hover:decoration-tinta">
              Ver ficha en Supply
            </Link>
          </p>
        </div>
        {pendiente && (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Boton variante="secundario" onClick={() => setDevolviendo(true)}>
              <CornerUpLeft className="size-4" aria-hidden />
              Devolver a Supply
            </Boton>
            <Boton
              onClick={() => {
                aceptarTraspaso(t.id);
                setRecienAceptado(true);
                notificar({ titulo: "Traspaso aceptado", descripcion: "Supply recibe la confirmación. La obra puede planificarse." });
              }}
            >
              <Check className="size-4" aria-hidden />
              Aceptar
            </Boton>
          </div>
        )}
      </header>

      {t.estado === "Aceptado" && (
        <Aviso icono={<CheckExito animar={recienAceptado} className="size-6" />} destacado={recienAceptado}>
          <strong className="font-semibold text-marino">Aceptado</strong> el {formatFechaHora(t.revisadoEn)}. La ficha llegó completa.
        </Aviso>
      )}
      {t.estado === "Devuelto a Supply" && t.motivoDevolucion && (
        <Aviso icono={<CornerUpLeft className="mt-1 size-4 text-pizarra" aria-hidden />}>
          <strong className="font-semibold text-tinta">Devuelto a Supply</strong> el {formatFechaHora(t.revisadoEn)} · Campo: {t.motivoDevolucion.campoEtiqueta}
          <span className="mt-1 block">«{t.motivoDevolucion.comentario}»</span>
        </Aviso>
      )}
      {t.camposPendientes && t.camposPendientes.length > 0 && (
        <Aviso icono={<TriangleAlert className="mt-1 size-4" aria-hidden />} piloto>
          <strong className="font-semibold">Firmado en modo piloto con campos pendientes:</strong> {t.camposPendientes.join(", ")}.
        </Aviso>
      )}

      <section className="animar-entrada mb-10 rounded-xl border border-borde bg-superficie p-5 shadow-suave sm:p-8" style={{ "--retraso": "80ms" } as CSSProperties}>
        <TituloSeccion detalle="Lo que el equipo de obra necesita para empezar.">Resumen para obra</TituloSeccion>
        <ResumenObra ficha={t.ficha} />
        <h3 className="mt-8 mb-3 text-sm font-medium text-tinta">
          Fotos <span className="font-normal text-secundario tabular-nums">· {fotos.length}</span>
        </h3>
        <CampoFotos id="fotos-traspaso" valor={fotos} onCambio={() => {}} soloLectura />
      </section>

      <TituloSeccion detalle={<span className="text-secundario-fondo">Copia congelada: no cambia aunque Supply edite después la vivienda.</span>}>
        Ficha completa en el momento de la firma
      </TituloSeccion>
      <FichaSoloLectura ficha={t.ficha} resaltar={t.motivoDevolucion?.campo} fotosEnResumen />

      {pendiente && (
        <DialogoDevolver
          traspaso={t}
          abierto={devolviendo}
          onCerrar={() => setDevolviendo(false)}
          onDevolver={(campo, comentario) => {
            devolverTraspaso(t.id, campo, comentario);
            setDevolviendo(false);
            notificar({
              titulo: "Traspaso devuelto a Supply",
              descripcion: "La vivienda vuelve a Firma con el motivo visible para el captador.",
              tipo: "info",
              accion: { etiqueta: "Ver ficha de la vivienda", href: `/vivienda/${t.viviendaId}` },
            });
          }}
        />
      )}
    </div>
  );
}

/** Valor de un campo para el resumen, o «Sin dato» marcado si falta. */
function ValorResumen({ clave, ficha, children }: { clave: string; ficha: Ficha; children?: (texto: string) => ReactNode }) {
  const def = buscarCampo(clave)?.campo;
  if (!def) return null;
  const valor = ficha[clave] ?? null;
  const texto = textoValor(def, valor);
  const vacio = texto === "—" || (Array.isArray(valor) && valor.length === 0);
  if (vacio)
    return (
      <span className="inline-flex items-center gap-2 text-[15px] font-medium tracking-normal text-azul">
        <Punto tono="accion" />
        Sin dato
      </span>
    );
  return <>{children ? children(texto) : texto}</>;
}

function ResumenObra({ ficha }: { ficha: Ficha }) {
  const etiqueta = (clave: string) => buscarCampo(clave)?.campo.etiqueta ?? clave;
  const partidas = buscarCampo("alcanceReforma")?.campo;
  const alcance = Array.isArray(ficha.alcanceReforma) ? (ficha.alcanceReforma as string[]) : [];
  return (
    <div>
      <dl>
        <dt className="text-[13px] font-medium text-secundario">{etiqueta("alcanceReforma")}</dt>
        <dd className="mt-2 flex flex-wrap gap-2">
          {alcance.length > 0 ? (
            alcance.map((v) => (
              <span key={v} className="inline-flex h-8 items-center rounded-lg border border-borde bg-fondo px-3 text-[15px] font-medium text-tinta">
                {partidas?.opciones?.find((o) => o.valor === v)?.etiqueta ?? v}
              </span>
            ))
          ) : (
            <ValorResumen clave="alcanceReforma" ficha={ficha} />
          )}
        </dd>
      </dl>

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-borde bg-borde lg:grid-cols-4">
        {RESUMEN_CIFRAS.map((clave) => (
          <div key={clave} className="bg-superficie p-4">
            <dt className="text-[13px] font-medium text-secundario">{etiqueta(clave)}</dt>
            <dd className="mt-1 text-2xl leading-8 font-semibold tracking-[-0.01em] text-tinta tabular-nums">
              <ValorResumen clave={clave} ficha={ficha} />
            </dd>
          </div>
        ))}
      </dl>

      <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {RESUMEN_DETALLE.map((clave) => (
          <div key={clave}>
            <dt className="text-[13px] font-medium text-secundario">{etiqueta(clave)}</dt>
            <dd className="mt-1 text-[15px] text-tinta">
              <ValorResumen clave={clave} ficha={ficha} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Aviso({ icono, children, piloto = false, destacado = false }: { icono: ReactNode; children: ReactNode; piloto?: boolean; destacado?: boolean }) {
  const estilos = piloto ? "border-piloto/30 bg-piloto-claro text-piloto" : `bg-superficie text-pizarra ${destacado ? "border-marino/25 shadow-elevacion" : "border-borde"}`;
  return (
    <div className={`animar-entrada mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-[15px] sm:px-5 ${estilos}`}>
      <span className="flex shrink-0">{icono}</span>
      <p className="min-w-0 pt-0.5">{children}</p>
    </div>
  );
}
