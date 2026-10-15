# Bolivia EcoHub — criterios de implementación

## Relato y sistema visual

Concepto: **Desde nuestras ideas, crece el futuro de Bolivia.**

Orden: territorio en portada → personas, propósito e ideas → aprender, desarrollar y conectar → vista previa de acompañamiento digital → territorio, oficios y recursos naturales → participación.

El Azul Horizonte `#005A85` es el fondo principal. Verde Brote `#72C594` destaca crecimiento y mensajes grandes; Amarillo Sol `#FFE22E` señala la acción principal y la información de participación; Arena Suave `#EDEAE1` da descanso en navegación, agentes y preguntas frecuentes. La tinta auxiliar oscura `#153E50` sirve para texto legible sobre verde; no sustituye los colores oficiales.

Los encuadres redondeados, personajes digitales y composiciones de conexión son propuestas de interfaz, no modificaciones del logotipo ni elementos oficiales añadidos a la identidad.

## Criterio tipográfico ante las inconsistencias del manual

- Core Rhino 65 Bold: titulares protagonistas y frases de marca, únicamente si está disponible con licencia web. No se ha recibido su archivo; no se descarga ni distribuye una copia.
- Montserrat Medium (500): alternativa provisional de esos titulares, títulos secundarios, navegación y botones.
- Montserrat Regular (400): subtítulos y textos sobre fotografía.
- Montserrat Light (300): párrafos sobre fondos sólidos en escritorio, cuando conservan legibilidad. En móvil se prioriza Regular.
- Montserrat Italic (400): énfasis editorial puntual; está disponible, sin sustituirla por DM Sans.

`--display` define la familia principal con fallback a Montserrat. Para incorporar Core Rhino, proporcionar el archivo WOFF2 autorizado y su licencia, declarar un `@font-face` local y mantener este fallback. No bloquear la portada mientras carga la fuente.

## Logotipo y convivencia institucional

Se conserva el recurso de marca ya disponible, derivado del manual original, sin redibujar, separar, girar ni animar sus elementos. La navegación usa un soporte Arena Suave limpio, proporciones originales, ancho mínimo de 180 px y un área de protección de 24 px alrededor del logo, superior a la altura de la «o» a los tamaños utilizados.

No se han recibido archivos institucionales oficiales para el co-branding con la Unión Europea. No se extraen emblemas diminutos de las aplicaciones de ejemplo, no se añaden socios y no se inventa una declaración de financiación. La aplicación final queda pendiente de esos recursos y de la confirmación de la declaración correspondiente.

## Imágenes y alcance documental

Se muestran **doce fotografías diferentes, sin reutilizarlas entre secciones**: panorámica de La Paz desde El Alto, centro de La Paz al atardecer, Illimani de noche, estudiantes de la UMSA, cerámica de Cotoca, aprendizaje en Concepción, un bonsaísta en su vivero, colaboración en Lomerío, teleférico La Paz–El Alto, artesanas Uru, cultivo amazónico y un taller en Yacuiba. Los tres agentes usan sus propios SVG originales, no fotografías de relleno.

Fuentes, autores, descripciones y licencias: `assets/bolivia/credits.json`, también visibles en el pie. Las adaptaciones WebP, variantes de 640 px y encuadres conservan sus licencias de origen, incluidas CC BY-SA. No implican alianza ni participación de las personas u organizaciones retratadas en EcoHub.

La fotografía solicitada de jóvenes emprendedores en una terraza de La Paz no se ha proporcionado. La portada actual comienza con una panorámica real y continúa con dos fotografías de la ciudad y el Illimani; no pretende ser aquella escena ni un montaje fotográfico. Se retiraron la tarjeta superpuesta y el velo azul intenso. Solo queda una sombra neutra para mantener el contraste del texto, sin panel de color.

## Animación y rendimiento

