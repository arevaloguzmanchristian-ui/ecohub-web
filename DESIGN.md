# Bolivia EcoHub — criterios de implementación

## Relato y sistema visual

Concepto: **Desde nuestras ideas, crece el futuro de Bolivia.**

Orden: portada → qué es EcoHub → aprender, desarrollar y conectar → público y puntos de partida → sostenibilidad práctica → Kibo y Hubito → comunidad y territorio → preguntas frecuentes → participación.

El Azul Horizonte `#005A85` es el fondo principal. Verde Brote `#72C594` destaca crecimiento y mensajes grandes; Amarillo Sol `#FFE22E` señala únicamente la acción principal; Arena Suave `#EDEAE1` da descanso en navegación, propósito, agentes y preguntas frecuentes, y en el panel compacto de participación. La tinta auxiliar oscura `#153E50` sirve para texto legible sobre fondos claros; no sustituye los colores oficiales.

Composición de presentación de producto: cuadrícula de hasta 1280 px, con texto y fotografía simultáneos. Portada alineada a la izquierda en sus tres escenas, cada una con titular y párrafo; sin repetir la marca dentro. Proyecto en dos columnas equilibradas (48/48 y 4% de separación), explicación y tres cierres compactos a la izquierda, colaboración a la derecha. Público con tres tarjetas compactas y foto grande; se conserva el rango 16–28 años sin presentarlo como impacto. Sostenibilidad como galería editorial de tres proporciones: cerámica vertical, artesanas y cultivo, sin casos evaluados inventados. La cerámica conserva su proporción 3:4 con `height: auto`, sin zoom ni recorte. Territorio a sangre, sin radios, con texto y foto juntos, y continuación fotográfica para comunidad/valores. No se fuerza `100vh` a todas las secciones: el contenido largo y los móviles permanecen en flujo automático.

La propuesta fija `.chapters__frame`, no solo la imagen: encabezado compacto, descripción, nota, contador, fotografía, explicación y puntos permanecen juntos. Se mide el capítulo más alto más 24 px, además de encabezado, márgenes y pie. Solo se fija si todo cabe bajo el encabezado de navegación. El espacio restante se asigna a la imagen, no a un vacío inferior. El recorrido adicional equivale a 1.65 veces la altura del escenario. Se libera justo al final del frame y conserva únicamente el padding normal de sección. La fila de la cuadrícula usa `minmax(0,1fr)` para que el tamaño intrínseco de las fotos originales ocultas no empuje el texto sobre el pie. En laptops bajas se muestran tres capítulos completos en vertical, sin reducir la letra ni crear scroll interno. Se reevalúa al cargar fuentes y redimensionar.

Los encuadres redondeados, personajes digitales y composiciones de conexión son propuestas de interfaz, no modificaciones del logotipo ni elementos oficiales añadidos a la identidad.

## Criterio tipográfico ante las inconsistencias del manual

- Core Rhino 65 Bold: titulares protagonistas y frases de marca, únicamente si está disponible con licencia web. No se ha recibido su archivo; no se descarga ni distribuye una copia.
- Montserrat Medium (500): alternativa provisional de esos titulares, títulos secundarios, navegación y botones.
- Montserrat Regular (400): subtítulos y textos sobre fotografía.
- Montserrat Light (300): recurso disponible para uso editorial puntual. En esta versión se prioriza Regular en los párrafos para conservar legibilidad.
- Montserrat Italic (400): énfasis editorial puntual; está disponible, sin sustituirla por DM Sans.

Jerarquía actual: portada 52–80 px en escritorio, títulos 36–56 px, subtítulos 24–32 px, lectura 16–18 px y notas 13–14 px. Las tarjetas compactas usan títulos de 18 px. Las palabras destacadas no repiten siempre la última posición; el verde se reserva para fondos oscuros y tamaños con contraste suficiente.

`--display` define la familia principal con fallback a Montserrat. Para incorporar Core Rhino, proporcionar el archivo WOFF2 autorizado y su licencia, declarar un `@font-face` local y mantener este fallback. No bloquear la portada mientras carga la fuente.

## Logotipo y convivencia institucional

