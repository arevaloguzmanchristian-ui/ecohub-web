# Bolivia EcoHub — criterios de implementación

## Relato y sistema visual

Concepto: **Desde nuestras ideas, crece el futuro de Bolivia.**

Orden: portada → qué es EcoHub → aprender, desarrollar y conectar → público y puntos de partida → sostenibilidad práctica → Kibo y Hubito → comunidad y territorio → preguntas frecuentes → participación.

El Azul Horizonte `#005A85` es el fondo principal. Verde Brote `#72C594` destaca crecimiento y mensajes grandes; Amarillo Sol `#FFE22E` señala únicamente la acción principal; Arena Suave `#EDEAE1` da descanso en navegación, propósito, agentes y preguntas frecuentes, y en el panel compacto de participación. La tinta auxiliar oscura `#153E50` sirve para texto legible sobre fondos claros; no sustituye los colores oficiales.

Composición de presentación de producto: cuadrícula editorial de hasta 1280 px, titulares, introducciones y grupos de contenido centrados, fotografías amplias y radios coherentes de 24–32 px. Los párrafos de lectura se limitan a unos 760 px. El propósito explica el ecosistema y reúne sus tres aportes sin tarjetas. La propuesta desarrolla cada etapa con dos párrafos y tres puntos. El público tiene una fotografía humana propia y tres situaciones editoriales siempre visibles. La sostenibilidad reúne viabilidad, personas y ambiente con cerámica, artesanas y cultivo, sin presentarlos como casos evaluados. La cerámica conserva su proporción 3:4 con `height: auto` y archivo 720×960, sin zoom ni recorte. El territorio reserva su panorámica y cierra con los cuatro valores explicados. Solo las FAQ usan acordeones. No se esconden las explicaciones principales durante el scroll.

La propuesta tiene padding vertical de 64 px en escritorio y 48 px en móvil, con 28 px entre encabezado y escenario. Se separan la descripción principal y la nota de convocatoria. Se mide el texto real: el pin solo se activa cuando el perfil más alto más 48 px cabe bajo el encabezado. Si no cabe, todos los capítulos permanecen en flujo vertical; no se reduce la letra para forzarlos. Se reevalúa tras cargar fuentes y redimensionar. En imágenes no fijadas se declara `height: auto`: los atributos HTML reservan proporción, pero no deben imponer alturas fijas que anulen el encuadre CSS. Se prioriza Montserrat Regular en lectura (16–19 px) y notas/pies de 13–14 px.

Los encuadres redondeados, personajes digitales y composiciones de conexión son propuestas de interfaz, no modificaciones del logotipo ni elementos oficiales añadidos a la identidad.

## Criterio tipográfico ante las inconsistencias del manual

- Core Rhino 65 Bold: titulares protagonistas y frases de marca, únicamente si está disponible con licencia web. No se ha recibido su archivo; no se descarga ni distribuye una copia.
- Montserrat Medium (500): alternativa provisional de esos titulares, títulos secundarios, navegación y botones.
- Montserrat Regular (400): subtítulos y textos sobre fotografía.
- Montserrat Light (300): recurso disponible para uso editorial puntual. En esta versión se prioriza Regular en los párrafos para conservar legibilidad.
- Montserrat Italic (400): énfasis editorial puntual; está disponible, sin sustituirla por DM Sans.

`--display` define la familia principal con fallback a Montserrat. Para incorporar Core Rhino, proporcionar el archivo WOFF2 autorizado y su licencia, declarar un `@font-face` local y mantener este fallback. No bloquear la portada mientras carga la fuente.

## Logotipo y convivencia institucional

Se conserva el recurso de marca ya disponible, derivado del manual original, sin redibujar, separar, girar ni animar sus elementos. La navegación usa un soporte Arena Suave limpio, proporciones originales, ancho mínimo de 180 px y un área de protección de 24 px alrededor del logo, superior a la altura de la «o» a los tamaños utilizados.

No se han recibido archivos institucionales oficiales para el co-branding con la Unión Europea. No se extraen emblemas diminutos de las aplicaciones de ejemplo, no se añaden socios y no se inventa una declaración de financiación. La aplicación final queda pendiente de esos recursos y de la confirmación de la declaración correspondiente.

## Imágenes y alcance documental

Se muestran **trece fotografías diferentes, sin reutilizarlas entre secciones**: panorámica de La Paz desde El Alto, centro de La Paz al atardecer, Illimani de noche, estudiantes de la UMSA, cerámica de Cotoca, aprendizaje en Concepción, otro intercambio de conocimientos en Concepción para el público objetivo, un bonsaísta en su vivero, colaboración en Lomerío, teleférico La Paz–El Alto, artesanas Uru, cultivo amazónico y un taller en Yacuiba. La fotografía adicional ya existía en el repositorio con sus créditos; no se incorpora una fuente sin licencia.

