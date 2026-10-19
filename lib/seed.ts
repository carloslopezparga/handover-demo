// DATOS DE EJEMPLO
// 8 viviendas ficticias en Madrid repartidas por todo el embudo y 2 traspasos ya existentes.
// Las fechas se calculan respecto a "ahora" para que la demo parezca siempre reciente.

import { hoyISO } from "./format";
import type { EstadoDemo, EstadoVivienda, EventoHistorial, Ficha, Traspaso, Vivienda } from "./types";

export const VERSION_DATOS = 1;

const FOTOS = {
  fachada: "/fotos/fachada.svg",
  salon: "/fotos/salon.svg",
  cocina: "/fotos/cocina.svg",
  dormitorio: "/fotos/dormitorio.svg",
  bano: "/fotos/bano.svg",
  terraza: "/fotos/terraza.svg",
};

/** Fotos de ejemplo que la ficha ofrece para añadir con un clic. */
export const FOTOS_EJEMPLO = Object.values(FOTOS);

function hace(dias: number, horas = 0): string {
  return new Date(Date.now() - (dias * 24 + horas) * 3_600_000).toISOString();
}

/** Construye un historial a partir de una lista de [estado, fecha, nota?, camposPendientes?]. */
function historial(pasos: [EstadoVivienda, string, string?, string[]?][]): EventoHistorial[] {
  return pasos.map(([hasta, fecha, nota, camposPendientes], i) => ({
    id: `h-${hasta}-${i}-${fecha}`,
    fecha,
    desde: i === 0 ? null : pasos[i - 1][0],
    hasta,
    nota,
    camposPendientes,
  }));
}

function lead(direccion: string, barrio: string, extra: Ficha): Ficha {
  return { direccion, barrio, ciudad: "Madrid", ...extra };
}