Se conserva el recurso de marca ya disponible, derivado del manual original, sin redibujar, separar, girar ni animar sus elementos. La navegación usa un soporte Arena Suave limpio, proporciones originales, ancho mínimo de 180 px y un área de protección de 24 px alrededor del logo, superior a la altura de la «o» a los tamaños utilizados.

No se han recibido archivos institucionales oficiales para el co-branding con la Unión Europea. No se extraen emblemas diminutos de las aplicaciones de ejemplo, no se añaden socios y no se inventa una declaración de financiación. La aplicación final queda pendiente de esos recursos y de la confirmación de la declaración correspondiente.

## Imágenes y alcance documental

Se muestran **catorce fotografías diferentes, sin reutilizarlas entre secciones**: las trece escenas previas más una nueva fotografía de dos generaciones de tejedoras tacana en Tumupasa, provincia Abel Iturralde, La Paz. Autor N1ny4 t, CC BY-SA 4.0; autoría, ubicación y licencia verificadas mediante `imageinfo/extmetadata` de Wikimedia Commons. Derivados WebP de 1600 y 640 px, sin recortar rostros ni el instrumento de tejido. Se incorpora al relato de conocimientos compartidos, no como actividad ni alianza EcoHub. Se conserva la buena fotografía existente; no se añaden paisajes solo para aumentar cantidad.

Kibo y Hubito proceden de los PNG entregados por el usuario en Descargas. Se sirven WebP de 800 y 400 px, sin recorte ni redibujo, preservando el fondo original de Kibo y la transparencia de Hubito. Los cuatro archivos suman unos 186 KB. Procedencia, límites de licencia y funciones propuestas: `assets/agents/README.md`. Los SVG provisionales anteriores quedan archivados, sin solicitarse desde la landing.

Fuentes, autores, descripciones y licencias: `assets/bolivia/credits.json`, también visibles en el pie. Las adaptaciones WebP, variantes de 640 px y encuadres conservan sus licencias de origen, incluidas CC BY-SA. No implican alianza ni participación de las personas u organizaciones retratadas en EcoHub.

La fotografía solicitada de jóvenes emprendedores en una terraza de La Paz no se ha proporcionado. La portada actual comienza con una panorámica real y continúa con dos fotografías de la ciudad y el Illimani; no pretende ser aquella escena ni un montaje fotográfico. Se retiraron la tarjeta superpuesta y el velo azul intenso. Solo queda una sombra neutra para mantener el contraste del texto, sin panel de color.

## Animación y rendimiento

