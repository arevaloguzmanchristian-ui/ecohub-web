# EcoHub — Landing

## Ver la landing

**[Abrir la landing de EcoHub](https://arevaloguzmanchristian-ui.github.io/ecohub-web/)**

Web estática basada en [PRIOR, de RelaxKartikey / Entospark Studios](https://github.com/Relaxkartikey/prior-gsap-animation-portfolio-website-template). Documentación y créditos originales: [README.template.md](README.template.md).

Para verla localmente con todos sus efectos, ejecuta `npx serve .` (los módulos requieren HTTP). Al abrir `index.html` directamente se conserva el contenido sin los efectos opcionales de Motion. Requiere conexión para cargar recursos externos como las fuentes.

Este repositorio contiene solo la web pública, no las notas del equipo.

## Pablito — consultas sobre la landing

La burbuja **«Pregúntale a Pablito»** permite consultar qué es EcoHub, para quién es, su propuesta y cómo acceder al prerregistro. Responde con información de la landing y enlaces a sus secciones. No rellena ni envía formularios; el bot del formulario es independiente.

- Frontend público: `assets/pablito-landing-v1/chat.js` y `chat.css`.
- Backend PHP y conexión MiniMax: servidor de `ecohub.mittril.com`, no GitHub Pages. **No hay claves API en este repo.**
- Preguntas e historial reciente se envían al servidor y a MiniMax al pulsar Enviar. No compartir datos personales ni contraseñas. Conversación solo en memoria del navegador; se borra al recargar.
- El modelo puede equivocarse: verificar las secciones enlazadas. Si el backend no responde o se alcanza el límite temporal, muestra un aviso y permite reintentar.
- Las conversaciones inline de Pablito y Luca siguen siendo ejemplos escritos; el popup es un componente aparte.

Prueba sin consumir MiniMax: `python tests/pablito_landing_browser.py` (requiere Playwright). La opción `--live` verifica el frontend publicado de producción, simulando las respuestas.

## Adaptación de identidad Bolivia EcoHub

Actualización de interfaz (2026-10-19): navegación con smoke y desplazamiento interrumpible, prerregistro contextual en el header, propuesta centrada, ejemplos de agentes **inline (sin modal)**, cierre y footer redistribuidos. Créditos en cada imagen mediante hover/foco/toque. WebP también para el logo y skeletons locales no bloqueantes. Estas decisiones sustituyen las referencias históricas a los modales y créditos agrupados en el footer. Prueba adicional: `python tests/landing_connections.py`.

- Paleta oficial: Azul Horizonte `#005a85`, Verde Brote `#72c594`, Amarillo Sol `#ffe22e` y Arena Suave `#edeae1`.
- Logotipo original extraído del manual facilitado por el equipo; no se ha redibujado. Identidad visual: Gabriela Córdova, 2026.
- Tipografía web Montserrat. Core Rhino 65 Bold queda pendiente de recibir su archivo y licencia web; no se distribuye una copia no autorizada.
- Catorce fotografías reales de contexto boliviano, sin repetirlas. Incluye una nueva imagen de tejedoras tacana en Tumupasa, La Paz, de N1ny4 t (CC BY-SA 4.0), con procedencia y licencia verificadas. Créditos en el pie y en `assets/bolivia/credits.json`. No representan actividades verificadas ni participantes de EcoHub.
- Sin formulario ni métricas inventadas en la landing. El bloque de participación enlaza al prerregistro del sistema en https://ecohub.mittril.com/; no supone inscripción a convocatorias. Faltan contacto, convocatorias y archivos oficiales de co-branding para su aplicación final.
- Animación GSAP opcional; el contenido y la navegación funcionan sin la biblioteca. Respeta la preferencia de movimiento reducido.
- Motion Mini 14.3.0 local (MIT): galería editorial escalonada, selección de agentes y apertura de ejemplos. Sin React ni nuevos pins; efectos cancelables que respetan movimiento reducido y ahorro de datos. Skiper UI es referencia visual, no dependencia instalada; Manus no está integrado.
- Dirección visual expresiva: nueve titulares seleccionados con letras/palabras animadas, acentos amarillo/verde/Arena, segunda cortina editorial azul → verde → Arena, header transparente sobre la portada y opaco desde el proyecto, barra de avance y botones con nube luminosa y deslizamiento interrumpible. Sin suavizado global del scroll. Prueba adicional: `python tests/visual_effects.py`.
- Portada «Tus ideas. El futuro de Bolivia.» como galería fotográfica ligada al scroll: tres imágenes a superficie completa, fundidos y zoom/alejamiento, sin máscaras que encojan la última imagen. Sin tarjeta superpuesta, giros, panel azul ni reproducción automática. Texto y botón estables, independientes del zoom. Las imágenes esperan su carga y decodificación.
- Las dos imágenes adicionales empiezan a cargar al recorrer la portada; sus versiones móviles suman aproximadamente 185 KB. Con movimiento reducido, ahorro de datos, 2G o sin JS/GSAP se mantiene una portada estática sin solicitarlas.
- Portada con tres mensajes sincronizados: «Tus ideas. El futuro de Bolivia», «Una idea puede empezar contigo» y «Y crecer con otras personas». Capítulos con explicaciones completas y tres puntos por etapa: solo se fijan si todo cabe con tipografía legible; laptops bajas muestran flujo vertical. Móvil/tablet, ahorro de datos, 2G y movimiento reducido conservan contenido completo sin fijaciones.
- Escenas de una altura útil cuando el contenido cabe, sin sumar otro encabezado a `100vh`: proyecto, público, agentes y tres escenas editoriales de sostenibilidad con texto y fotografía juntos. Móvil, pantallas bajas y texto ampliado usan altura automática, nunca recorte ni scroll interno.
- Títulos seleccionados que se elevan por letras/palabras y quedan estables. Zoom en portada (hasta 1.08), capítulos y foto del proyecto (hasta 1.025), limitado por resolución; texto y botones nunca se escalan.
- Territorio a sangre con sticky nativo acotado: el panel de agentes descubre la foto y el panel de valores la cubre al subir, también al retroceder. Sin fondo fijo global, márgenes negativos ni tercer pin de GSAP. La foto y su texto permanecen en el mismo escenario.
- La propuesta fija encabezado, descripción, indicador, fotografía y capítulo juntos. Se mide todo el contenido antes de fijar y se aprovecha la altura disponible, sin cola azul vacía al salir.
- Pablito: personas y primeros pasos, con sudadera verde, guiño y pulgar arriba. Luca: empresas, organización y desarrollo del negocio, con gafas, chaleco oscuro y portátil. Avatares humanos ilustrados de los conceptos (2), preparados como retratos transparentes y optimizados, con respaldos verde y azul respectivamente. Solo el seleccionado y su conversación inline son visibles; Pablito se presenta más pequeño. Son ejemplos escritos, no un chat conectado. Procedencia y límites: `assets/agents/README.md`. FAQ y ambos ejemplos siguen disponibles sin JavaScript.
- Exactamente dos botones en portada: «Prerregistro» (amarillo) y «Conoce el proyecto» (azul), siempre funcionales. El acceso de prerregistro aparece en el encabezado entre portada y cierre. `#registro` y `#participar` comparten el bloque que enlaza al prerregistro externo. La landing no recibe ni transmite datos del formulario.
- GSAP y ScrollTrigger 3.12.5 se sirven localmente desde `assets/vendor`, conservando sus avisos de licencia. Biblioteca original: [GSAP](https://gsap.com/); [licencia](https://gsap.com/standard-license/).

Las decisiones de tipografía, animación, accesibilidad, imágenes, logo y co-branding pendiente se documentan en [DESIGN.md](DESIGN.md).

## Prueba de navegador opcional

```sh
python -m pip install playwright
python -m playwright install chromium
python tests/browser_smoke.py
python tests/scroll_regression.py
```

No se necesita Python ni Playwright para usar o publicar la landing; solo para ejecutar estas pruebas.

Ejecutarlas secuencialmente. Incluyen texto al 200%, escenarios de una altura útil, revelado/cobertura sticky, regreso a portada, carga y decodificación lentas y enlaces profundos. Causa y solución del bloque azul documentadas en `DESIGN.md`.
