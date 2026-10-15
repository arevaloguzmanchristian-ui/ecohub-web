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

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    // Images can move; text remains fully visible at every scroll position.
    document.querySelectorAll('.photo-window img').forEach(image => {
      gsap.fromTo(image, { scale: 1.1 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: image.closest('figure'), start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh, { once: true });
    let alive = true;
    if (document.fonts) document.fonts.ready.then(() => { if (alive) refresh(); });
    return () => { alive = false; window.removeEventListener('load', refresh); };
  });
}
