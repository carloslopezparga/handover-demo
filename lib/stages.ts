// CONFIGURACIÓN DE ETAPAS Y CAMPOS
// ---------------------------------------------------------------
// Este es el único sitio donde se decide qué campos tiene la ficha y
// cuáles son obligatorios para SALIR de cada etapa. Para añadir, quitar
// o hacer opcional un campo basta con tocar este archivo: el embudo, la
// ficha, el bloqueo de avance, el traspaso y las métricas lo leen de aquí.

import type { DefinicionCampo, DefinicionEtapa, EstadoVivienda, EtapaId } from "./types";

export const PARTIDAS_REFORMA = [
  { valor: "cocina", etiqueta: "Cocina" },
  { valor: "banos", etiqueta: "Baños" },
  { valor: "suelos", etiqueta: "Suelos" },
  { valor: "electricidad", etiqueta: "Electricidad" },
  { valor: "fontaneria", etiqueta: "Fontanería" },
  { valor: "pintura", etiqueta: "Pintura" },
  { valor: "carpinteria", etiqueta: "Carpintería" },
  { valor: "climatizacion", etiqueta: "Climatización" },
];

export const ETAPAS: DefinicionEtapa[] = [
  {
    id: "lead",
    nombre: "Lead",
    descripcion: "Datos básicos de la vivienda y del propietario.",
    campos: [
      { clave: "direccion", etiqueta: "Dirección", tipo: "texto", obligatorio: true, placeholder: "Calle, número, piso y puerta" },
      { clave: "barrio", etiqueta: "Barrio", tipo: "texto", obligatorio: false, placeholder: "Ej.: Tetuán" },
      { clave: "ciudad", etiqueta: "Ciudad", tipo: "texto", obligatorio: false, placeholder: "Ej.: Madrid" },
      {
        clave: "tipologia",
        etiqueta: "Tipología",
        tipo: "seleccion",
        obligatorio: true,
        opciones: [
          { valor: "piso", etiqueta: "Piso" },
          { valor: "atico", etiqueta: "Ático" },
          { valor: "bajo", etiqueta: "Bajo" },
          { valor: "duplex", etiqueta: "Dúplex" },
        ],
      },
      { clave: "precioPedido", etiqueta: "Precio pedido", tipo: "moneda", obligatorio: true, unidad: "€", min: 10000, max: 5000000, placeholder: "Ej.: 185.000" },
      {
        clave: "origenLead",
        etiqueta: "Origen del lead",
        tipo: "seleccion",
        obligatorio: true,
        opciones: [
          { valor: "portal", etiqueta: "Portal inmobiliario" },
          { valor: "agencia", etiqueta: "Agencia colaboradora" },
          { valor: "referido", etiqueta: "Referido" },
          { valor: "propietario", etiqueta: "Propietario directo" },
          { valor: "web", etiqueta: "Web propia" },
          { valor: "otro", etiqueta: "Otro" },
        ],
      },
      {
        clave: "contactoPropietario",
        etiqueta: "Contacto del propietario",
        tipo: "contacto",
        obligatorio: true,
        placeholder: "Nombre y teléfono o email",
        ayuda: "Incluye un teléfono o un email.",
      },
    ],
  },
  {
    id: "cualificacion",
    nombre: "Cualificación",
    descripcion: "¿Encaja como inversión para nuestros clientes?",
    campos: [
      { clave: "rentabilidadBruta", etiqueta: "Rentabilidad bruta estimada", tipo: "porcentaje", obligatorio: true, unidad: "%", min: 0.5, max: 30, placeholder: "Ej.: 6,2" },
      {
        clave: "encajeInversor",
        etiqueta: "Encaje con perfil de inversor",
        tipo: "siNoComentario",
        obligatorio: true,
        placeholder: "Por qué encaja (o no) con el perfil de inversor",
      },
    ],
  },
  {
    id: "visita",
    nombre: "Visita",
    descripcion: "Lo que el captador comprueba en la vivienda.",
    campos: [
      { clave: "m2Utiles", etiqueta: "m² útiles", tipo: "numero", obligatorio: true, unidad: "m²", min: 15, max: 600, noMayorQue: "m2Construidos" },
      { clave: "m2Construidos", etiqueta: "m² construidos", tipo: "numero", obligatorio: true, unidad: "m²", min: 15, max: 800 },
      { clave: "habitaciones", etiqueta: "Habitaciones", tipo: "entero", obligatorio: true, min: 0, max: 15 },
      { clave: "banos", etiqueta: "Baños", tipo: "entero", obligatorio: true, min: 1, max: 10 },
      {
        clave: "planta",
        etiqueta: "Planta",
        tipo: "seleccion",
        obligatorio: true,
        opciones: [
          { valor: "sotano", etiqueta: "Semisótano" },
          { valor: "bajo", etiqueta: "Bajo" },
          { valor: "entreplanta", etiqueta: "Entreplanta" },
          ...Array.from({ length: 9 }, (_, i) => ({ valor: String(i + 1), etiqueta: `${i + 1}ª` })),
          { valor: "10+", etiqueta: "10ª o superior" },
        ],
      },
      { clave: "ascensor", etiqueta: "Ascensor", tipo: "siNo", obligatorio: true },
      {
        clave: "estadoVivienda",
        etiqueta: "Estado de la vivienda",
        tipo: "valoracion",
        obligatorio: true,
        ayuda: "1 = para reformar entera · 5 = entrar a vivir",
      },
      { clave: "estadoInstalaciones", etiqueta: "Estado de instalaciones", tipo: "texto", obligatorio: true, placeholder: "Ej.: Electricidad antigua, sin boletín. Caldera de 2015." },
      { clave: "fotos", etiqueta: "Fotos", tipo: "fotos", obligatorio: true, minElementos: 3, ayuda: "Mínimo 3 fotos (pega la URL de cada imagen)." },
    ],
  },
  {
    id: "oferta",
    nombre: "Oferta",
    descripcion: "Alcance de la reforma y condiciones de compra.",
    campos: [
      {
        clave: "alcanceReforma",
        etiqueta: "Alcance estimado de la reforma",
        tipo: "multiSeleccion",
        obligatorio: true,
        opciones: PARTIDAS_REFORMA,
        minElementos: 1,
        ayuda: "Selecciona todas las partidas que habrá que reformar.",
      },
      { clave: "costeReforma", etiqueta: "Coste estimado de la reforma", tipo: "moneda", obligatorio: true, unidad: "€", min: 500, max: 500000, placeholder: "Ej.: 28.000" },
      { clave: "precioAcordado", etiqueta: "Precio acordado", tipo: "moneda", obligatorio: true, unidad: "€", min: 10000, max: 5000000 },
      { clave: "fechaPrevistaFirma", etiqueta: "Fecha prevista de firma", tipo: "fecha", obligatorio: true },
    ],
  },
  {
    id: "firma",
    nombre: "Firma",
    descripcion: "Todo lo que necesita el equipo de obra para empezar.",
    campos: [
      { clave: "fechaFirma", etiqueta: "Fecha de firma", tipo: "fecha", obligatorio: true },
      { clave: "accesoLlaves", etiqueta: "Acceso y llaves", tipo: "texto", obligatorio: true, placeholder: "Ej.: 2 juegos de llaves en la oficina de Supply" },
      {
        clave: "documentacion",
        etiqueta: "Documentación",
        tipo: "casillas",
        obligatorio: true,
        todasObligatorias: true,
        opciones: [
          { valor: "notaSimple", etiqueta: "Nota simple" },
          { valor: "contrato", etiqueta: "Contrato de compraventa" },
        ],
      },
      { clave: "contactoObra", etiqueta: "Contacto para la obra", tipo: "contacto", obligatorio: true, placeholder: "Nombre y teléfono o email", ayuda: "Incluye un teléfono o un email." },
    ],
  },
];