export function crearDatosEjemplo(): EstadoDemo {
  const viviendas: Vivienda[] = [
    // LEAD · recién entrado, le faltan origen y contacto
    {
      id: "VIV-1031",
      etapa: "lead",
      creadaEn: hace(0, 3),
      ficha: lead("Calle de la Oca 41, 2º A", "Carabanchel", { tipologia: "piso", precioPedido: "159.000" }),
      historial: historial([["lead", hace(0, 3)]]),
    },
    // LEAD · completo, listo para cualificar
    {
      id: "VIV-1029",
      etapa: "lead",
      creadaEn: hace(2),
      ficha: lead("Calle de Antonio López 58, 2º C", "Usera", {
        tipologia: "piso",
        precioPedido: "168.500",
        origenLead: "agencia",
        contactoPropietario: "Luis Moreno · luis.moreno@example.com",
      }),
      historial: historial([["lead", hace(2)]]),
    },
    // CUALIFICACIÓN · encaje marcado pero sin comentario
    {
      id: "VIV-1024",
      etapa: "cualificacion",
      creadaEn: hace(6),
      ficha: lead("Calle de Alcalá 388, 1º B", "Ciudad Lineal", {
        tipologia: "piso",
        precioPedido: "214.000",
        origenLead: "portal",
        contactoPropietario: "Marta Gil · 600 000 214",
        rentabilidadBruta: "5,8",
        encajeInversor: { respuesta: "si", comentario: "" },
      }),
      historial: historial([
        ["lead", hace(6)],
        ["cualificacion", hace(3)],
      ]),
    },
    // VISITA · solo 1 foto de las 3 mínimas
    {
      id: "VIV-1019",
      etapa: "visita",
      creadaEn: hace(10),
      ficha: lead("Avenida de la Albufera 77, 3º A", "Puente de Vallecas", {
        tipologia: "piso",
        precioPedido: "149.000",
        origenLead: "referido",
        contactoPropietario: "Antonio Pérez · 600 000 149",
        rentabilidadBruta: "6,9",
        encajeInversor: { respuesta: "si", comentario: "Buena rentabilidad y zona con alta demanda de alquiler." },
        m2Utiles: "62",
        m2Construidos: "74",
        habitaciones: "3",
        banos: "1",
        planta: "3",
        ascensor: "no",
        estadoVivienda: 2,
        estadoInstalaciones: "Electricidad antigua sin boletín; fontanería de hierro.",
        fotos: [FOTOS.fachada],
      }),
      historial: historial([
        ["lead", hace(10)],
        ["cualificacion", hace(8)],
        ["visita", hace(2)],
      ]),
    },
    // OFERTA · LA VIVIENDA DE LA DEMO: le faltan alcance y coste de la reforma
    {
      id: "VIV-1017",
      etapa: "oferta",
      creadaEn: hace(14),
      ficha: lead("Calle de Bravo Murillo 241, 5º D", "Tetuán", {
        tipologia: "piso",
        precioPedido: "182.000",
        origenLead: "portal",
        contactoPropietario: "Carmen Ruiz · carmen.ruiz@example.com",
        rentabilidadBruta: "6,4",
        encajeInversor: { respuesta: "si", comentario: "Perfil rentabilidad: barrio con demanda estable y precio de entrada ajustado." },
        m2Utiles: "68",
        m2Construidos: "79",
        habitaciones: "3",
        banos: "1",
        planta: "5",
        ascensor: "si",
        estadoVivienda: 2,
        estadoInstalaciones: "Electricidad sin actualizar desde los 90. Caldera individual de gas (2016).",
        fotos: [FOTOS.fachada, FOTOS.salon, FOTOS.cocina, FOTOS.bano],
        precioAcordado: "172.000",
        fechaPrevistaFirma: hoyISO(12),
      }),
      historial: historial([
        ["lead", hace(14)],
        ["cualificacion", hace(12)],
        ["visita", hace(9)],
        ["oferta", hace(0, 1)],
      ]),
    },
    // OFERTA · completa, lista para pasar a Firma
    {
      id: "VIV-1012",
      etapa: "oferta",
      creadaEn: hace(21),
      ficha: lead("Calle del General Ricardos 133, 4º B", "Carabanchel", {
        tipologia: "piso",
        precioPedido: "176.000",
        origenLead: "propietario",
        contactoPropietario: "Javier Ortega · 600 000 176",
        rentabilidadBruta: "6,6",
        encajeInversor: { respuesta: "si", comentario: "Encaja con inversores que buscan primera vivienda en alquiler." },
        m2Utiles: "71",
        m2Construidos: "83",
        habitaciones: "3",
        banos: "2",
        planta: "4",
        ascensor: "si",
        estadoVivienda: 3,
        estadoInstalaciones: "Instalaciones correctas; ventanas de aluminio sin rotura de puente térmico.",
        fotos: [FOTOS.fachada, FOTOS.salon, FOTOS.dormitorio, FOTOS.bano, FOTOS.cocina],
        alcanceReforma: ["cocina", "suelos", "pintura", "carpinteria"],
        costeReforma: "24.500",
        precioAcordado: "168.000",
        fechaPrevistaFirma: hoyISO(20),
      }),
      historial: historial([
        ["lead", hace(21)],
        ["cualificacion", hace(19)],
        ["visita", hace(15)],
        ["oferta", hace(3)],
      ]),
    },
    // FIRMA · DEVUELTA por Reformas: se firmó en modo piloto sin m² útiles
    {
      id: "VIV-1008",
      etapa: "firma",
      creadaEn: hace(30),
      ficha: lead("Calle de Embajadores 112, 4º A", "Arganzuela", {
        tipologia: "piso",
        precioPedido: "195.000",
        origenLead: "agencia",
        contactoPropietario: "Rosa Navarro · rosa.navarro@example.com",
        rentabilidadBruta: "6,1",
        encajeInversor: { respuesta: "si", comentario: "Zona consolidada, buena liquidez para el inversor." },
        m2Utiles: "",
        m2Construidos: "88",
        habitaciones: "3",
        banos: "1",
        planta: "4",
        ascensor: "si",
        estadoVivienda: 3,
        estadoInstalaciones: "Electricidad renovada en 2012. Bajantes de fibrocemento.",
        fotos: [FOTOS.fachada, FOTOS.salon, FOTOS.cocina, FOTOS.dormitorio],
        alcanceReforma: ["banos", "cocina", "pintura", "fontaneria"],
        costeReforma: "31.000",
        precioAcordado: "186.000",
        fechaPrevistaFirma: hoyISO(-3),
        fechaFirma: hoyISO(-2),
        accesoLlaves: "2 juegos en la oficina de Supply; el portero tiene un tercero.",
        documentacion: ["notaSimple", "contrato"],
        contactoObra: "Rosa Navarro (propietaria saliente) · 600 000 195",
      }),
      historial: historial([
        ["lead", hace(30)],
        ["cualificacion", hace(27)],
        ["visita", hace(22)],
        ["oferta", hace(12)],
        ["firma", hace(4)],
        ["traspasada", hace(2), "Avanzado en modo piloto con campos pendientes", ["m² útiles"]],
        ["firma", hace(1), "Devuelta por Reformas: faltan m² útiles"],
      ]),
      devolucion: {
        traspasoId: "TR-0141",
        campo: "m2Utiles",
        campoEtiqueta: "m² útiles",
        comentario: "Faltan m² útiles: sin ellos no podemos medir ni presupuestar suelos y pintura.",
        fecha: hace(1),
        valorAlDevolver: JSON.stringify(""),
        revisada: false,
      },
    },
    // TRASPASADA · traspaso aceptado por Reformas
    {
      id: "VIV-1003",
      etapa: "traspasada",
      creadaEn: hace(40),
      ficha: lead("Calle de Toledo 96, 2º Izq.", "La Latina", {
        tipologia: "atico",
        precioPedido: "229.000",
        origenLead: "referido",
        contactoPropietario: "Pilar Santos · pilar.santos@example.com",
        rentabilidadBruta: "5,6",
        encajeInversor: { respuesta: "si", comentario: "Ático con terraza: atractivo para alquiler a largo plazo." },
        m2Utiles: "58",
        m2Construidos: "66",
        habitaciones: "2",
        banos: "1",
        planta: "6",
        ascensor: "si",
        estadoVivienda: 3,
        estadoInstalaciones: "Climatización inexistente; resto de instalaciones en buen estado.",
        fotos: [FOTOS.fachada, FOTOS.terraza, FOTOS.salon, FOTOS.dormitorio],
        alcanceReforma: ["climatizacion", "pintura", "suelos"],
        costeReforma: "18.500",
        precioAcordado: "221.000",
        fechaPrevistaFirma: hoyISO(-7),
        fechaFirma: hoyISO(-6),
        accesoLlaves: "Llaves entregadas al coordinador de obra en la firma.",
        documentacion: ["notaSimple", "contrato"],
        contactoObra: "Pilar Santos · 600 000 229",
      }),
      historial: historial([
        ["lead", hace(40)],
        ["cualificacion", hace(37)],
        ["visita", hace(31)],
        ["oferta", hace(20)],
        ["firma", hace(9)],
        ["traspasada", hace(6)],
      ]),
    },
  ];

  const porId = (id: string) => viviendas.find((v) => v.id === id)!;

  const traspasos: Traspaso[] = [
    {
      id: "TR-0141",
      viviendaId: "VIV-1008",
      ficha: { ...porId("VIV-1008").ficha },
      creadoEn: hace(2),
      firmadoEn: hace(2),
      estado: "Devuelto a Supply",
      revisadoEn: hace(1),
      motivoDevolucion: {
        campo: "m2Utiles",
        campoEtiqueta: "m² útiles",
        comentario: "Faltan m² útiles: sin ellos no podemos medir ni presupuestar suelos y pintura.",
      },
      camposPendientes: ["m² útiles"],
    },
    {
      id: "TR-0138",
      viviendaId: "VIV-1003",
      ficha: { ...porId("VIV-1003").ficha },
      creadoEn: hace(6),
      firmadoEn: hace(6),
      estado: "Aceptado",
      revisadoEn: hace(5),
    },
  ];

  return { version: VERSION_DATOS, viviendas, traspasos, modoPiloto: false };
}
