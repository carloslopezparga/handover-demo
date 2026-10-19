// Tipos del dominio. Todo el prototipo gira alrededor de dos entidades:
// la Vivienda (con su ficha única) y el Traspaso a reformas que se genera al firmar.

/** Etapas del embudo de Supply, en orden. */
export type EtapaId = "lead" | "cualificacion" | "visita" | "oferta" | "firma";

/** Estado de la vivienda: una etapa del embudo o ya traspasada a reformas. */
export type EstadoVivienda = EtapaId | "traspasada";

/** Tipos de campo que sabe pintar y validar la ficha. */
export type TipoCampo =
  | "texto" // texto corto
  | "textoLargo" // texto multilínea
  | "contacto" // texto que debe incluir un teléfono o un email
  | "numero" // número (admite decimales con coma)
  | "entero" // número entero
  | "moneda" // importe en euros
  | "porcentaje" // porcentaje
  | "seleccion" // una opción de una lista
  | "siNo" // sí / no
  | "siNoComentario" // sí / no + comentario obligatorio
  | "valoracion" // escala de 1 a 5
  | "fecha"
  | "multiSeleccion" // varias opciones de una lista (p. ej. partidas de reforma)
  | "casillas" // casillas de verificación (p. ej. documentación)
  | "fotos"; // lista de URLs de imagen

export interface OpcionCampo {
  valor: string;
  etiqueta: string;
}

/** Definición de un campo de la ficha. Se configura en `lib/stages.ts`. */
export interface DefinicionCampo {
  clave: string;
  etiqueta: string;
  tipo: TipoCampo;
  /** Si es true, el campo es obligatorio para poder SALIR de su etapa. */
  obligatorio: boolean;
  ayuda?: string;
  placeholder?: string;
  /** Unidad que se muestra junto al input (€, %, m²...). */
  unidad?: string;
  opciones?: OpcionCampo[];
  /** Límites para campos numéricos. */
  min?: number;
  max?: number;
  /** Mínimo de elementos para fotos o multiselección. */
  minElementos?: number;
  /** En casillas: si es true, hay que marcar todas. */
  todasObligatorias?: boolean;
  /** El valor no puede ser mayor que el de este otro campo (p. ej. m² útiles ≤ m² construidos). */
  noMayorQue?: string;
}

/** Definición de una etapa del embudo. */
export interface DefinicionEtapa {
  id: EtapaId;
  nombre: string;
  descripcion: string;
  campos: DefinicionCampo[];
}

export interface RespuestaSiNo {
  respuesta: "si" | "no" | "";
  comentario: string;
}

/** Valor que puede tomar cualquier campo de la ficha. */
export type ValorCampo = string | number | string[] | RespuestaSiNo | null;

/** La ficha: un diccionario clave de campo → valor. */
export type Ficha = Record<string, ValorCampo>;

/** Entrada del historial de cambios de etapa. */
export interface EventoHistorial {
  id: string;
  fecha: string; // ISO
  desde: EstadoVivienda | null;
  hasta: EstadoVivienda;
  nota?: string;
  /** Campos que faltaban si se avanzó en modo piloto. */
  camposPendientes?: string[];
}

/** Devolución activa desde Reformas: la vivienda vuelve a Firma con este motivo. */
export interface DevolucionActiva {
  traspasoId: string;
  campo: string;
  campoEtiqueta: string;
  comentario: string;
  fecha: string; // ISO
  /** Valor del campo cuando se devolvió, para detectar si Supply lo ha corregido. */
  valorAlDevolver: string;
  revisada: boolean;
}

export interface Vivienda {
  id: string;
  etapa: EstadoVivienda;
  ficha: Ficha;
  creadaEn: string; // ISO
  historial: EventoHistorial[];
  devolucion?: DevolucionActiva;
}

export type EstadoTraspaso = "Pendiente de revisión" | "Aceptado" | "Devuelto a Supply";

export interface MotivoDevolucion {
  campo: string;
  campoEtiqueta: string;
  comentario: string;
}

export interface Traspaso {
  id: string;
  viviendaId: string;
  /** Copia completa de la ficha en el momento de firmar (no cambia aunque luego se edite la vivienda). */
  ficha: Ficha;
  creadoEn: string; // ISO
  /** Momento en que se pulsó "Firmar y enviar a reformas". */
  firmadoEn: string; // ISO
  estado: EstadoTraspaso;
  revisadoEn?: string; // ISO
  motivoDevolucion?: MotivoDevolucion;
  /** Campos que faltaban al firmar (solo posible en modo piloto). */
  camposPendientes?: string[];
}

/** Estado global de la demo, que se guarda en localStorage. */
export interface EstadoDemo {
  version: number;
  viviendas: Vivienda[];
  traspasos: Traspaso[];
  modoPiloto: boolean;
}
