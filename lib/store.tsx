"use client";

// ESTADO GLOBAL DE LA DEMO
// Un store sencillo: guarda viviendas, traspasos y el modo piloto, expone las
// acciones del negocio (avanzar etapa, firmar, aceptar, devolver...) a través de
// un React context y lo persiste todo en localStorage para que la demo sobreviva
// a una recarga. En producción, cada acción sería una llamada a la base de datos
// (ver COMO-FUNCIONA.md).

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { crearDatosEjemplo, VERSION_DATOS } from "./seed";
import { buscarCampo, siguienteEstado } from "./stages";
import { camposPendientes, serializarValor, type CampoPendiente } from "./validation";
import type { EstadoDemo, EstadoVivienda, EventoHistorial, Traspaso, ValorCampo, Vivienda } from "./types";

const CLAVE_STORAGE = "traspaso-viviendas-supply-demo";

export type ResultadoAvance =
  | { ok: false; pendientes: CampoPendiente[] }
  | { ok: true; hasta: EstadoVivienda; traspaso?: Traspaso; conPendientes: string[] };

// --- Almacén en el navegador ------------------------------------------------
// Vive fuera de React para poder leer localStorage sin desajustes entre el
// servidor (que no tiene datos y pinta "cargando") y el navegador.

interface Instantanea {
  datos: EstadoDemo;
  /** true si el navegador no deja guardar (modo privado, almacenamiento lleno...). */
  errorGuardado: boolean;
}

let instantanea: Instantanea | null = null;
const oyentes = new Set<() => void>();

function leerGuardado(): EstadoDemo | null {
  try {
    const crudo = window.localStorage.getItem(CLAVE_STORAGE);
    if (!crudo) return null;
    const datos = JSON.parse(crudo) as EstadoDemo;
    if (datos?.version !== VERSION_DATOS || !Array.isArray(datos.viviendas) || !Array.isArray(datos.traspasos)) return null;
    return datos;
  } catch {
    return null;
  }
}

function leerInstantanea(): Instantanea {
  if (!instantanea) instantanea = { datos: leerGuardado() ?? crearDatosEjemplo(), errorGuardado: false };
  return instantanea;
}

function avisarOyentes() {
  oyentes.forEach((avisar) => avisar());
}

/** Único punto de escritura: actualiza la memoria, guarda en localStorage y repinta. */
function escribir(datos: EstadoDemo) {
  let errorGuardado = false;
  try {
    window.localStorage.setItem(CLAVE_STORAGE, JSON.stringify(datos));
  } catch {
    errorGuardado = true;
  }
  instantanea = { datos, errorGuardado };
  avisarOyentes();
}

/** Si la demo está abierta en dos pestañas (Supply y Reformas), se mantienen sincronizadas. */
function alCambiarOtraPestana(e: StorageEvent) {
  if (e.key !== CLAVE_STORAGE) return;
  const datos = leerGuardado();
  if (!datos) return;
  instantanea = { datos, errorGuardado: false };
  avisarOyentes();
}

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  if (oyentes.size === 1) window.addEventListener("storage", alCambiarOtraPestana);
  return () => {
    oyentes.delete(avisar);
    if (oyentes.size === 0) window.removeEventListener("storage", alCambiarOtraPestana);
  };
}

function actual(): EstadoDemo {
  return leerInstantanea().datos;
}

function ahoraISO() {
  return new Date().toISOString();
}

function idAleatorio() {
  return Math.random().toString(36).slice(2, 10);
}