- `sequence.js` es el único responsable de las escenas fijadas: portada y, solo si cabe su contenido, propuesta de tres capítulos.
- La portada comienza completa y legible, de borde a borde, sin tarjetas ni recuadros de color. Su primer scroll funciona como una galería de tres tomas: ciudad → atardecer → Illimani de noche. El contador, nombre de la fotografía y tres líneas discretas siguen la imagen realmente disponible.
- Dirección de movimiento: ninguna fotografía, personaje ni contenedor se gira o inclina. Solo se escalan imágenes dentro de sus marcos; los textos, botones y pies de foto no heredan el zoom. La portada llega hasta 1.08, limitado por los píxeles reales del recurso seleccionado en `srcset`, no por su tamaño natural corregido por densidad.
- Una foto base permanece siempre opaca. Las siguientes entran por fundido, sin ninguna máscara de apertura o cierre en la portada: las tres cubren la misma superficie. Se alternan acercamiento (hasta 1.08), alejamiento (hasta 1.055 → 1) y acercamiento discreto (hasta 1.02). La historia en escritorio tiene tres momentos: titular e introducción → «Una idea puede empezar contigo» → «Y crecer con otras personas». Textos e imágenes usan los mismos fundidos y la misma disponibilidad: una foto lenta no hace avanzar el mensaje por separado. La introducción se mantiene durante el 36% inicial. En móvil se mantiene la introducción estable y la galería sin pin; las escalas se limitan a 1.025 y el Illimani a 1.01. Su encuadre usa 52% horizontal y 10% vertical. La altura móvil es adaptable al contenido completo, sin ocultar texto. Todo revierte al subir, sin giros ni reproducción autónoma.
- Proyecto: revelado de títulos con una máscara por línea y desplazamiento corto de 24 px; público: variación de 16 px y entrada de tarjetas de 10 px. Se ejecutan una vez y quedan estables, no desaparecen al retroceder. Las máscaras incluyen espacio para acentos y descendentes. Se retiraron el zoom genérico de fotografías secundarias y la máscara anterior del propósito para evitar duplicaciones y dar un comportamiento propio a cada sección.
- La propuesta usa un marco estable con tres capas fotográficas. Una imagen base siempre permanece opaca, las nuevas entran por fundido y el zoom máximo es 1.025. Texto, pie y contador se seleccionan desde el mismo progreso y la disponibilidad de la imagen decodificada: un solo texto visible, sin huecos ni superposiciones. Cada capítulo se mantiene al detener el scroll y las transiciones se revierten al subir.
- La portada solo se fija desde 1001 px de ancho y 640 px de alto, durante 1.25 alturas adicionales de ventana. Los capítulos requieren además que quepan encabezado y texto completo. En móvil, tablet, ventanas sin espacio suficiente, ahorro de datos o movimiento reducido se muestran bloques verticales completos.
- `main.js` gestiona navegación, selector, modal, títulos y tarjetas. `sequence.js` controla fotografías de portada, capítulos y cortina; no comparten propiedades sobre un mismo elemento.
- No hay canvas renderizado permanentemente, secuencias de cientos de archivos, scroll artificial ni cursores obligatorios.
- El zoom no tiene una reproducción autónoma: está vinculado al progreso del scroll. Las dos secuencias usan `scrub: true`, sin retraso temporal: una misma posición produce el mismo estado disponible en ambas direcciones.
- Agentes: solo un personaje visible; el otro queda `hidden` e `inert`, con su panel fuera del teclado. Kibo usa un tamaño de presentación menor que Hubito, sin alterar sus proporciones. El selector oculta el anterior antes de mostrar el siguiente mediante fundido y zoom 0.96 → 1, sin superposición. Se reserva la altura del perfil más alto. Los ejemplos se abren manualmente en un `dialog` nativo, con cierre por botón/Escape, foco contenido y devolución al enlace de origen. No se abren durante el scroll. Sin JS o sin soporte de dialog se conservan los ejemplos como contenido enlazable. Las FAQ usan acordeones nativos mejorados, con animación discreta y alternativa sin JS.
- Territorio: fotografía panorámica a sangre y texto integrado. Una capa Arena acotada a esa escena se retira hacia arriba; solo cubre la porción que ha entrado al viewport, con un máximo de 120 px para no producir una pantalla Arena vacía antes de mostrar la foto. No hay fondo fijo global, pin adicional ni solapamiento de vecinos. La cortina espera la decodificación de la imagen y revierte con el mismo progreso. En móvil, movimiento reducido, ahorro de datos o recursos fallidos se muestra la composición normal sin cortina. La continuación conserva otra fotografía junto a las frases y los cuatro valores.
- Navegación con subrayado de ubicación y `aria-current="location"`; flechas de botones con desplazamiento de 3 px y títulos editoriales por líneas con movimientos breves, manteniendo su legibilidad.
- Imágenes con dimensiones, `srcset`, variantes pequeñas y carga diferida. La portada no espera fotografías inferiores. Las animaciones finitas se actualizan al desplazarse; no hay un bucle propio de renderizado.
- La panorámica dispone de variantes de 640, 1280 y 1920 px; la de 1280 px pesa unos 237 KB y evita descargar la versión grande en la portada vertical de móvil. Las cinco fotografías incorporadas para eliminar repeticiones se sirven como WebP y las inferiores cargan de forma diferida.
- Las dos fotos adicionales de portada no tienen `src` inicialmente: solo se solicitan al avanzar el scroll mientras la portada sigue visible. Sus versiones móviles de 1280 px suman aproximadamente 185 KB. Con ahorro de datos, 2G, movimiento reducido, sin GSAP o sin JavaScript no se solicitan y permanece la panorámica estática. Si una foto falla o aún no termina `decode()`, se conserva la base o la última disponible; el contador no anuncia una imagen que no esté lista. La carga actualiza disponibilidad y zoom, sin reconstruir los pins: las dimensiones ya están reservadas.
- Sin JavaScript se conservan el menú, todos los capítulos y situaciones, los dos perfiles con sus ejemplos, preguntas frecuentes y participación.