- `sequence.js` es el único responsable de las dos escenas fijadas: portada breve y propuesta de tres capítulos.
- La portada comienza completa y legible, de borde a borde, sin tarjetas ni recuadros de color. Su primer scroll funciona como una galería de tres tomas: ciudad → atardecer → Illimani de noche. El contador, nombre de la fotografía y tres líneas discretas siguen la imagen realmente disponible.
- Dirección de movimiento: ninguna fotografía, personaje ni contenedor se gira o inclina. Solo se escalan imágenes dentro de sus marcos; los textos, botones y pies de foto no heredan el zoom. La portada llega hasta 1.10, limitado por los píxeles reales del recurso seleccionado en `srcset`, no por su tamaño natural corregido por densidad.
- Una foto base permanece siempre opaca. La segunda entra con un fundido corto y abre un encuadre redondeado; la tercera entra por fundido y vuelve suavemente a un marco más recogido, con la fotografía anterior como fondo, nunca un panel azul. Se alternan acercamiento (hasta 1.10), alejamiento (hasta 1.07 → 1) y acercamiento discreto (hasta 1.055). En móvil, las escalas se limitan a 1.025 y las máscaras son menores. Todo revierte al subir, sin giros ni reproducción autónoma.
- La fotografía del propósito abre una máscara de 3% hasta sus bordes. Las demás fotos usan 1.04 → 1 en escritorio y 1.02 → 1 en móvil, también limitados por resolución.
- La propuesta usa un marco estable con tres capas fotográficas. Una imagen base siempre permanece opaca, las nuevas entran por fundido y el zoom máximo es 1.025. Texto, pie y contador se seleccionan desde el mismo progreso suavizado: un solo texto visible, sin huecos ni superposiciones. Cada capítulo se mantiene al detener el scroll y las transiciones se revierten al subir.
- En móvil, tablet, ventanas bajas, ahorro de datos o movimiento reducido se muestran bloques verticales completos, sin fijaciones prolongadas.
- `main.js` gestiona navegación, agentes, enlaces profundos y parallax moderado. No duplica las secuencias.
- No hay canvas renderizado permanentemente, secuencias de cientos de archivos, scroll artificial ni cursores obligatorios.
- El zoom no tiene una reproducción autónoma: está vinculado al progreso del scroll. El suavizado solo termina de asentarlo al detenerse; no sigue ampliándose por sí solo.
- Los agentes reservan la altura del perfil más alto para evitar saltos. Se animan por separado el personaje (0.97 → 1 y 8 px), el nombre y la demostración, sin escalar el panel completo ni usar rebotes.
- Navegación con subrayado de ubicación y `aria-current="location"`; flechas de botones con desplazamiento de 3 px y títulos editoriales por líneas con movimientos breves, manteniendo su legibilidad.
- Imágenes con dimensiones, `srcset`, variantes pequeñas y carga diferida. La portada no espera fotografías inferiores. Las animaciones finitas se actualizan al desplazarse; no hay un bucle propio de renderizado.
- La panorámica dispone de variantes de 640, 1280 y 1920 px; la de 1280 px pesa unos 237 KB y evita descargar la versión grande en la portada vertical de móvil. Las cinco fotografías incorporadas para eliminar repeticiones se sirven como WebP y las inferiores cargan de forma diferida.
- Las dos fotos adicionales de portada no tienen `src` inicialmente: solo se solicitan al avanzar el scroll mientras la portada sigue visible. Sus versiones móviles de 1280 px suman aproximadamente 185 KB. Con ahorro de datos, 2G, movimiento reducido, sin GSAP o sin JavaScript no se solicitan y permanece la panorámica estática. Si una foto falla, se conserva la base o la última disponible; el contador no anuncia una imagen que no cargó.
- Sin JavaScript se conservan el menú, todos los capítulos, los tres ejemplos de agentes, preguntas frecuentes y participación.

## Agentes y registro: estado real

Nexo, Impulso y Brújula son personajes SVG originales propuestos para la web. El selector cambia perfil, imagen y conversación escrita; admite flechas, Inicio y Fin mediante un patrón de pestañas accesible. No hay un campo de chat, API de IA, disponibilidad permanente ni agentes oficiales inventados.

La única llamada principal es **Conocer cómo participar**. El enlace oficial de registro no se ha recibido; no se simula una inscripción. `#registro` y `#participar` comparten destino y respetan el encabezado fijo. Para habilitar inscripciones se necesita confirmar URL, requisitos, fechas y tratamiento de datos.

## Validación

Se probaron 320, 390, 768, 1024 y 1440 px; doce fotografías distintas sin repeticiones entre secciones; portada sin tarjeta; galería de tres fotos, máscaras, capas en orden, etiquetas sincronizadas y scroll reversible; carga diferida sin pedir las dos fotos nuevas al entrar; cambios de tamaño; agentes con ratón y teclado; altura estable entre perfiles; ausencia de giros; fundidos intermedios con imagen base visible; un único texto y contador de capítulos sincronizados; enlaces profundos y ubicación activa; recursos fallidos; ausencia de GSAP/JavaScript; ahorro de datos; cambio dinámico de movimiento reducido. Auditoría automática axe-core WCAG A/AA sin infracciones en los tres perfiles visibles. Esto no sustituye una revisión de accesibilidad humana completa.

La prueba reproducible `tests/browser_smoke.py` usa Python y Playwright, sin añadir dependencias al sitio ni cambiar su tecnología.