/** Columnas del embudo: las 5 etapas más las viviendas ya traspasadas. */
export const COLUMNAS_EMBUDO: { id: EstadoVivienda; nombre: string }[] = [
  ...ETAPAS.map((e) => ({ id: e.id as EstadoVivienda, nombre: e.nombre })),
  { id: "traspasada", nombre: "Traspasadas" },
];

export const NOMBRE_ESTADO: Record<EstadoVivienda, string> = {
  lead: "Lead",
  cualificacion: "Cualificación",
  visita: "Visita",
  oferta: "Oferta",
  firma: "Firma",
  traspasada: "Traspasada a reformas",
};

export function indiceEtapa(estado: EstadoVivienda): number {
  if (estado === "traspasada") return ETAPAS.length;
  return ETAPAS.findIndex((e) => e.id === estado);
}

export function getEtapa(id: EtapaId): DefinicionEtapa {
  const etapa = ETAPAS.find((e) => e.id === id);
  if (!etapa) throw new Error(`Etapa desconocida: ${id}`);
  return etapa;
}

/** Siguiente estado tras salir de una etapa (tras Firma, "traspasada"). */
export function siguienteEstado(id: EtapaId): EstadoVivienda {
  const i = indiceEtapa(id);
  return i + 1 < ETAPAS.length ? ETAPAS[i + 1].id : "traspasada";
}

export interface CampoConEtapa {
  campo: DefinicionCampo;
  etapa: DefinicionEtapa;
}

/** Todos los campos de la ficha, con la etapa a la que pertenecen. */
export const TODOS_LOS_CAMPOS: CampoConEtapa[] = ETAPAS.flatMap((etapa) => etapa.campos.map((campo) => ({ campo, etapa })));

export function buscarCampo(clave: string): CampoConEtapa | undefined {
  return TODOS_LOS_CAMPOS.find((c) => c.campo.clave === clave);
}