/** Siguiente id correlativo con prefijo, p. ej. "TR-0142" a partir de "TR-0141". */
function siguienteId(prefijo: string, existentes: string[], digitos: number): string {
  const max = existentes.reduce((m, id) => {
    const n = Number(id.replace(prefijo, ""));
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `${prefijo}${String(max + 1).padStart(digitos, "0")}`;
}

function modificarVivienda(id: string, cambio: (v: Vivienda) => Vivienda) {
  const e = actual();
  escribir({ ...e, viviendas: e.viviendas.map((v) => (v.id === id ? cambio(v) : v)) });
}

// --- Acciones del negocio ---------------------------------------------------

const acciones = {
  crearVivienda({ direccion, barrio, ciudad }: { direccion: string; barrio: string; ciudad: string }): string {
    const e = actual();
    const id = siguienteId("VIV-", e.viviendas.map((v) => v.id), 4);
    const ahora = ahoraISO();
    const nueva: Vivienda = {
      id,
      etapa: "lead",
      creadaEn: ahora,
      ficha: { direccion: direccion.trim(), barrio: barrio.trim(), ciudad: ciudad.trim() },
      historial: [{ id: idAleatorio(), fecha: ahora, desde: null, hasta: "lead", nota: "Vivienda creada" }],
    };
    escribir({ ...e, viviendas: [...e.viviendas, nueva] });
    return id;
  },

  actualizarCampo(viviendaId: string, clave: string, valor: ValorCampo) {
    // Una vivienda traspasada queda en solo lectura: Reformas trabaja con la copia enviada.
    modificarVivienda(viviendaId, (v) => (v.etapa === "traspasada" ? v : { ...v, ficha: { ...v.ficha, [clave]: valor } }));
  },

  avanzarEtapa(viviendaId: string): ResultadoAvance {
    const e = actual();
    const v = e.viviendas.find((x) => x.id === viviendaId);
    if (!v || v.etapa === "traspasada") return { ok: false, pendientes: [] };

    const pendientes = camposPendientes(v);
    // Bloqueo real: si falta algo y no estamos en modo piloto, no se avanza.
    if (pendientes.length > 0 && !e.modoPiloto) return { ok: false, pendientes };

    const ahora = ahoraISO();
    const hasta = siguienteEstado(v.etapa);
    const etiquetasPendientes = pendientes.map((p) => p.etiqueta);
    const evento: EventoHistorial = {
      id: idAleatorio(),
      fecha: ahora,
      desde: v.etapa,
      hasta,
      ...(pendientes.length > 0 && { nota: "Avanzado en modo piloto con campos pendientes", camposPendientes: etiquetasPendientes }),
    };

    let traspaso: Traspaso | undefined;
    if (hasta === "traspasada") {
      // Al firmar se genera el traspaso con una copia completa de la ficha.
      traspaso = {
        id: siguienteId("TR-", e.traspasos.map((t) => t.id), 4),
        viviendaId: v.id,
        ficha: structuredClone(v.ficha),
        creadoEn: ahora,
        firmadoEn: ahora,
        estado: "Pendiente de revisión",
        ...(pendientes.length > 0 && { camposPendientes: etiquetasPendientes }),
      };
      evento.nota = evento.nota ?? "Firmada y enviada a reformas";
    }

    const actualizada: Vivienda = {
      ...v,
      etapa: hasta,
      historial: [...v.historial, evento],
      devolucion: hasta === "traspasada" ? undefined : v.devolucion,
    };

    escribir({
      ...e,
      viviendas: e.viviendas.map((x) => (x.id === v.id ? actualizada : x)),
      traspasos: traspaso ? [traspaso, ...e.traspasos] : e.traspasos,
    });
    return { ok: true, hasta, traspaso, conPendientes: etiquetasPendientes };
  },

  aceptarTraspaso(traspasoId: string) {
    const e = actual();
    escribir({
      ...e,
      traspasos: e.traspasos.map((t) => (t.id === traspasoId && t.estado === "Pendiente de revisión" ? { ...t, estado: "Aceptado", revisadoEn: ahoraISO() } : t)),
    });
  },

  devolverTraspaso(traspasoId: string, campo: string, comentario: string) {
    const e = actual();
    const t = e.traspasos.find((x) => x.id === traspasoId);
    if (!t || t.estado !== "Pendiente de revisión") return;
    const ahora = ahoraISO();
    const campoEtiqueta = buscarCampo(campo)?.campo.etiqueta ?? "Otro";
    escribir({
      ...e,
      traspasos: e.traspasos.map((x) =>
        x.id === traspasoId ? { ...x, estado: "Devuelto a Supply", revisadoEn: ahora, motivoDevolucion: { campo, campoEtiqueta, comentario: comentario.trim() } } : x,
      ),
      // La vivienda vuelve a Firma con una alerta visible del motivo.
      viviendas: e.viviendas.map((v) =>
        v.id === t.viviendaId
          ? {
              ...v,
              etapa: "firma",
              historial: [...v.historial, { id: idAleatorio(), fecha: ahora, desde: v.etapa, hasta: "firma", nota: `Devuelta por Reformas: ${campoEtiqueta}` }],
              devolucion: {
                traspasoId,
                campo,
                campoEtiqueta,
                comentario: comentario.trim(),
                fecha: ahora,
                valorAlDevolver: serializarValor(v.ficha[campo]),
                revisada: false,
              },
            }
          : v,
      ),
    });
  },

  marcarDevolucionRevisada(viviendaId: string) {
    modificarVivienda(viviendaId, (v) => (v.devolucion ? { ...v, devolucion: { ...v.devolucion, revisada: true } } : v));
  },

  setModoPiloto(activo: boolean) {
    escribir({ ...actual(), modoPiloto: activo });
  },

  reiniciarDemo() {
    escribir(crearDatosEjemplo());
  },
};

// --- Conexión con React -----------------------------------------------------

type ContextoStore = typeof acciones & {
  /** false mientras se leen los datos del navegador (y siempre en el servidor). */
  cargado: boolean;
  errorGuardado: boolean;
  viviendas: Vivienda[];
  traspasos: Traspaso[];
  modoPiloto: boolean;
};

const Contexto = createContext<ContextoStore | null>(null);

const sinDatosEnServidor = () => null;

export function StoreProvider({ children }: { children: ReactNode }) {
  const foto = useSyncExternalStore(suscribir, leerInstantanea, sinDatosEnServidor);

  const valor = useMemo<ContextoStore>(
    () => ({
      ...acciones,
      cargado: foto !== null,
      errorGuardado: foto?.errorGuardado ?? false,
      viviendas: foto?.datos.viviendas ?? [],
      traspasos: foto?.datos.traspasos ?? [],
      modoPiloto: foto?.datos.modoPiloto ?? false,
    }),
    [foto],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useStore(): ContextoStore {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useStore debe usarse dentro de <StoreProvider>");
  return ctx;
}
