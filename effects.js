import { animate } from './assets/vendor/motion-mini-14.3.0.mjs';

// Motion owns only these small, time-bounded effects. GSAP retains scroll scenes.
// Content is visible by default, including when this optional module fails.
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const connection = navigator.connection;
const enabled = () => !reduced.matches && !connection?.saveData && !/(^|-)2g$/.test(connection?.effectiveType || '');
const active = new Set();

function reveal(element, { delay = 0, distance = 10, duration = .34, group = 'gallery', blur = false } = {}) {
  if (!element || !enabled()) return;
  const keyframes = {
    opacity: [.35, 1],
    transform: [`translateY(${distance}px)`, 'translateY(0px)'],
  };
  if (blur) keyframes.filter = ['blur(6px)', 'blur(0px)'];
  const controls = animate(element, keyframes, { duration, delay, ease: [.22, 1, .36, 1] });
  const entry = { controls, element, group };
  active.add(entry);
  const clean = () => {
    if (!active.delete(entry)) return;
    element.style.removeProperty('opacity');
    element.style.removeProperty('transform');
    element.style.removeProperty('filter');
  };
  controls.finished.then(() => { controls.cancel(); clean(); }).catch(clean);
}

function cancelGroup(group) {
  [...active].filter(entry => !group || entry.group === group).forEach(entry => {
    entry.controls.cancel();
    entry.element.style.removeProperty('opacity');
    entry.element.style.removeProperty('transform');
    entry.element.style.removeProperty('filter');
    active.delete(entry);
  });
}

// Selected titles only. Keep their semantic name and original emphasis/line breaks;
// visible character spans are decorative, not separately spoken letters.
const titleStyles = new Map([
  ['#hero-title', 'chars'], ['.hero__headline', 'chars'],
  ['#purpose-title', 'words'], ['#chapters-title', 'words'],
  ['#sustainability-title', 'chars'], ['#agents-title', 'chars'],
  ['#territory-title', 'words'], ['#registration-title', 'chars'],
]);
const titles = [];
titleStyles.forEach((style, selector) => {
  document.querySelectorAll(selector).forEach(title => {
    const semantic = title.cloneNode(true);
    semantic.querySelectorAll('br').forEach(br => br.replaceWith(' '));
    title.setAttribute('aria-label', (title.innerText || semantic.textContent).replace(/\s+/g, ' ').trim());
    title.dataset.letterEffect = style;
    const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(token => {
        if (!token.trim()) { fragment.append(document.createTextNode(token)); return; }
        const word = document.createElement('span');
        word.className = 'type-word';
        word.setAttribute('aria-hidden', 'true');
        if (style === 'chars') {
          Array.from(token).forEach(letter => {
            const span = document.createElement('span');
            span.className = 'type-char';
            span.textContent = letter;
            word.appendChild(span);
          });
        } else word.textContent = token;
        fragment.appendChild(word);
      });
      node.replaceWith(fragment);
    });
    titles.push(title);
  });
});

function revealTitle(title) {
  if (!title || !enabled()) return;
  const group = `title:${titles.indexOf(title)}`;
  cancelGroup(group);
  const chars = title.dataset.letterEffect === 'chars';
  title.querySelectorAll(chars ? '.type-char' : '.type-word').forEach((letter, index) => {
    reveal(letter, { group, distance: chars ? 24 : 30, delay: Math.min(index * (chars ? .012 : .065), .48), duration: .58, blur: chars });
  });
}

if ('IntersectionObserver' in window) {
  const titleObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      titleObserver.unobserve(entry.target);
      revealTitle(entry.target);
    });
  }, { threshold: .25 });
  titles.filter(title => !title.matches('.hero__headline')).forEach(title => titleObserver.observe(title));
}
const hero = document.querySelector('.hero');
if (hero && 'MutationObserver' in window) {
  const heroObserver = new MutationObserver(() => {
    const messages = [...hero.querySelectorAll('.hero__messages > div')];
    messages.forEach((message, index) => {
      const title = message.querySelector('h1,.hero__headline');
      if (index === Number(hero.dataset.photo)) revealTitle(title);
      else cancelGroup(`title:${titles.indexOf(title)}`);
    });
  });
  heroObserver.observe(hero, { attributes: true, attributeFilter: ['data-photo'] });
}

// A second curtain, this time as three coloured editorial sheets. Native sticky
// stays inside the gallery; image decode and text fit gate the enhancement.
const editorial = document.querySelector('.sustainability__gallery');
let curtainFrame;
function updateEditorialCurtain() {
  curtainFrame = 0;
  if (!editorial) return;
  const sheets = [...editorial.querySelectorAll('.gallery-piece')];
  const fits = enabled() && innerWidth >= 1001 && innerHeight >= 740 && sheets.slice(0, 2).every(sheet => {
    const image = sheet.querySelector('img');
    return sheet.classList.contains('is-screen') && image.dataset.effectDecoded === image.currentSrc;
  });
  editorial.classList.toggle('is-curtain', fits);
}
function queueEditorialCurtain() { if (!curtainFrame) curtainFrame = requestAnimationFrame(updateEditorialCurtain); }
editorial?.querySelectorAll('img').forEach(image => {
  async function ready() {
    if (!image.complete || !image.naturalWidth) return;
    const source = image.currentSrc;
    try { await image.decode(); } catch { return; }
    if (image.currentSrc !== source) return;
    image.dataset.effectDecoded = source;
    queueEditorialCurtain();
  }
  image.addEventListener('load', ready);
  ready();
});
if (editorial && 'ResizeObserver' in window) {
  const sheetObserver = new ResizeObserver(queueEditorialCurtain);
  editorial.querySelectorAll('.gallery-piece').forEach(sheet => sheetObserver.observe(sheet));
}
window.addEventListener('resize', queueEditorialCurtain);
window.addEventListener('ecohub:layout', queueEditorialCurtain);
reduced.addEventListener('change', queueEditorialCurtain);
connection?.addEventListener?.('change', queueEditorialCurtain);
queueEditorialCurtain();

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
  reveal(panel?.querySelector('.agent-chat'), { group: 'agent', delay: .08, distance: 8 });
});

reduced.addEventListener('change', () => { if (!enabled()) cancelGroup(); });
connection?.addEventListener?.('change', () => { if (!enabled()) cancelGroup(); });
