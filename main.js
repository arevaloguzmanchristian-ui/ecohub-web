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

// Progressive enhancement: without JavaScript both previews remain readable.
const agents = document.querySelector('.agents');
const selector = agents?.querySelector('.agent-selector');
if (selector) {
  const tabs = [...selector.querySelectorAll('[data-agent]')];
  const panels = [...agents.querySelectorAll('[data-agent-panel]')];
  const figures = [...agents.querySelectorAll('[data-agent-figure]')];
  selector.hidden = false;
  selector.setAttribute('role', 'tablist');
  agents.classList.add('is-interactive');
  const stage = agents.querySelector('.agent-panels');
  let previewAnimation;
  function clearPreviewStyles() {
    figures.forEach(figure => {
      figure.querySelector('img').style.removeProperty('opacity');
      figure.querySelector('img').style.removeProperty('transform');
    });
    panels.forEach(panel => {
      panel.querySelectorAll('.agent-panel__copy > .eyebrow, .agent-panel__copy > h3, .agent-example-link').forEach(element => {
        element.style.removeProperty('opacity');
        element.style.removeProperty('transform');
      });
    });
  }
  function reserveAgentHeight() {
    if (!stage.clientWidth) return;
    const measure = document.createElement('div');
    measure.className = 'agent-measure';
    measure.setAttribute('aria-hidden', 'true');
    measure.setAttribute('inert', '');
    panels.forEach(panel => {
      const clone = panel.cloneNode(true);
      clone.hidden = false;
      ['id', 'role', 'aria-labelledby', 'tabindex'].forEach(attribute => clone.removeAttribute(attribute));
      measure.appendChild(clone);
    });
    stage.appendChild(measure);
    const height = Math.ceil(Math.max(...[...measure.children].map(panel => {
      return panel.getBoundingClientRect().height + parseFloat(getComputedStyle(panel).marginBottom);
    })));
    measure.remove();
    if (stage.style.minHeight === `${height}px`) return;
    stage.style.minHeight = `${height}px`;
    if (window.ScrollTrigger) requestAnimationFrame(() => ScrollTrigger.refresh());
  }
  function selectAgent(tab, focus = false) {
    previewAnimation?.kill();
    clearPreviewStyles();
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    selector.style.setProperty('--agent-index', String(tabs.indexOf(tab)));
    figures.forEach(figure => {
      const selected = figure.dataset.agentFigure === tab.dataset.agent;
      figure.hidden = !selected;
      figure.toggleAttribute('inert', !selected);
      figure.setAttribute('aria-hidden', String(!selected));
      figure.classList.toggle('is-selected', selected);
    });
    panels.forEach(panel => {
      const selected = panel.dataset.agentPanel === tab.dataset.agent;
      panel.hidden = !selected;
      if (selected && window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        previewAnimation = gsap.timeline({ defaults: { ease: 'power1.out', clearProps: 'opacity,transform' } })
          .fromTo(figures.find(figure => figure.dataset.agentFigure === tab.dataset.agent).querySelector('img'), { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .28 }, 0)
          .fromTo(panel.querySelectorAll('.agent-panel__copy > .eyebrow, .agent-panel__copy > h3'), { opacity: .5, y: 6 }, { opacity: 1, y: 0, duration: .25, stagger: .035 }, .04)
          .fromTo(panel.querySelector('.agent-example-link'), { opacity: .7, y: 4 }, { opacity: 1, y: 0, duration: .22 }, .08);
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
  figures.forEach((figure, index) => {
    figure.hidden = index !== 0;
    figure.toggleAttribute('inert', index !== 0);
    figure.setAttribute('aria-hidden', String(index !== 0));
  });
  reserveAgentHeight();
  if (document.fonts) document.fonts.ready.then(reserveAgentHeight);
  if ('ResizeObserver' in window) {
    let lastWidth = stage.clientWidth;
    new ResizeObserver(() => {
      if (stage.clientWidth === lastWidth) return;
      lastWidth = stage.clientWidth;
      reserveAgentHeight();
    }).observe(stage);
  } else {
    window.addEventListener('resize', reserveAgentHeight);
  }
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
    if (!event.matches) return;
    previewAnimation?.kill();
    clearPreviewStyles();
  });
}

// Native dialog provides top-layer isolation; examples remain anchor-linked
// in the document when JavaScript or dialog support is unavailable.
const exampleDialog = document.querySelector('#agent-example');
const exampleArchive = document.querySelector('.agent-examples');
if (exampleDialog?.showModal && exampleArchive) {
  exampleArchive.hidden = true;
  let origin;
  const close = exampleDialog.querySelector('.dialog-close');
  document.querySelectorAll('.agent-example-link').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      if (exampleDialog.open) return;
      const source = exampleArchive.querySelector(`[data-example-content="${link.dataset.example}"]`);
      if (!source) return;
      origin = link;
      exampleDialog.querySelector('#example-title').textContent = link.dataset.example === 'kibo' ? 'Kibo' : 'Hubito';
      exampleDialog.querySelector('.example-content').replaceChildren(source.querySelector('.conversation').cloneNode(true));
      document.body.classList.add('modal-open');
      exampleDialog.showModal();
      close.focus();
    });
  });
  close.addEventListener('click', () => exampleDialog.close());
  exampleDialog.addEventListener('cancel', event => { event.preventDefault(); exampleDialog.close(); });
  exampleDialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    origin?.focus({ preventScroll: true });
  });
  exampleDialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...exampleDialog.querySelectorAll('button, a[href], input, [tabindex="0"]')].filter(el => !el.disabled && !el.hidden);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
}

