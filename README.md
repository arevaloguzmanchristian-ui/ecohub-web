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
- Fotografías reales de contexto boliviano: La Paz con el Illimani, conexión por teleférico La Paz–El Alto y artesanas Uru. Créditos y licencias visibles en el pie de página y en `assets/bolivia/credits.json`. No representan actividades verificadas ni participantes del proyecto.
- Sin formulario ni métricas inventadas. Faltan los canales oficiales de inscripción y contacto, convocatorias y archivos oficiales de co-branding para su aplicación final.
- Animación GSAP opcional; el contenido y la navegación funcionan sin la biblioteca. Respeta la preferencia de movimiento reducido.
- Portada «Tus ideas. El futuro de Bolivia.» con texto completamente visible desde el inicio. El scroll mueve y funde las fotografías y subraya el titular; no reduce la opacidad de las letras.
- Las tres fotografías WebP se reutilizan en la portada y en las secciones editoriales, sin cargar secuencias de fotogramas adicionales. Los archivos de imágenes anteriores se conservan, pero no se solicitan desde la landing.
- Una única escena fijada en escritorio; móvil sin pinning. Con movimiento reducido, ahorro de datos o conexión 2G se muestra únicamente el póster. El contenido sigue accesible sin JavaScript.
- Orden: presentación del proyecto, explicación de EcoHub, propuesta de formación/acompañamiento/conexiones, contexto boliviano, registro y preguntas frecuentes. Diseño editorial sin tarjetas, indicadores de actividad ni botones repetidos.
- Una sola llamada principal: «Regístrate». Actualmente dirige a la información de registro. Para habilitar la inscripción real, entregar la URL oficial, sustituir el `href` del botón y actualizar el contenido de `#registro`. No hay formulario ficticio ni recopilación de datos.
- GSAP y ScrollTrigger 3.12.5 se sirven localmente desde `assets/vendor`, conservando sus avisos de licencia. Biblioteca original: [GSAP](https://gsap.com/); [licencia](https://gsap.com/standard-license/).
