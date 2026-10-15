'use strict';

const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
if (toggle && navigation) {
  document.documentElement.classList.add('menu-ready');
  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });
  window.matchMedia('(max-width: 760px)').addEventListener('change', closeMenu);
}

document.querySelector('#year').textContent = new Date().getFullYear();

// Progressive enhancement: without JavaScript all three previews remain readable.
const agents = document.querySelector('.agents');
const selector = agents?.querySelector('.agent-selector');
if (selector) {
  const tabs = [...selector.querySelectorAll('[data-agent]')];
  const panels = [...agents.querySelectorAll('[data-agent-panel]')];
  selector.hidden = false;
  selector.setAttribute('role', 'tablist');
  agents.classList.add('is-interactive');
  let previewAnimation;
  function selectAgent(tab, focus = false) {
    previewAnimation?.kill();
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => {
      const selected = panel.dataset.agentPanel === tab.dataset.agent;
      panel.hidden = !selected;
      if (selected && window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        previewAnimation = gsap.fromTo(panel, { opacity: .7, y: 8 }, { opacity: 1, y: 0, duration: .25, clearProps: 'opacity,transform' });
      }
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    const panel = panels.find(item => item.dataset.agentPanel === tab.dataset.agent);
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    tab.addEventListener('click', () => selectAgent(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectAgent(tabs[next], true);
    });
  });
  // No transition on first render.
  tabs.forEach((tab, index) => { tab.setAttribute('aria-selected', String(index === 0)); tab.tabIndex = index === 0 ? 0 : -1; });
  panels.forEach((panel, index) => { panel.hidden = index !== 0; });
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
    if (!event.matches) return;
    previewAnimation?.kill();
    panels.forEach(panel => { panel.style.removeProperty('opacity'); panel.style.removeProperty('transform'); });
  });
}

const connection = navigator.connection;
if (window.gsap && window.ScrollTrigger && !connection?.saveData && !/(^|-)2g$/.test(connection?.effectiveType || '')) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    document.querySelectorAll('.photo-window > img').forEach(image => {
      gsap.fromTo(image, { scale: 1.06 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: image.closest('figure'), start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    gsap.fromTo('.purpose__detail', { y: 30 }, {
      y: -12, ease: 'none',
      scrollTrigger: { trigger: '.purpose__collage', start: 'top bottom', end: 'bottom center', scrub: true },
    });
  });
}

// Initial deep links must settle after both pinned scenes and fonts have their final geometry.
let interacted = false;
const initialHash = location.hash;
['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(type => window.addEventListener(type, () => { interacted = true; }, { once: true, passive: true }));
function restoreInitialHash() {
  if (interacted || !initialHash || location.hash !== initialHash) return;
  requestAnimationFrame(() => {
    if (interacted || location.hash !== initialHash) return;
    let id;
    try { id = decodeURIComponent(initialHash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
}
function settleLayout() {
  if (window.ScrollTrigger) ScrollTrigger.refresh();
  restoreInitialHash();
}
if (window.ScrollTrigger) ScrollTrigger.addEventListener('refresh', restoreInitialHash);
window.addEventListener('load', settleLayout, { once: true });
if (document.fonts) document.fonts.ready.then(settleLayout);
if ('ResizeObserver' in window) {
  const header = document.querySelector('.header');
  let lastHeight = 0;
  new ResizeObserver(() => {
    const height = Math.round(header.getBoundingClientRect().height);
    if (height === lastHeight) return;
    lastHeight = height;
    document.documentElement.style.setProperty('--header-offset', `${height}px`);
  }).observe(header);
}