// Native details remain the fallback; enhancement animates only the opening height.
document.querySelectorAll('.faq details').forEach(details => {
  const summary = details.querySelector('summary');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animation;
  let closing = false;
  function finish(expanded) {
    details.open = expanded;
    details.style.removeProperty('overflow');
    animation = null;
    closing = false;
    if (window.ScrollTrigger) requestAnimationFrame(() => ScrollTrigger.refresh());
  }
  summary.addEventListener('click', event => {
    if (reduced.matches || !details.animate) return;
    event.preventDefault();
    const start = details.getBoundingClientRect().height;
    const expanded = !details.open || closing;
    animation?.cancel();
    details.open = true;
    const end = expanded ? details.scrollHeight : summary.getBoundingClientRect().height + 2;
    closing = !expanded;
    details.style.overflow = 'hidden';
    animation = details.animate({ height: [`${start}px`, `${end}px`] }, { duration: 220, easing: 'ease-out' });
    animation.onfinish = () => finish(expanded);
  });
  reduced.addEventListener('change', event => {
    if (!event.matches || !animation) return;
    const expanded = !closing;
    animation.cancel();
    finish(expanded);
  });
});

const connection = navigator.connection;
if (window.gsap && window.ScrollTrigger && !connection?.saveData && !/(^|-)2g$/.test(connection?.effectiveType || '')) {
  gsap.registerPlugin(ScrollTrigger);
  // Preserve semantic text while splitting only explicit editorial line breaks.
  const headings = [...document.querySelectorAll('.purpose h2, .audience h2')];
  headings.forEach(heading => {
    const nodes = [...heading.childNodes];
    heading.replaceChildren();
    let line = document.createElement('span');
    line.className = 'heading-line';
    let mask = document.createElement('span');
    mask.className = 'heading-mask';
    mask.appendChild(line);
    heading.appendChild(mask);
    nodes.forEach(node => {
      if (node.nodeName === 'BR') {
        line = document.createElement('span');
        line.className = 'heading-line';
        mask = document.createElement('span');
        mask.className = 'heading-mask';
        mask.appendChild(line);
        heading.appendChild(mask);
      } else {
        line.appendChild(node);
      }
    });
  });
  gsap.matchMedia().add({ motion: '(prefers-reduced-motion: no-preference)', mobile: '(max-width: 760px)' }, context => {
    if (!context.conditions.motion) return;
    headings.forEach(heading => {
      const lines = heading.querySelectorAll('.heading-line');
      if (!lines.length) return;
      gsap.fromTo(lines, { y: heading.closest('.purpose') ? 24 : 16, opacity: .25 }, {
        y: 0, opacity: 1, stagger: .07, duration: .5, ease: 'power1.out',
        scrollTrigger: { trigger: heading, start: 'top 92%', once: true },
      });
    });
    gsap.from('.audience__situations article', {
      y: 10, stagger: .06, duration: .35, ease: 'power1.out',
      scrollTrigger: { trigger: '.audience__situations', start: 'top 92%', once: true },
    });
  });
}

// A section-location underline, not an activity or availability indicator.
if (navigation) {
  const links = [...navigation.querySelectorAll('a[href^="#"]')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))?.closest('section'));
  let frame = 0;
  function updateCurrentSection() {
    frame = 0;
    const marker = document.querySelector('.header').offsetHeight + innerHeight * .3;
    let current = -1;
    sections.forEach((section, index) => { if (section && section.getBoundingClientRect().top <= marker) current = index; });
    links.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function queueSectionUpdate() { if (!frame) frame = requestAnimationFrame(updateCurrentSection); }
  window.addEventListener('scroll', queueSectionUpdate, { passive: true });
  window.addEventListener('resize', queueSectionUpdate);
  window.addEventListener('load', queueSectionUpdate, { once: true });
  queueSectionUpdate();
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
