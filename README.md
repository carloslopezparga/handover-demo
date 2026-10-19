# Vistral · Supply (prototipo)

Prototipo funcional de una **ficha de vivienda única** para el equipo de Supply de una proptech de inversión inmobiliaria.

**El problema:** hoy Supply recoge los datos de cada vivienda en un CRM ligero y en hojas de cálculo, y el traspaso a reformas se hace a mano. En 1 de cada 4 casos llega a reformas con datos incompletos (metros, estado, alcance de la reforma), lo que provoca idas y vueltas, revisitas y retrasos.

**La propuesta:** una ficha con campos obligatorios por etapa (Lead → Cualificación → Visita → Oferta → Firma) que **no deja avanzar ni firmar si falta un dato crítico** y que, al firmar, **genera automáticamente el traspaso a reformas** (módulo Reno).

## Qué incluye

| Pantalla | Ruta | Para qué sirve |
| --- | --- | --- |
| Embudo de Supply | `/` | Kanban con una columna por etapa (más «Traspasadas»), progreso de cada ficha y aviso si faltan campos. Botón «Nueva vivienda». |
| Ficha de vivienda | `/vivienda/[id]` | Etapas a la izquierda, campos validados en tiempo real en el centro y botón «Avanzar a…» / «Firmar y enviar a reformas» con la lista exacta de lo que falta. |
| Bandeja de reformas (Reno) | `/reformas` | Traspasos con su estado: pendiente de revisión, aceptado o devuelto a Supply. |
| Detalle del traspaso | `/reformas/[id]` | Ficha completa en solo lectura (fotos y alcance incluidos). Acciones «Aceptar» y «Devolver a Supply». |
| Panel de métricas | `/metricas` | % de traspasos completos a la primera, devoluciones y motivos, viviendas por etapa, % de fichas completas y tiempo firma → traspaso. |

Además: interruptor global **Modo piloto** (avisa en amarillo en lugar de bloquear y registra los avances con campos pendientes) y botón **Reiniciar demo** para restaurar los datos de ejemplo.

## Arrancarlo en local

Requisitos: [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>.

Otros comandos útiles:

```bash
npm run build   # compila la versión de producción (comprueba tipos)
npm run start   # sirve la versión compilada
npm run lint    # revisa el código con ESLint
```

## Desplegarlo en Vercel

No hace falta ninguna configuración ni variable de entorno.

**Opción A · desde la web**

1. Entra en [vercel.com/new](https://vercel.com/new) e importa este repositorio de GitHub.
2. Vercel detecta Next.js automáticamente. Deja los valores por defecto y pulsa **Deploy**.
3. Cada push a la rama principal vuelve a desplegar la app.

**Opción B · desde la terminal**

```bash
npx vercel        # primera vez: enlaza el proyecto y crea un despliegue de prueba
npx vercel --prod # despliegue de producción
```

## Cómo guarda los datos

No hay backend ni base de datos: los datos de ejemplo viven en memoria y se guardan en el `localStorage` del navegador, así que la demo sobrevive a una recarga. Cada navegador tiene su propia copia. «Reiniciar demo» vuelve al estado inicial.

## Más documentación

- [`COMO-FUNCIONA.md`](./COMO-FUNCIONA.md): explicación en lenguaje sencillo de cada carpeta, cómo fluyen los datos, dónde se configuran los campos obligatorios y cómo se conectaría con Supabase y con Reno.
- [`DEMO.md`](./DEMO.md): guion de la demo en 6 pasos.

## Tecnología

Next.js (App Router) · TypeScript · Tailwind CSS · iconos de Lucide. Todas las marcas, direcciones y personas de los datos de ejemplo son ficticias.