Kibo y Hubito proceden de los PNG entregados por el usuario en Descargas. Se sirven WebP de 800 y 400 px, sin recorte ni redibujo, preservando el fondo original de Kibo y la transparencia de Hubito. Los cuatro archivos suman unos 186 KB. Procedencia, límites de licencia y funciones propuestas: `assets/agents/README.md`. Los SVG provisionales anteriores quedan archivados, sin solicitarse desde la landing.

Fuentes, autores, descripciones y licencias: `assets/bolivia/credits.json`, también visibles en el pie. Las adaptaciones WebP, variantes de 640 px y encuadres conservan sus licencias de origen, incluidas CC BY-SA. No implican alianza ni participación de las personas u organizaciones retratadas en EcoHub.

La fotografía solicitada de jóvenes emprendedores en una terraza de La Paz no se ha proporcionado. La portada actual comienza con una panorámica real y continúa con dos fotografías de la ciudad y el Illimani; no pretende ser aquella escena ni un montaje fotográfico. Se retiraron la tarjeta superpuesta y el velo azul intenso. Solo queda una sombra neutra para mantener el contraste del texto, sin panel de color.

## Animación y rendimiento

- `sequence.js` es el único responsable de las escenas fijadas: portada y, solo si cabe su contenido, propuesta de tres capítulos.
- La portada comienza completa y legible, de borde a borde, sin tarjetas ni recuadros de color. Su primer scroll funciona como una galería de tres tomas: ciudad → atardecer → Illimani de noche. El contador, nombre de la fotografía y tres líneas discretas siguen la imagen realmente disponible.
- Dirección de movimiento: ninguna fotografía, personaje ni contenedor se gira o inclina. Solo se escalan imágenes dentro de sus marcos; los textos, botones y pies de foto no heredan el zoom. La portada llega hasta 1.08, limitado por los píxeles reales del recurso seleccionado en `srcset`, no por su tamaño natural corregido por densidad.
- Una foto base permanece siempre opaca. Las siguientes entran por fundido, sin ninguna máscara de apertura o cierre en la portada: las tres cubren la misma superficie. Se alternan acercamiento (hasta 1.08), alejamiento (hasta 1.055 → 1) y acercamiento discreto (hasta 1.02). La historia en escritorio tiene tres momentos: titular e introducción → «Una idea puede empezar contigo» → «Y crecer con otras personas». Textos e imágenes usan los mismos fundidos y la misma disponibilidad: una foto lenta no hace avanzar el mensaje por separado. La introducción se mantiene durante el 36% inicial. En móvil se mantiene la introducción estable y la galería sin pin; las escalas se limitan a 1.025 y el Illimani a 1.01. Su encuadre usa 52% horizontal y 10% vertical. La altura móvil es adaptable al contenido completo, sin ocultar texto. Todo revierte al subir, sin giros ni reproducción autónoma.
- La fotografía del propósito abre una máscara de 3% hasta sus bordes. Las demás fotos usan 1.04 → 1 en escritorio y 1.02 → 1 en móvil, también limitados por resolución.
- La propuesta usa un marco estable con tres capas fotográficas. Una imagen base siempre permanece opaca, las nuevas entran por fundido y el zoom máximo es 1.025. Texto, pie y contador se seleccionan desde el mismo progreso y la disponibilidad de la imagen decodificada: un solo texto visible, sin huecos ni superposiciones. Cada capítulo se mantiene al detener el scroll y las transiciones se revierten al subir.
- La portada solo se fija desde 1001 px de ancho y 640 px de alto. Los capítulos requieren además que el texto completo quepa. El recorrido adicional de portada es 1.25 alturas de ventana y el de capítulos 1.4 (mínimo 1000 px), repartido entre tres explicaciones más desarrolladas. En móvil, tablet, ventanas sin espacio suficiente, ahorro de datos o movimiento reducido se muestran bloques verticales completos.
- `main.js` gestiona navegación, agentes, enlaces profundos y parallax moderado. No duplica las secuencias.
- No hay canvas renderizado permanentemente, secuencias de cientos de archivos, scroll artificial ni cursores obligatorios.
- El zoom no tiene una reproducción autónoma: está vinculado al progreso del scroll. Las dos secuencias usan `scrub: true`, sin retraso temporal: una misma posición produce el mismo estado disponible en ambas direcciones.
- Los dos agentes conservan presencia conjunta: personaje seleccionado grande y secundario pequeño, junto a la descripción y los ejemplos, dentro de una composición centrada. El selector manual tiene contorno deslizante y contraste estable. Se reserva la altura del perfil más alto para evitar saltos. Se animan por separado el personaje (0.97 → 1 y 5 px), el nombre y las burbujas, sin escalar el panel ni usar rebotes. Las FAQ abren y cierran suavemente, con alternativa nativa sin JS y sin movimiento con preferencia reducida.
- Navegación con subrayado de ubicación y `aria-current="location"`; flechas de botones con desplazamiento de 3 px y títulos editoriales por líneas con movimientos breves, manteniendo su legibilidad.
- Imágenes con dimensiones, `srcset`, variantes pequeñas y carga diferida. La portada no espera fotografías inferiores. Las animaciones finitas se actualizan al desplazarse; no hay un bucle propio de renderizado.
- La panorámica dispone de variantes de 640, 1280 y 1920 px; la de 1280 px pesa unos 237 KB y evita descargar la versión grande en la portada vertical de móvil. Las cinco fotografías incorporadas para eliminar repeticiones se sirven como WebP y las inferiores cargan de forma diferida.
- Las dos fotos adicionales de portada no tienen `src` inicialmente: solo se solicitan al avanzar el scroll mientras la portada sigue visible. Sus versiones móviles de 1280 px suman aproximadamente 185 KB. Con ahorro de datos, 2G, movimiento reducido, sin GSAP o sin JavaScript no se solicitan y permanece la panorámica estática. Si una foto falla o aún no termina `decode()`, se conserva la base o la última disponible; el contador no anuncia una imagen que no esté lista. La carga actualiza disponibilidad y zoom, sin reconstruir los pins: las dimensiones ya están reservadas.
- Sin JavaScript se conservan el menú, todos los capítulos y situaciones, los dos perfiles con sus ejemplos, preguntas frecuentes y participación.

