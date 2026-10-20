# Cómo funciona (explicado sin tecnicismos)

Este documento es para quien no programa. Explica qué hay en cada carpeta, cómo viajan los datos, dónde se decide qué campos son obligatorios y qué haría falta para usarlo de verdad con una base de datos (Supabase) y con el módulo de Reformas.

## La idea en una frase

Cada vivienda tiene **una sola ficha** que se va rellenando etapa a etapa. Para pasar a la siguiente etapa, la ficha tiene que tener completos los **campos obligatorios** de la etapa actual. Al firmar, se hace una **copia de la ficha** y se envía sola a reformas.

## Qué hay en cada carpeta

```
app/          Las pantallas (cada carpeta es una dirección web)
components/   Las piezas visuales que se reutilizan en las pantallas
lib/          El "cerebro": reglas, datos y memoria de la app
public/fotos  Imágenes de ejemplo neutras para las fichas
```

### `app/` · las pantallas

| Archivo | Pantalla |
| --- | --- |
| `app/page.tsx` | **Embudo de Supply** (la portada): columnas por etapa con las tarjetas de cada vivienda. |
| `app/vivienda/[id]/page.tsx` | **Ficha de vivienda**: etapas, campos y botón de avanzar o firmar. |
| `app/reformas/page.tsx` | **Bandeja de Reformas**: lista de traspasos. |
| `app/reformas/[id]/page.tsx` | **Detalle de un traspaso**: ficha en solo lectura y botones Aceptar / Devolver. |
| `app/metricas/page.tsx` | **Panel de métricas**. |
| `app/layout.tsx` | El "marco" común de todas las pantallas (barra lateral o cabecera en móvil, notificaciones) y las fuentes. |
| `app/globals.css` | La paleta (tinta, grises y azul) como tokens con nombre por significado, y las animaciones. |
| `app/not-found.tsx`, `app/error.tsx` | Mensajes amables si una página no existe o algo falla. |

### `components/` · las piezas

- `AppShell.tsx`: la barra lateral oscura (en móvil, una cabecera oscura) con la marca, el menú, el interruptor de **Modo piloto** y el botón **Reiniciar demo**.
- `ui.tsx`: botones, estados con punto de color (o check si está completo), progreso por segmentos, check de éxito animado, estados vacíos (con ilustración) y esqueletos de carga. Así todo tiene el mismo aspecto.
- `movimiento.ts`: respeta la opción «reducir movimiento» del sistema y recuerda qué vivienda se acaba de firmar para animar su llegada a «Traspasadas».
- `Notificaciones.tsx`: los avisos que aparecen abajo (p. ej. «Traspaso enviado a reformas»).
- `Dialogo.tsx`: las ventanas emergentes (nueva vivienda, devolver a Supply, reiniciar).
- `embudo/`: la tarjeta de cada vivienda y el formulario de «Nueva vivienda».
- `ficha/`: todo lo de la ficha: cada tipo de campo (`CampoFicha.tsx`), las fotos (`CampoFotos.tsx`), los nodos de la línea de tiempo de etapas (`PasosEtapas.tsx`), cada bloque de etapa (`SeccionEtapa.tsx`), el panel «Siguiente paso» con la lista de lo que falta (`PanelAvance.tsx`) y el historial.
- `reformas/`: la etiqueta de estado del traspaso, la ficha en solo lectura y la ventana «Devolver a Supply».

### `lib/` · el cerebro

| Archivo | Qué hace |
| --- | --- |
| `types.ts` | Define qué es una **Vivienda**, una **Ficha** y un **Traspaso** (qué datos tiene cada uno). |
| `stages.ts` | **La configuración**: las 5 etapas y los campos de cada una, y cuáles son obligatorios. |
| `validation.ts` | Las reglas: si un campo está completo, si un número es válido, qué falta para avanzar. |
| `seed.ts` | Los **datos de ejemplo**: 8 viviendas ficticias en Madrid y 2 traspasos. |
| `store.tsx` | La **memoria** de la app y las acciones (crear vivienda, avanzar, firmar, aceptar, devolver...). Lo guarda todo en el navegador. |
| `metrics.ts` | Calcula los números del panel de métricas. |
| `format.ts` | Muestra importes, números y fechas al estilo español (185.000 €, 6,4 %, 19 oct 2026). |

## Cómo viajan los datos

```
 seed.ts (datos de ejemplo)
        │  la primera vez
        ▼
 store.tsx  ◄──────────── guarda/lee ────────────►  localStorage del navegador
   (memoria + acciones)                               (sobrevive a recargar)
        │  las pantallas leen de aquí
        ▼
 Embudo · Ficha · Reformas · Métricas
        │  la persona pulsa algo (escribe un campo, «Avanzar», «Firmar», «Aceptar»...)
        ▼
 acción del store  ──►  validation.ts decide si se puede  ──►  se guarda  ──►  todas las pantallas se actualizan
```

Ejemplo, al pulsar **Firmar y enviar a reformas**:

