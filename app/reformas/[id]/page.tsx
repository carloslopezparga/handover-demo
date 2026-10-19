"use client";

// Detalle de un traspaso en Reno: ficha completa en solo lectura y acciones Aceptar / Devolver.

import { ArrowLeft, CircleCheck, CornerUpLeft, SearchX, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useNotificar } from "@/components/Notificaciones";
import { DialogoDevolver } from "@/components/reformas/DialogoDevolver";
import { FichaSoloLectura } from "@/components/reformas/FichaSoloLectura";
import { InsigniaTraspaso } from "@/components/reformas/InsigniaTraspaso";
import { CampoFotos } from "@/components/ficha/CampoFotos";
import { Boton, BotonEnlace, Cargando, EstadoVacio } from "@/components/ui";
import { formatDuracion, formatFechaHora } from "@/lib/format";
import { buscarCampo } from "@/lib/stages";
import { useStore } from "@/lib/store";
import type { Ficha, Traspaso } from "@/lib/types";
import { textoValor } from "@/lib/validation";

/** Datos clave para el equipo de obra, en el orden en que los necesita. */
const RESUMEN_OBRA = ["alcanceReforma", "costeReforma", "m2Utiles", "m2Construidos", "estadoVivienda", "estadoInstalaciones", "accesoLlaves", "contactoObra", "fechaFirma"];

export default function DetalleTraspasoPage() {
  const { id } = useParams<{ id: string }>();
  const { cargado, traspasos } = useStore();
  const traspaso = traspasos.find((t) => t.id === id);

  if (!cargado) return <Cargando />;
  if (!traspaso) {
    return (
      <EstadoVacio
        icono={<SearchX className="size-8" />}
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
  const pendiente = t.estado === "Pendiente de revisión";
  const fotos = Array.isArray(t.ficha.fotos) ? (t.ficha.fotos as string[]) : [];

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/reformas" className="mb-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-tinta-suave hover:text-tinta">
        <ArrowLeft className="size-4" aria-hidden />
        Bandeja de reformas
      </Link>

      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mb-1 flex flex-wrap items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-tinta-tenue">
            Traspaso {t.id} <InsigniaTraspaso estado={t.estado} />
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-tinta sm:text-[28px]">{(t.ficha.direccion as string) || "Sin dirección"}</h1>
          <p className="mt-1 text-[15px] text-tinta-suave">
            {[t.ficha.barrio, t.ficha.ciudad].filter(Boolean).join(", ")} · Recibido {formatFechaHora(t.creadoEn)} (
            {formatDuracion(new Date(t.creadoEn).getTime() - new Date(t.firmadoEn).getTime()).toLowerCase()} tras la firma) ·{" "}
            <Link href={`/vivienda/${t.viviendaId}`} className="font-medium text-tinta underline decoration-borde-fuerte underline-offset-2 hover:decoration-tinta">
              Ver ficha en Supply
            </Link>
          </p>
        </div>
        {pendiente && (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Boton variante="peligro" onClick={() => setDevolviendo(true)}>
              <CornerUpLeft className="size-4" aria-hidden />
              Devolver a Supply
            </Boton>
            <Boton
              variante="exito"
              onClick={() => {
                aceptarTraspaso(t.id);
                notificar({ titulo: "Traspaso aceptado", descripcion: "Supply recibe la confirmación. La obra puede planificarse." });
              }}
            >
              <CircleCheck className="size-4" aria-hidden />
              Aceptar
            </Boton>
          </div>
        )}
      </div>

      {t.estado === "Aceptado" && (
        <Aviso tono="exito" icono={<CircleCheck className="mt-0.5 size-5 shrink-0" aria-hidden />}>
          <strong className="font-semibold">Aceptado</strong> el {formatFechaHora(t.revisadoEn)}. La ficha llegó completa.
        </Aviso>
      )}
      {t.estado === "Devuelto a Supply" && t.motivoDevolucion && (
        <Aviso tono="alerta" icono={<CornerUpLeft className="mt-0.5 size-5 shrink-0" aria-hidden />}>
          <strong className="font-semibold">Devuelto a Supply</strong> el {formatFechaHora(t.revisadoEn)} · Campo: {t.motivoDevolucion.campoEtiqueta}
          <span className="mt-0.5 block">«{t.motivoDevolucion.comentario}»</span>
        </Aviso>
      )}
      {t.camposPendientes && t.camposPendientes.length > 0 && (
        <Aviso tono="aviso" icono={<TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />}>
          <strong className="font-semibold">Firmado en modo piloto con campos pendientes:</strong> {t.camposPendientes.join(", ")}.
        </Aviso>
      )}

      <section className="mb-6 rounded-2xl border border-borde bg-papel p-5 shadow-suave sm:p-6">
        <h2 className="mb-4 text-lg font-bold text-tinta">Resumen para obra</h2>
        <ResumenObra ficha={t.ficha} />
        <h3 className="mt-6 mb-2.5 text-[15px] font-semibold text-tinta-suave">Fotos ({fotos.length})</h3>
        <CampoFotos id="fotos-traspaso" valor={fotos} onCambio={() => {}} soloLectura />
      </section>

      <h2 className="mb-3 text-lg font-bold text-tinta">Ficha completa en el momento de la firma</h2>
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

function ResumenObra({ ficha }: { ficha: Ficha }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {RESUMEN_OBRA.map((clave) => {
        const def = buscarCampo(clave)?.campo;
        if (!def) return null;
        const valor = ficha[clave] ?? null;
        const vacio = textoValor(def, valor) === "—" || (Array.isArray(valor) && valor.length === 0);
        return (
          <div key={clave} className={def.tipo === "multiSeleccion" ? "sm:col-span-2 lg:col-span-3" : ""}>
            <dt className="text-sm font-medium text-tinta-suave">{def.etiqueta}</dt>
            <dd className="mt-1 text-[15px] font-semibold text-tinta">
              {vacio ? (
                <span className="inline-flex items-center gap-1.5 text-ladrillo">
                  <TriangleAlert className="size-4" aria-hidden />
                  Sin dato
                </span>
              ) : def.tipo === "multiSeleccion" && Array.isArray(valor) ? (
                <span className="flex flex-wrap gap-1.5">
                  {valor.map((v) => (
                    <span key={v} className="rounded-full bg-salvia px-3 py-1 text-sm font-semibold text-white">
                      {def.opciones?.find((o) => o.valor === v)?.etiqueta ?? v}
                    </span>
                  ))}
                </span>
              ) : (
                textoValor(def, valor)
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function Aviso({ tono, icono, children }: { tono: "exito" | "alerta" | "aviso"; icono: React.ReactNode; children: React.ReactNode }) {
  const estilos = {
    exito: "border-salvia/30 bg-salvia-claro text-salvia-oscuro",
    alerta: "border-ladrillo/40 bg-ladrillo-claro text-ladrillo-oscuro",
    aviso: "border-ambar-borde bg-ambar-claro text-ambar",
  }[tono];
  return (
    <div className={`mb-4 flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-[15px] sm:px-5 ${estilos}`}>
      {icono}
      <p>{children}</p>
    </div>
  );
}
