"use client";

// PANTALLA 2 · Ficha de vivienda: etapas a la izquierda, campos en el centro y
// panel de avance a la derecha (abajo en móvil).

import { ArrowLeft, CircleCheck, CornerUpLeft, SearchX, Send } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { BarraAvanceMovil, PanelAvance } from "@/components/ficha/PanelAvance";
import { estadoPaso, PasosEtapas } from "@/components/ficha/PasosEtapas";
import { Historial } from "@/components/ficha/Historial";
import { SeccionEtapa } from "@/components/ficha/SeccionEtapa";
import { useNotificar } from "@/components/Notificaciones";
import { InsigniaTraspaso } from "@/components/reformas/InsigniaTraspaso";
import { BotonEnlace, Cargando, EstadoVacio, Insignia } from "@/components/ui";
import { formatFecha, formatFechaHora, plural } from "@/lib/format";
import { buscarCampo, ETAPAS, indiceEtapa, NOMBRE_ESTADO } from "@/lib/stages";
import { useStore } from "@/lib/store";
import type { EtapaId, Traspaso, Vivienda } from "@/lib/types";
import { camposPendientes, devolucionPendiente } from "@/lib/validation";

/** Qué etapas se muestran desplegadas al abrir la ficha. */
function abiertaPorDefecto(v: Vivienda, etapaId: EtapaId): boolean {
  if (v.etapa === "traspasada") return etapaId === "firma";
  const i = indiceEtapa(etapaId);
  const actual = indiceEtapa(v.etapa);
  if (i === actual) return true;
  if (i > actual) return false;
  // Etapas anteriores: solo si tienen algo pendiente o el campo devuelto por Reformas.
  return camposPendientes(v).some((p) => p.etapaId === etapaId);
}

export default function FichaPage() {
  const { id } = useParams<{ id: string }>();
  const { cargado, viviendas } = useStore();
  const vivienda = viviendas.find((v) => v.id === id);

  if (!cargado) return <Cargando />;

  if (!vivienda) {
    return (
      <EstadoVacio
        icono={<SearchX className="size-8" />}
        titulo="No encontramos esta vivienda"
        descripcion="Puede que se haya reiniciado la demo o que el enlace no sea correcto."
        accion={<BotonEnlace href="/">Volver al embudo</BotonEnlace>}
      />
    );
  }

  // La key reinicia el estado local (etapas desplegadas) al cambiar de vivienda.
  return <FichaVivienda key={vivienda.id} vivienda={vivienda} />;
}

