"use client";

// PANTALLA 2 · Ficha de vivienda: línea de tiempo de etapas con sus campos a la izquierda
// y panel «Siguiente paso» a la derecha (arriba en móvil, con barra fija abajo).

import { ArrowLeft, CornerUpLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useState, type CSSProperties } from "react";
import { Historial } from "@/components/ficha/Historial";
import { BarraAvanceMovil, PanelAvance } from "@/components/ficha/PanelAvance";
import { estadoPaso, NodoFinal } from "@/components/ficha/PasosEtapas";
import { SeccionEtapa } from "@/components/ficha/SeccionEtapa";
import { anunciarLlegada, comportamientoScroll } from "@/components/movimiento";
import { useNotificar } from "@/components/Notificaciones";
import { InsigniaTraspaso } from "@/components/reformas/InsigniaTraspaso";
import { Boton, BotonEnlace, Cargando, CheckExito, Estado, EstadoVacio, IconoCompleto, Migas } from "@/components/ui";
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

  if (!cargado) return <Cargando tipo="ficha" />;

  if (!vivienda) {
    return (
      <EstadoVacio
        ilustracion="busqueda"
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
  // Se acaba de firmar desde esta pantalla: se muestra el estado de éxito animado.
  const [recienFirmada, setRecienFirmada] = useState(false);

  const irACampo = useCallback((clave: string) => {
    const etapa = buscarCampo(clave)?.etapa.id;
    if (etapa) setManual((m) => ({ ...m, [etapa]: true }));
    // Espera a que la sección se despliegue antes de hacer scroll.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const el = document.getElementById(`campo-${clave}`);
        if (!el) return;
        el.scrollIntoView({ behavior: comportamientoScroll(), block: "center" });
        el.classList.remove("destello");
        void el.offsetWidth; // reinicia la animación si se pulsa dos veces
        el.classList.add("destello");
        window.setTimeout(() => el.classList.remove("destello"), 1800);
        document.getElementById(`input-${clave}`)?.focus({ preventScroll: true });
      }),
    );
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
      setRecienFirmada(true);
      anunciarLlegada(v.id);
      notificar({
        titulo: "Traspaso enviado a reformas · aviso enviado al coordinador",
        descripcion: `${r.traspaso.id} · ${v.ficha.direccion as string}`,
        accion: { etiqueta: "Ver en la bandeja de Reformas", href: `/reformas/${r.traspaso.id}` },
      });
      window.scrollTo({ top: 0, behavior: comportamientoScroll() });
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
      requestAnimationFrame(() =>
        requestAnimationFrame(() => document.getElementById(`etapa-${siguiente}`)?.scrollIntoView({ behavior: comportamientoScroll(), block: "start" })),
      );
    }
  }

  return (
    <div className="pb-24 lg:pb-0">
      <Migas items={[{ etiqueta: "Embudo", href: "/" }, { etiqueta: v.id }]} />

      <header className="animar-entrada mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6 lg:mb-10">
        <div className="min-w-0">
          <h1 className="font-display text-[30px] leading-[1.1] font-semibold tracking-[-0.015em] text-balance text-tinta sm:text-[38px]">
            {(v.ficha.direccion as string) || "Sin dirección"}
          </h1>
          <p className="mt-2 text-[15px] text-secundario-fondo">
            {zona && `${zona} · `}Alta el {formatFecha(v.creadaEn)}
          </p>
        </div>
        <div className="shrink-0 sm:pt-3">
          {soloLectura ? (
            <Estado tono="completo" className="text-sm">
              Traspasada a reformas
            </Estado>
          ) : (
            <Estado tono="actual" className="rounded-full border border-borde bg-superficie py-1.5 pr-3 pl-2.5 text-sm shadow-suave">
              {NOMBRE_ESTADO[v.etapa]} · etapa {indiceEtapa(v.etapa) + 1} de {ETAPAS.length}
            </Estado>
          )}
        </div>
      </header>

      {v.devolucion && v.etapa === "firma" && (
        <AlertaDevolucion vivienda={v} pendiente={Boolean(campoDevuelto)} onIrCampo={irACampo} onRevisada={() => marcarDevolucionRevisada(v.id)} />
      )}
      {soloLectura && traspaso && <BannerTraspasada traspaso={traspaso} recien={recienFirmada} />}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-12">
        {!soloLectura && (
          <aside className="animar-entrada lg:col-start-2 lg:row-start-1" style={{ "--retraso": "80ms" } as CSSProperties} aria-label="Siguiente paso">
            <div className="lg:sticky lg:top-6">
              <PanelAvance vivienda={v} pendientes={pendientes} modoPiloto={modoPiloto} onAvanzar={avanzar} onIrCampo={irACampo} />
            </div>
          </aside>
        )}

        <div className={`min-w-0 lg:row-start-1 ${soloLectura ? "lg:col-span-2 lg:max-w-4xl" : "lg:col-start-1"}`}>
          <ol aria-label="Etapas de la vivienda">
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
                primera={i === 0}
              />
            ))}
            <li className="relative grid grid-cols-[20px_minmax(0,1fr)] gap-x-4">
              <span className={`absolute top-0 left-[9.5px] h-6 w-px ${soloLectura ? "bg-marino/40" : "bg-borde-fuerte"}`} aria-hidden />
              <div className="pt-[14px]">
                <NodoFinal traspasada={soloLectura} />
              </div>
              <div className="py-3">
                <p className={`font-display text-[19px] leading-6 font-semibold tracking-[-0.01em] ${soloLectura ? "text-tinta" : "text-pizarra"}`}>Reformas</p>
                <p className="mt-0.5 text-sm text-secundario-fondo">{soloLectura ? `Traspasada${traspaso ? ` · ${traspaso.id}` : ""}` : "El traspaso se envía solo al firmar"}</p>
              </div>
            </li>
          </ol>

          <div className="mt-10 lg:pl-9">
            <Historial eventos={v.historial} />
          </div>
        </div>
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
      <div className="animar-entrada mb-8 flex items-start gap-3 rounded-xl border border-borde bg-superficie px-4 py-3 sm:px-5" role="status">
        <IconoCompleto className="mt-0.5 size-5" animar />
        <p className="text-[15px] text-pizarra">
          <strong className="font-semibold text-marino">Corrección hecha:</strong> «{d.campoEtiqueta}» ya está revisado. Cuando la ficha esté completa, vuelve a firmar para enviar un nuevo traspaso.
        </p>
      </div>
    );
  }
  return (
    <section className="animar-entrada relative mb-8 overflow-hidden rounded-xl border border-azul/30 bg-superficie p-4 pl-5 shadow-suave sm:p-6 sm:pl-7" role="alert">
      <span className="absolute inset-y-0 left-0 w-1 bg-azul" aria-hidden />
      <p className="flex flex-wrap items-center gap-x-2 text-[13px] font-semibold text-azul">
        <CornerUpLeft className="size-3.5" aria-hidden />
        Devuelta por Reformas
        <span className="font-normal text-secundario tabular-nums">· {formatFechaHora(d.fecha)}</span>
      </p>
      <p className="mt-2 font-display text-[22px] leading-7 font-semibold tracking-[-0.01em] text-tinta">{d.campoEtiqueta}</p>
      <p className="mt-1 max-w-3xl text-[15px] text-pizarra">«{d.comentario}»</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {existeCampo && (
          <Boton tamano="sm" onClick={() => onIrCampo(d.campo)}>
            Ir al campo
          </Boton>
        )}
        <Boton variante="secundario" tamano="sm" onClick={onRevisada}>
          Marcar como revisado
        </Boton>
        <Link
          href={`/reformas/${d.traspasoId}`}
          className="rounded text-sm font-medium text-pizarra underline decoration-pizarra/30 underline-offset-4 transition-colors hover:text-tinta hover:decoration-tinta/60 sm:ml-2"
        >
          Ver traspaso {d.traspasoId}
        </Link>
      </div>
    </section>
  );
}

