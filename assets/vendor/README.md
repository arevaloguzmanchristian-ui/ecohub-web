# Animation dependencies

- `gsap.min.js` and `ScrollTrigger.min.js`: existing GSAP 3.12.5 scroll choreography. See the upstream license at https://gsap.com/standard-license/.
- `motion-mini-14.3.0.mjs`: Motion Mini 14.3.0, MIT; local, self-contained ESM bundle from https://esm.sh/motion@14.3.0/es2022/mini.bundle.mjs (retrieved 2026-10-17). License: `MOTION-LICENSE.md`. No runtime CDN requests or React dependency.

Motion handles gallery, agent-selection and dialog entrances only. GSAP does not animate those same targets. Skiper UI was reviewed as visual reference; no Skiper components, premium source, or assets are included. Manus is an external service and is not integrated.
