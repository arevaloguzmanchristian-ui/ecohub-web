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
- Fotografías reales de contexto boliviano: La Paz/Illimani, La Paz–El Alto, artesanas Uru, jóvenes colaborando en Concepción y Lomerío y cultivo en la Amazonía. Créditos y licencias visibles en el pie y en `assets/bolivia/credits.json`. No representan actividades verificadas ni participantes de EcoHub.
- Sin formulario ni métricas inventadas. Faltan los canales oficiales de inscripción y contacto, convocatorias y archivos oficiales de co-branding para su aplicación final.
- Animación GSAP opcional; el contenido y la navegación funcionan sin la biblioteca. Respeta la preferencia de movimiento reducido.
- Portada «Tus ideas. El futuro de Bolivia.» completa desde el inicio; territorio y jóvenes en dos encuadres explícitos. El scroll acerca la imagen y cede espacio a un mensaje de comunidad.
- Dos escenas fijadas breves en escritorio: portada y tres capítulos de la propuesta. Móvil/tablet, ahorro de datos, 2G y movimiento reducido conservan una presentación estática y completa. No se cargan secuencias de fotogramas ni un renderizado permanente.
- Tres agentes digitales originales con selector accesible y conversaciones de demostración, identificados como vista previa sin chat conectado.
- Una sola llamada principal: «Conocer cómo participar». La inscripción todavía no tiene URL confirmada. `#registro` y `#participar` comparten destino; no hay formulario ficticio ni recopilación de datos.
- GSAP y ScrollTrigger 3.12.5 se sirven localmente desde `assets/vendor`, conservando sus avisos de licencia. Biblioteca original: [GSAP](https://gsap.com/); [licencia](https://gsap.com/standard-license/).

Las decisiones de tipografía, animación, accesibilidad, imágenes, logo y co-branding pendiente se documentan en [DESIGN.md](DESIGN.md).

## Prueba de navegador opcional

```sh
python -m pip install playwright
python -m playwright install chromium
python tests/browser_smoke.py
```

No se necesita Python ni Playwright para usar o publicar la landing; solo para ejecutar estas pruebas.