## Agentes y registro: estado real

Roles actualizados según la definición del equipo: **Kibo**, cercano a la persona individual, orientación sobre EcoHub y primeros pasos; **Hubito**, empresas y emprendimientos, organización, comunicación y desarrollo del negocio. Sustituyen la distribución anterior. El selector Kibo/Hubito admite flechas, Inicio y Fin. Cada panel incluye nombre, especialidad, presentación y «Ver ejemplo». La aclaración de vista previa permanece visible y se reitera dentro del modal para dar contexto accesible. No hay campo de chat, API de IA, disponibilidad ficticia ni afirmación de capacidades operativas.

La única llamada principal es **Descubre cómo participar**, fondo amarillo y texto azul. «Conoce el proyecto» y «Seguir explorando» tienen fondo azul y texto blanco, funcionan desde el principio y nunca se deshabilitan por scroll. El último recibe un borde verde y un pequeño desplazamiento de flecha al cerrar la secuencia. El enlace oficial de registro no se ha recibido; no se simula una inscripción. `#registro` y `#participar` comparten destino y respetan el encabezado. El cierre muestra el estado real fuera de las FAQ. Para habilitar inscripciones se necesita confirmar URL, requisitos, fechas y tratamiento de datos.

## Validación

Se ejecutaron `tests/browser_smoke.py` y `tests/scroll_regression.py` de forma secuencial. Pruebas a 320, 390, 768, 1024 y 1440 px, además de 1366×768, 1366×650 y 1280×720. Verifican catorce fotografías únicas, tres escenas de portada con apoyo y alineación izquierda, botones funcionales con fondo, imagen base persistente, anclas de las ocho secciones, encabezado fijado durante los capítulos, texto contenido y salida sin hueco residual, un solo agente y roles correctos, altura estable, ambos modales con Tab/Shift+Tab/Escape/cierre y retorno de foco, recursos fallidos, ausencia de JS/GSAP, ahorro de datos, resize y movimiento reducido. La regresión recorre toda la página despacio y rápido en ambos sentidos y comprueba la cortina reversible. Revisión visual en navegador y auditoría axe-core A/AA sin infracciones en ambos perfiles y ambos modales. No sustituye una revisión humana completa de accesibilidad.

También se verificaron laptops 1366×650, 1280×720 y 1024×600: capítulos visibles en ambas direcciones, sin desbordamiento y acordeones funcionales. La prueba reproducible `tests/browser_smoke.py` usa Python y Playwright, sin añadir dependencias al sitio ni cambiar su tecnología.

### Regresión del bloque azul al regresar (16 de octubre de 2026)

Se reprodujo antes de editar: con `scroll-behavior: smooth` global, un `ScrollTrigger.refresh()` a 500 px calculaba el inicio de la portada en −500 en vez de 0. Tras redimensionar y entrar por `#proyecto`, llegó a −7044; al volver arriba el escenario conservaba la traslación final del pin y quedaba fuera de pantalla, exponiendo el fondo azul. No era un fallo de z-index ni un fundido que ocultara la foto base. `main.js` tampoco anima las imágenes de portada.

Se aisló comparando el mismo refresco con scroll global `smooth` y `auto`. La corrección usa scroll nativo inmediato para que la medición/restauración del pin sea síncrona, y elimina los refrescos globales innecesarios por carga de imágenes de la galería. No se cambia el fondo ni el orden de capas para esconder el hueco. Se mantienen los refrescos necesarios para cambios reales de geometría.

`tests/scroll_regression.py` comprueba cobertura geométrica real de la portada, no solo opacidad, incluyendo refresh forzado a 500 y 2200 px. Incluye carga retenida de las dos fotos y decodificación retrasada del Illimani: la anterior permanece visible hasta estar lista. Verificado en Chromium a 1440×900, 1366×768, 1366×650, 1024×600, 390×844 y 320×740. Ejecutar las pruebas secuencialmente, no en paralelo.