function FichaVivienda({ vivienda: v }: { vivienda: Vivienda }) {
  const { traspasos, modoPiloto, actualizarCampo, avanzarEtapa, marcarDevolucionRevisada } = useStore();
  const notificar = useNotificar();
  // Etapas que la persona ha abierto o cerrado a mano (si no, se usa abiertaPorDefecto).
  const [manual, setManual] = useState<Partial<Record<EtapaId, boolean>>>({});

  const irACampo = useCallback((clave: string) => {
    const etapa = buscarCampo(clave)?.etapa.id;
    if (etapa) setManual((m) => ({ ...m, [etapa]: true }));
    // Espera a que la sección se despliegue antes de hacer scroll.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const el = document.getElementById(`campo-${clave}`);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.remove("destello");
        void el.offsetWidth; // reinicia la animación si se pulsa dos veces
        el.classList.add("destello");
        window.setTimeout(() => el.classList.remove("destello"), 2400);
        document.getElementById(`input-${clave}`)?.focus({ preventScroll: true });
      }),
    );
  }, []);

  const irAEtapa = useCallback((etapa: EtapaId) => {
    setManual((m) => ({ ...m, [etapa]: true }));
    requestAnimationFrame(() => document.getElementById(`etapa-${etapa}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const pendientes = camposPendientes(v);
  const soloLectura = v.etapa === "traspasada";
  const traspaso = traspasos.find((t) => t.viviendaId === v.id);
  const campoDevuelto = v.devolucion && devolucionPendiente(v) ? v.devolucion.campo : undefined;
  const zona = [v.ficha.barrio, v.ficha.ciudad].filter(Boolean).join(", ");

  function avanzar() {
    const anterior = v.etapa;
    const r = avanzarEtapa(v.id);
    if (!r.ok) {
      notificar({ titulo: "No se puede avanzar todavía", descripcion: `Faltan ${plural(r.pendientes.length, "campo")} obligatorios.`, tipo: "aviso" });
      return;
    }
    setManual({});
    if (r.traspaso) {
      notificar({
        titulo: "Traspaso enviado a reformas · aviso enviado al coordinador",
        descripcion: `${r.traspaso.id} · ${v.ficha.direccion as string}`,
        accion: { etiqueta: "Ver en la bandeja de Reno", href: `/reformas/${r.traspaso.id}` },
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    notificar({
      titulo: `${NOMBRE_ESTADO[anterior]} completada: ahora en ${NOMBRE_ESTADO[r.hasta]}`,
      descripcion:
        r.conPendientes.length > 0
          ? `Modo piloto: se registran ${plural(r.conPendientes.length, "campo")} pendientes.`
          : r.hasta === "firma"
            ? "Completa los datos de firma para enviar el traspaso."
            : "Completa los campos obligatorios de la nueva etapa.",
      tipo: r.conPendientes.length > 0 ? "aviso" : "exito",
    });
    if (r.hasta !== "traspasada") {
      const siguiente = r.hasta;
      requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(`etapa-${siguiente}`)?.scrollIntoView({ behavior: "smooth", block: "start" })));
    }
  }

  return (
    <div className="pb-24 lg:pb-0">
      <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-tinta-suave hover:text-tinta">
        <ArrowLeft className="size-4" aria-hidden />
        Embudo
      </Link>

      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-tinta sm:text-[28px]">{(v.ficha.direccion as string) || "Sin dirección"}</h1>
          <p className="mt-1 text-[15px] text-tinta-suave">
            {zona && `${zona} · `}
            {v.id} · Alta el {formatFecha(v.creadaEn)}
          </p>
        </div>
        <Insignia tono={soloLectura ? "exito" : "info"} className="self-start text-sm">
          {NOMBRE_ESTADO[v.etapa]}
        </Insignia>
      </div>

      {v.devolucion && v.etapa === "firma" && (
        <AlertaDevolucion vivienda={v} pendiente={Boolean(campoDevuelto)} onIrCampo={irACampo} onRevisada={() => marcarDevolucionRevisada(v.id)} />
      )}
      {soloLectura && traspaso && <BannerTraspasada traspaso={traspaso} />}

      <div className="mb-5 lg:hidden">
        <PasosEtapas vivienda={v} onIr={irAEtapa} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[210px_minmax(0,1fr)_340px] xl:grid-cols-[230px_minmax(0,1fr)_360px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <PasosEtapas vivienda={v} onIr={irAEtapa} />
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          {ETAPAS.map((etapa, i) => (
            <SeccionEtapa
              key={etapa.id}
              etapa={etapa}
              numero={i + 1}
              estado={estadoPaso(v, etapa.id)}
              vivienda={v}
              abierta={manual[etapa.id] ?? abiertaPorDefecto(v, etapa.id)}
              onAlternar={() => setManual((m) => ({ ...m, [etapa.id]: !(m[etapa.id] ?? abiertaPorDefecto(v, etapa.id)) }))}
              onCambio={(clave, valor) => actualizarCampo(v.id, clave, valor)}
              soloLectura={soloLectura}
              campoDevuelto={campoDevuelto}
            />
          ))}
        </div>

        <aside className="space-y-4">
          <div className="space-y-4 lg:sticky lg:top-24">
            <PanelAvance vivienda={v} pendientes={pendientes} modoPiloto={modoPiloto} onAvanzar={avanzar} onIrCampo={irACampo} />
            <Historial eventos={v.historial} />
          </div>
        </aside>
      </div>

      <BarraAvanceMovil vivienda={v} pendientes={pendientes} modoPiloto={modoPiloto} onAvanzar={avanzar} />
    </div>
  );
}

function AlertaDevolucion({ vivienda, pendiente, onIrCampo, onRevisada }: { vivienda: Vivienda; pendiente: boolean; onIrCampo: (c: string) => void; onRevisada: () => void }) {
  const d = vivienda.devolucion!;
  const existeCampo = Boolean(buscarCampo(d.campo));
  if (!pendiente) {
    return (
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-salvia/30 bg-salvia-claro px-4 py-3.5 text-salvia-oscuro sm:px-5" role="status">
        <CircleCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
        <p className="text-[15px]">
          <strong className="font-semibold">Corrección hecha:</strong> «{d.campoEtiqueta}» ya está revisado. Cuando la ficha esté completa, vuelve a firmar para enviar un nuevo traspaso.
        </p>
      </div>
    );
  }
  return (
    <div className="mb-5 rounded-2xl border-2 border-ladrillo bg-ladrillo-claro px-4 py-4 sm:px-5" role="alert">
      <div className="flex items-start gap-3">
        <CornerUpLeft className="mt-0.5 size-5 shrink-0 text-ladrillo" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ladrillo-oscuro">
            Devuelta por Reformas · {d.campoEtiqueta}
            <span className="ml-2 text-sm font-medium text-ladrillo-oscuro/70">{formatFechaHora(d.fecha)}</span>
          </p>
          <p className="mt-1 text-[15px] text-tinta">«{d.comentario}»</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {existeCampo && (
              <button type="button" onClick={() => onIrCampo(d.campo)} className="rounded-lg bg-ladrillo px-3.5 py-2 text-[15px] font-semibold text-white hover:bg-ladrillo-oscuro">
                Ir al campo
              </button>
            )}
            <button type="button" onClick={onRevisada} className="rounded-lg border border-ladrillo/40 bg-papel px-3.5 py-2 text-[15px] font-semibold text-ladrillo-oscuro hover:bg-white">
              Marcar como revisado
            </button>
            <Link href={`/reformas/${d.traspasoId}`} className="rounded-lg px-3 py-2 text-[15px] font-medium text-ladrillo-oscuro underline-offset-2 hover:underline">
              Ver traspaso {d.traspasoId}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function BannerTraspasada({ traspaso }: { traspaso: Traspaso }) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-salvia/30 bg-salvia-claro px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex items-start gap-3">
        <Send className="mt-0.5 size-5 shrink-0 text-salvia" aria-hidden />
        <div>
          <p className="flex flex-wrap items-center gap-2 font-bold text-salvia-oscuro">
            Traspasada a reformas · {traspaso.id} <InsigniaTraspaso estado={traspaso.estado} />
          </p>
          <p className="mt-0.5 text-[15px] text-tinta-suave">
            Enviada el {formatFechaHora(traspaso.creadoEn)}. La ficha queda en solo lectura: Reformas trabaja con la copia enviada.
          </p>
        </div>
      </div>
      <BotonEnlace href={`/reformas/${traspaso.id}`} variante="exito" className="shrink-0">
        Ver en Reno
      </BotonEnlace>
    </div>
  );
}
