"use client";

// PANTALLA 2 · Ficha de vivienda: línea de tiempo de etapas con sus campos a la izquierda
// y panel «Siguiente paso» a la derecha (arriba en móvil, con barra fija abajo).

import { Check, CornerUpLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Historial } from "@/components/ficha/Historial";
import { BarraAvanceMovil, PanelAvance } from "@/components/ficha/PanelAvance";
import { estadoPaso, NodoFinal } from "@/components/ficha/PasosEtapas";
import { SeccionEtapa } from "@/components/ficha/SeccionEtapa";
import { useNotificar } from "@/components/Notificaciones";
import { InsigniaTraspaso } from "@/components/reformas/InsigniaTraspaso";
import { Boton, BotonEnlace, Cargando, Estado, EstadoVacio, Migas } from "@/components/ui";
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
      <Migas items={[{ etiqueta: "Embudo", href: "/" }, { etiqueta: v.id }]} />

      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6 lg:mb-10">
        <div className="min-w-0">
          <h1 className="font-display text-[28px] leading-[1.1] font-semibold tracking-[-0.025em] text-balance text-tinta sm:text-[34px]">{(v.ficha.direccion as string) || "Sin dirección"}</h1>
          <p className="mt-2 text-[15px] text-tinta-suave">
            {zona && `${zona} · `}Alta el {formatFecha(v.creadaEn)}
          </p>
        </div>
        <div className="shrink-0 sm:pt-2">
          {soloLectura ? (
            <Estado tono="completo" className="text-sm">
              Traspasada a reformas
            </Estado>
          ) : (
            <Estado tono="actual" className="text-sm">
              {NOMBRE_ESTADO[v.etapa]} · etapa {indiceEtapa(v.etapa) + 1} de {ETAPAS.length}
            </Estado>
          )}
        </div>
      </header>

      {v.devolucion && v.etapa === "firma" && (
        <AlertaDevolucion vivienda={v} pendiente={Boolean(campoDevuelto)} onIrCampo={irACampo} onRevisada={() => marcarDevolucionRevisada(v.id)} />
      )}
      {soloLectura && traspaso && <BannerTraspasada traspaso={traspaso} />}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-12">
        {!soloLectura && (
          <aside className="lg:col-start-2 lg:row-start-1" aria-label="Siguiente paso">
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
              <span className="absolute top-0 left-[9.5px] h-6 w-px bg-borde" aria-hidden />
              <div className="pt-[14px]">
                <NodoFinal traspasada={soloLectura} />
              </div>
              <div className="py-3">
                <p className={`font-display text-lg leading-6 font-semibold tracking-[-0.01em] ${soloLectura ? "text-tinta" : "text-tinta-suave"}`}>Reformas</p>
                <p className="mt-0.5 text-sm text-tinta-tenue">{soloLectura ? `Traspasada${traspaso ? ` · ${traspaso.id}` : ""}` : "El traspaso se envía solo al firmar"}</p>
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
      <div className="mb-8 flex items-start gap-3 rounded-xl border border-borde px-4 py-3 sm:px-5" role="status">
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-salvia text-white" aria-hidden>
          <Check className="size-3" strokeWidth={3} />
        </span>
        <p className="text-[15px] text-tinta-suave">
          <strong className="font-semibold text-salvia">Corrección hecha:</strong> «{d.campoEtiqueta}» ya está revisado. Cuando la ficha esté completa, vuelve a firmar para enviar un nuevo traspaso.
        </p>
      </div>
    );
  }
  return (
    <section className="mb-8 rounded-xl border border-ladrillo/25 bg-ladrillo-claro/50 p-4 sm:p-6" role="alert">
      <p className="flex flex-wrap items-center gap-x-2 text-[13px] font-medium text-ladrillo">
        <CornerUpLeft className="size-3.5" strokeWidth={2.25} aria-hidden />
        Devuelta por Reformas
        <span className="font-normal text-tinta-tenue tabular-nums">· {formatFechaHora(d.fecha)}</span>
      </p>
      <p className="mt-2 font-display text-xl leading-7 font-semibold tracking-[-0.01em] text-tinta">{d.campoEtiqueta}</p>
      <p className="mt-1 max-w-3xl text-[15px] text-tinta-suave">«{d.comentario}»</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {existeCampo && (
          <Boton variante="accion" tamano="sm" onClick={() => onIrCampo(d.campo)}>
            Ir al campo
          </Boton>
        )}
        <Boton variante="secundario" tamano="sm" onClick={onRevisada}>
          Marcar como revisado
        </Boton>
        <Link href={`/reformas/${d.traspasoId}`} className="rounded text-sm font-medium sm:ml-2 text-tinta-suave underline decoration-tinta/20 underline-offset-4 transition-colors hover:text-tinta hover:decoration-tinta/50">
          Ver traspaso {d.traspasoId}
        </Link>
      </div>
    </section>
  );
}

function BannerTraspasada({ traspaso }: { traspaso: Traspaso }) {
  return (
    <section className="mb-8 flex flex-col gap-4 rounded-xl border border-borde p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-display text-lg leading-6 font-semibold tracking-[-0.01em] text-tinta">Traspaso {traspaso.id}</span>
          <InsigniaTraspaso estado={traspaso.estado} />
        </p>
        <p className="mt-1 text-[15px] text-tinta-suave">
          Enviado el {formatFechaHora(traspaso.creadoEn)}. La ficha queda en solo lectura: Reformas trabaja con la copia enviada.
        </p>
      </div>
      <BotonEnlace href={`/reformas/${traspaso.id}`} variante="secundario">
        Ver en Reno
      </BotonEnlace>
    </section>
  );
}
