# Guion de la demo (2 minutos)

**Mensaje central:** «Una ficha única que no deja avanzar si falta un dato crítico y que, al firmar, envía el traspaso a reformas sola. Así eliminamos el 1 de cada 4 traspasos incompletos.»

## Antes de la llamada (30 segundos)

- Abre la app desplegada (o `npm run dev`) en una ventana a pantalla completa.
- Pulsa **Reiniciar demo** (abajo en la barra lateral oscura, en «Opciones de la demo»; en móvil, en el menú «⋯» de la cabecera) para partir de los datos de ejemplo. El **Modo piloto** debe quedar desactivado.
- Si compartes pantalla en un monitor grande, sube el zoom del navegador al 110–125 %.

## Los 6 pasos

### 1. Abrir la vivienda en Oferta · ~15 s

**Haz:** en el **Embudo**, señala la columna **Oferta**. La primera tarjeta es **Calle de Bravo Murillo 241, 5º D** (Tetuán): progreso «2/4» (un trazo azul por campo obligatorio; cuando la ficha está completa, los trazos pasan a azul marino) y aviso «Faltan 2 campos». Haz clic en ella.

**Di:** «Este es el embudo de Supply. Cada tarjeta enseña qué parte de su ficha está completa. Esta vivienda está en Oferta y tiene datos pendientes.»

### 2. Ver que no deja avanzar y qué falta · ~20 s

**Haz:** en la ficha, señala a la izquierda la línea de tiempo de etapas (completadas con check marino, la actual en azul, las bloqueadas en gris) y a la derecha el panel «Siguiente paso»: la cifra grande «2», el botón **Avanzar a Firma** deshabilitado y la lista «Para avanzar falta»: *Alcance estimado de la reforma* y *Coste estimado de la reforma*.

**Di:** «El botón está bloqueado y dice exactamente qué falta: justo los dos datos que hoy le llegan vacíos a reformas.»

### 3. Completarlo · ~20 s

**Haz:** pulsa *Coste estimado de la reforma* en la lista: la página salta al campo y lo resalta un momento en azul. Selecciona las partidas **Cocina**, **Baños**, **Electricidad** y **Pintura**, y escribe `28.000` en el coste. Mientras completas, los trazos de progreso se rellenan y el contador baja; con el último dato, el panel cambia a «Todo listo» con un check. (Si quieres enseñar la validación en tiempo real, escribe antes `abc` y verás el error en rojo.)

**Di:** «Cada campo se valida mientras se escribe: números, mínimos de fotos, coherencia entre m² útiles y construidos...»

### 4. Avanzar y firmar · ~25 s

**Haz:** pulsa **Avanzar a Firma**. Rellena los 4 datos de firma:

- Fecha de firma: botón **Hoy**.
- Acceso y llaves: `Llaves en la oficina de Supply`.
- Documentación: marca **Nota simple** y **Contrato de compraventa**.
- Contacto para la obra: `Carmen Ruiz · 600 000 182`.

Pulsa **Firmar y enviar a reformas**. La página sube al inicio y aparece el estado de éxito con un check animado, «Traspaso enviado a reformas», junto a la notificación «Traspaso enviado a reformas · aviso enviado al coordinador». La vivienda pasa a «Traspasada».

**Di:** «Al firmar, el traspaso se crea solo, con una copia completa de la ficha. Nadie tiene que copiar datos a mano.»

### 5. Ver el traspaso en reformas · ~20 s

**Haz:** pulsa **Ver en la bandeja de Reformas** en la notificación (o **Reformas** en la barra lateral). Abre el traspaso nuevo, marcado como **Nuevo** y **Pendiente de revisión**. Enseña el «Resumen para obra» (alcance, coste, m², fotos) y pulsa **Aceptar**.

**Di:** «Reformas recibe la ficha completa en solo lectura. Si algo falla, puede devolverla a Supply indicando el campo y un comentario, y la vivienda vuelve a Firma con una alerta.» (Opcional: enseña en el Embudo la vivienda de Embajadores, devuelta por «faltan m² útiles».)

### 6. Ver el panel de métricas · ~20 s

**Haz:** abre **Métricas**. Las cifras cuentan hasta su valor y las barras crecen al entrar: deja un segundo antes de hablar.

**Di:** «Medimos si funciona. Fíjate en el desglose de traspasos completos a la primera: todos los que se firmaron con la ficha completa se aceptaron (2 de 2); el único devuelto se firmó en modo piloto saltándose un campo, los m² útiles. Además vemos devoluciones y motivos, fichas completas por etapa y el tiempo firma → traspaso: inmediato, frente a unos 2–3 días estimados antes.»

> El total (67 %) mezcla ambos casos y aún tiene muy pocos datos; la referencia de ≈75 % es la situación actual (1 de cada 4 incompleto). El desglose es lo que demuestra el efecto del bloqueo.

**Si vuelves al Embudo** (botón «Volver al embudo» del estado de éxito, o **Embudo** en la barra lateral) justo después de firmar, la tarjeta se desliza desde la columna Firma hasta **Traspasadas** y queda marcada como «Recién traspasada». Es un buen cierre visual para el paso 4 o para el final; solo ocurre la primera vez que se abre el embudo tras firmar (sin recargar la página entre medias).

## Si sobra tiempo: modo piloto

Activa **Modo piloto** en la barra lateral (en móvil, en el menú «⋯»), abre la vivienda de **Calle de la Oca** (Lead) y enseña que el botón pasa a ámbar: deja avanzar, pero registra los campos pendientes en el historial. «Para desplegarlo sin frenar al equipo: primero medimos, luego bloqueamos.»

## Plan B

- Si algo se ha tocado antes de la llamada: **Reiniciar demo**.
- Si falla la conexión: la app funciona igual en local con `npm run dev`.
