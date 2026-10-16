# EcoHub — Landing

## Ver la landing

**[Abrir la landing de EcoHub](https://arevaloguzmanchristian-ui.github.io/ecohub-web/)**

Web estática basada en [PRIOR, de RelaxKartikey / Entospark Studios](https://github.com/Relaxkartikey/prior-gsap-animation-portfolio-website-template). Documentación y créditos originales: [README.template.md](README.template.md).

Para verla localmente, abre `index.html` o ejecuta `npx serve .`. Requiere conexión para cargar recursos externos.

Este repositorio contiene solo la web pública, no las notas del equipo.

## Adaptación de identidad Bolivia EcoHub

- Paleta oficial: Azul Horizonte `#005a85`, Verde Brote `#72c594`, Amarillo Sol `#ffe22e` y Arena Suave `#edeae1`.
- Logotipo original extraído del manual facilitado por el equipo; no se ha redibujado. Identidad visual: Gabriela Córdova, 2026.
- Tipografía web Montserrat. Core Rhino 65 Bold queda pendiente de recibir su archivo y licencia web; no se distribuye una copia no autorizada.
- Trece fotografías reales de contexto boliviano, sin repetirlas entre secciones. La portada recorre La Paz desde El Alto, el centro al atardecer y el Illimani de noche. Las demás escenas incluyen UMSA, cerámica de Cotoca, dos talleres de Concepción, un vivero, Lomerío, artesanas Uru, cultivo amazónico y Yacuiba. Créditos y licencias visibles en el pie y en `assets/bolivia/credits.json`. No representan actividades verificadas ni participantes de EcoHub.
- Sin formulario ni métricas inventadas. Faltan los canales oficiales de inscripción y contacto, convocatorias y archivos oficiales de co-branding para su aplicación final.
- Animación GSAP opcional; el contenido y la navegación funcionan sin la biblioteca. Respeta la preferencia de movimiento reducido.
- Portada «Tus ideas. El futuro de Bolivia.» como galería fotográfica ligada al scroll: tres imágenes a superficie completa, fundidos y zoom/alejamiento, sin máscaras que encojan la última imagen. Sin tarjeta superpuesta, giros, panel azul ni reproducción automática. Texto y botón estables, independientes del zoom. Las imágenes esperan su carga y decodificación.
- Las dos imágenes adicionales empiezan a cargar al recorrer la portada; sus versiones móviles suman aproximadamente 185 KB. Con movimiento reducido, ahorro de datos, 2G o sin JS/GSAP se mantiene una portada estática sin solicitarlas.
- Portada con tres mensajes sincronizados: «Tus ideas. El futuro de Bolivia», «Una idea puede empezar contigo» y «Y crecer con otras personas». Capítulos con explicaciones completas y tres puntos por etapa: solo se fijan si todo cabe con tipografía legible; laptops bajas muestran flujo vertical. Móvil/tablet, ahorro de datos, 2G y movimiento reducido conservan contenido completo sin fijaciones.
- Composición editorial de hasta 1280 px, propósito centrado con fotografía amplia, radios de 24–32 px, mensajes breves y cierre compacto. Territorio panorámico y galería asimétrica.
- Qué es EcoHub, público objetivo con tres situaciones, sostenibilidad práctica (ambiente, personas y viabilidad), comunidad y cuatro valores desarrollados. Cerámica de Cotoca vertical completa. Introducciones y bloques centrados; texto estable fuera de las dos escenas protagonistas.
- Fotografías alineadas, sin giros. Zoom reversible vinculado al scroll: hasta 1.08 en portada, 1.025 en los fundidos de capítulos y 1.04 → 1 en las fotos secundarias (1.02 → 1 en móvil), sin superar la resolución disponible. Solo se escalan imágenes; la interfaz permanece estable.
- Capítulos con marco compartido, fundidos sin imágenes vacías, un único texto visible y contador sincronizado. Agentes con altura reservada y transiciones independientes del personaje, nombre y conversación. Navegación con indicador de sección actual.
- Kibo y Hubito, facilitados por el usuario, con WebP optimizados, selector accesible, imagen grande y ejemplos de orientación, ideas y herramientas. Una aclaración de vista previa sin chat conectado. Procedencia y límites: `assets/agents/README.md`. FAQ accesibles y contenido completo sin JavaScript.
- Una sola llamada principal: «Descubre cómo participar». La inscripción todavía no tiene URL confirmada. `#registro` y `#participar` comparten destino; no hay formulario ficticio ni recopilación de datos.
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

Ejecutarlas secuencialmente. La segunda reproduce los casos de regreso a portada, carga y decodificación lentas, enlaces profundos y refrescos desde posiciones bajas. Causa y solución del bloque azul documentadas en `DESIGN.md`.
