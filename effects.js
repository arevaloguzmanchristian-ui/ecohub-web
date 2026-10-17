import { animate } from './assets/vendor/motion-mini-14.3.0.mjs';

// Motion owns only these small, time-bounded effects. GSAP retains scroll scenes.
// Content is visible by default, including when this optional module fails.
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const connection = navigator.connection;
const enabled = () => !reduced.matches && !connection?.saveData;
const active = new Set();

function reveal(element, { delay = 0, distance = 10, duration = .34, group = 'gallery' } = {}) {
  if (!element || !enabled()) return;
  const controls = animate(element, {
    opacity: [.35, 1],
    transform: [`translateY(${distance}px)`, 'translateY(0px)'],
  }, { duration, delay, ease: [.22, 1, .36, 1] });
  const entry = { controls, element, group };
  active.add(entry);
  const clean = () => {
    if (!active.delete(entry)) return;
    element.style.removeProperty('opacity');
    element.style.removeProperty('transform');
  };
  controls.finished.then(() => { controls.cancel(); clean(); }).catch(clean);
}

function cancelGroup(group) {
  [...active].filter(entry => !group || entry.group === group).forEach(entry => {
    entry.controls.cancel();
    entry.element.style.removeProperty('opacity');
    entry.element.style.removeProperty('transform');
    active.delete(entry);
  });
}

// Original, restrained editorial reveals inspired by component-gallery patterns;
// no Skiper component code or premium assets are copied.
if ('IntersectionObserver' in window) {
  const gallery = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      gallery.unobserve(entry.target);
      reveal(entry.target.querySelector('figure'), { distance: 16, duration: .5 });
      reveal(entry.target.querySelector('.gallery-copy'), { delay: .1, distance: 10, duration: .42 });
    });
  }, { threshold: .18 });
  document.querySelectorAll('.gallery-piece').forEach(piece => gallery.observe(piece));
}

document.addEventListener('ecohub:agent', event => {
  cancelGroup('agent');
  const name = event.detail.agent;
  const figure = document.querySelector(`[data-agent-figure="${name}"] img`);
  const panel = document.querySelector(`[data-agent-panel="${name}"]`);
  reveal(figure, { group: 'agent', distance: 8 });
  reveal(panel?.querySelector('.agent-panel__copy'), { group: 'agent', delay: .04, distance: 6 });
  reveal(panel?.querySelector('.agent-example-link'), { group: 'agent', delay: .08, distance: 4 });
});

const dialog = document.querySelector('#agent-example');
document.addEventListener('ecohub:example', () => {
  cancelGroup('dialog');
  reveal(dialog, { group: 'dialog', distance: 12, duration: .24 });
});
dialog?.addEventListener('close', () => cancelGroup('dialog'));
reduced.addEventListener('change', () => { if (!enabled()) cancelGroup(); });
connection?.addEventListener?.('change', () => { if (!enabled()) cancelGroup(); });