/** Vivienda traspasada. Si se acaba de firmar, es el clímax de la demo: check animado y siguiente paso claro. */
function BannerTraspasada({ traspaso, recien }: { traspaso: Traspaso; recien: boolean }) {
  return (
    <section
      className={`animar-entrada mb-8 flex flex-col gap-5 rounded-xl border bg-superficie p-5 sm:flex-row sm:items-center sm:p-6 ${recien ? "border-marino/25 shadow-elevacion" : "border-borde"}`}
      role={recien ? "status" : undefined}
    >
      <CheckExito animar={recien} retraso={recien ? 300 : 0} className={recien ? "size-14" : "size-10"} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[13px] font-semibold text-secundario tabular-nums">Traspaso {traspaso.id}</span>
          <InsigniaTraspaso estado={traspaso.estado} />
        </p>
        <h2 className="mt-1 font-display text-2xl leading-8 font-semibold tracking-[-0.01em] text-tinta">
          {recien ? "Traspaso enviado a reformas" : "Traspasada a reformas"}
        </h2>
        <p className="mt-1 text-[15px] text-pizarra">
          {recien
            ? "Se ha creado con una copia completa de la ficha y se ha avisado al coordinador de obra. Nadie tiene que copiar datos a mano."
            : `Enviado el ${formatFechaHora(traspaso.creadoEn)}. La ficha queda en solo lectura: Reformas trabaja con la copia enviada.`}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
        <BotonEnlace href={`/reformas/${traspaso.id}`} variante={recien ? "primario" : "secundario"}>
          Ver en Reformas
        </BotonEnlace>
        {recien && (
          <Link href="/" className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-pizarra transition-colors hover:text-tinta">
            <ArrowLeft className="size-4" aria-hidden />
            Volver al embudo
          </Link>
        )}
      </div>
    </section>
  );
}