1. El store pregunta a `validation.ts` qué campos obligatorios faltan (de Firma y de las etapas anteriores).
2. Si falta algo y el modo piloto está apagado, no hace nada (por eso el botón aparece bloqueado y con la lista).
3. Si está todo (o el modo piloto está encendido), la vivienda pasa a «Traspasada», se apunta en su historial y se crea un **Traspaso** con una copia de la ficha, en estado «Pendiente de revisión».
4. Aparece la notificación y el traspaso ya está en la bandeja de Reformas.

Si Reformas pulsa **Devolver a Supply**, el traspaso queda como «Devuelto a Supply» con el campo y el comentario, y la vivienda vuelve a **Firma** con una alerta destacada en azul. No se puede volver a firmar hasta que Supply corrija ese campo (o lo marque como revisado).

## Dónde se configuran los campos obligatorios

Todo está en **`lib/stages.ts`**. Cada campo se describe así:

```ts
{ clave: "costeReforma", etiqueta: "Coste estimado de la reforma", tipo: "moneda", obligatorio: true, unidad: "€", min: 500, max: 500000 }
```

- Para que un campo **deje de ser obligatorio**: cambia `obligatorio: true` por `obligatorio: false`.
- Para **añadir un campo**: añade una línea como esa en la etapa que toque. Aparecerá en la ficha, se validará, contará en el progreso de la etapa y bloqueará el avance si es obligatorio. No hay que tocar nada más.
- Para **moverlo de etapa**: cámbialo de lista.
- Tipos disponibles: texto, texto largo, contacto (exige teléfono o email), número, entero, moneda, porcentaje, selección, sí/no, sí/no con comentario, valoración 1–5, fecha, multiselección, casillas y fotos.

La regla de bloqueo es: **para salir de una etapa, tienen que estar completos los obligatorios de esa etapa y de todas las anteriores.**

## Modo piloto

Es un interruptor en la barra lateral (en móvil, en el menú «⋯» de la cabecera). Encendido, la ficha **avisa en ámbar** de lo que falta pero **deja avanzar**, y apunta en el historial qué campos estaban pendientes. Sirve para introducir la herramienta sin frenar al equipo el primer día y medir cuánto se usa antes de activar el bloqueo real. Por defecto está apagado.

## Cómo se llevaría a producción

### Base de datos con Supabase

Hoy los datos viven en el navegador. En producción se guardarían en [Supabase](https://supabase.com) (una base de datos en la nube con usuarios y permisos):

| Tabla | Contenido |
| --- | --- |
| `viviendas` | id, etapa actual, ficha (columna JSON con todos los campos), fechas, captador responsable. |
| `historial_etapas` | Cada cambio de etapa: vivienda, de qué etapa a cuál, fecha, persona, campos pendientes. |
| `traspasos` | id, vivienda, copia de la ficha (JSON), estado, fecha, motivo de devolución. |
| `config_campos` (opcional) | La misma configuración de `stages.ts`, para que Producto pueda cambiar campos obligatorios sin tocar código. |

Cambios necesarios:

1. **Las acciones del store** (`lib/store.tsx`) pasan a leer y escribir en Supabase en lugar de en `localStorage`. Las pantallas no cambian, porque solo hablan con el store.
2. **La validación se repite en el servidor** (una función de Supabase o una regla en la base de datos) para que nadie pueda saltarse el bloqueo desde otra herramienta. El código de `validation.ts` se puede reutilizar tal cual.
3. **Fotos**: se suben a Supabase Storage desde el móvil del captador en lugar de pegar URLs.
4. **Usuarios y permisos**: Supply edita fichas; Reformas solo lee fichas y cambia el estado de los traspasos.

### Conexión con el módulo de Reformas

Al firmar, la base de datos crea una fila en `traspasos`. Un **webhook** (un aviso automático de un sistema a otro) la envía al módulo de Reformas:

```
POST https://reformas.interno/api/traspasos
{
  "traspasoId": "TR-0142",
  "viviendaId": "VIV-1017",
  "firmadoEn": "2026-10-19T17:53:00Z",
  "ficha": { "direccion": "Calle de Bravo Murillo 241, 5º D", "m2Utiles": "68", "alcanceReforma": ["cocina", "banos"], ... }
}
```

- Con Supabase se hace con un **Database Webhook** o una **Edge Function** que salta al insertar un traspaso.
- El módulo de Reformas contesta con su propia llamada cuando acepta o devuelve (`PATCH /traspasos/TR-0142` con estado y motivo), y eso actualiza la vivienda en Supply.
- El mismo evento puede **avisar al coordinador** de obra por email o Slack.
- Detalles para que sea fiable: el id del traspaso evita duplicados si el aviso se repite, y si el módulo de Reformas no responde se reintenta automáticamente.

## Glosario rápido

- **Ficha**: todos los datos de una vivienda, agrupados por etapa.
- **Campo obligatorio**: dato sin el que no se puede salir de una etapa.
- **Traspaso**: el paquete que recibe Reformas al firmar, con una copia congelada de la ficha.
- **Devolución**: Reformas devuelve el traspaso indicando qué falta o qué está mal.
- **localStorage**: un pequeño almacén dentro del navegador; por eso cada navegador tiene su propia copia de la demo.