## Agentes y registro: estado real

Hubito y Kibo reemplazan a los personajes provisionales. Se proponen dos enfoques: Hubito, información de EcoHub y participación; Kibo, ideas y herramientas prácticas. No se afirma que estos roles sean definiciones oficiales. El selector cambia protagonismo, perfil y ejemplos; admite flechas, Inicio y Fin mediante pestañas accesibles. Se muestra una única aclaración principal: «Vista previa de la propuesta. Las conversaciones son ejemplos; el chat todavía no está disponible». No hay campo de chat, API de IA ni disponibilidad ficticia.

La única llamada principal es **Descubre cómo participar**, acompañada por el enlace editorial «Conoce el proyecto». El enlace oficial de registro no se ha recibido; no se simula una inscripción. `#registro` y `#participar` comparten destino y respetan el encabezado fijo. El cierre muestra el estado real fuera de las FAQ. Para habilitar inscripciones se necesita confirmar URL, requisitos, fechas y tratamiento de datos.

## Validación

Se probaron 320, 390, 768, 1024 y 1440 px; trece fotografías distintas sin repeticiones; portada con tres mensajes sincronizados, capas en orden y scroll reversible; carga diferida; cambios de tamaño; Kibo y Hubito con ratón y teclado; altura estable entre perfiles; nueve puntos de capítulos y tres situaciones visibles; composición centrada; ausencia de giros; texto/imagen/contador sincronizados; enlaces profundos; recursos fallidos; ausencia de GSAP/JavaScript; ahorro de datos y movimiento reducido. Se verifica que la fijación coincida con el espacio real disponible. Auditoría automática axe-core WCAG A/AA sin infracciones en los dos perfiles. Esto no sustituye una revisión de accesibilidad humana completa.

También se verificaron laptops 1366×650, 1280×720 y 1024×600: capítulos visibles en ambas direcciones, sin desbordamiento y acordeones funcionales. La prueba reproducible `tests/browser_smoke.py` usa Python y Playwright, sin añadir dependencias al sitio ni cambiar su tecnología.

### Regresión del bloque azul al regresar (16 de octubre de 2026)

Se reprodujo antes de editar: con `scroll-behavior: smooth` global, un `ScrollTrigger.refresh()` a 500 px calculaba el inicio de la portada en −500 en vez de 0. Tras redimensionar y entrar por `#proyecto`, llegó a −7044; al volver arriba el escenario conservaba la traslación final del pin y quedaba fuera de pantalla, exponiendo el fondo azul. No era un fallo de z-index ni un fundido que ocultara la foto base. `main.js` tampoco anima las imágenes de portada.

Se aisló comparando el mismo refresco con scroll global `smooth` y `auto`. La corrección usa scroll nativo inmediato para que la medición/restauración del pin sea síncrona, y elimina los refrescos globales innecesarios por carga de imágenes de la galería. No se cambia el fondo ni el orden de capas para esconder el hueco. Se mantienen los refrescos necesarios para cambios reales de geometría.

`tests/scroll_regression.py` comprueba cobertura geométrica real de la portada, no solo opacidad: recorridos completos lentos y rápidos repetidos, entradas `#proyecto`/`#participar`, enlace del pie al inicio, refrescos forzados a 500 y 2200 px, resize desde abajo, movimiento reducido, equivalencia de estados en ambas direcciones, ausencia de máscaras y cerámica 3:4 siempre visible. Incluye carga retenida de las dos fotos y decodificación retrasada del Illimani: la anterior permanece visible hasta estar lista. Verificado en Chromium a 1440×900, 1366×650, 1024×600, 390×844 y 320×740. Ejecutar las pruebas de navegador secuencialmente, no en paralelo.
