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
  const mobile = window.matchMedia('(max-width: 760px)');
  mobile.addEventListener('change', closeMenu);
}

const profiles = {
  joven: {
    title: 'Tu idea puede ser el comienzo.',
    description: 'Si eres joven y quieres explorar el emprendimiento sostenible, empieza por conocer nuestras áreas de formación, mentoría y comunidad.',
    link: 'Explorar las oportunidades',
    href: '#oportunidades',
  },
  mentor: {
    title: 'Lo que sabes puede impulsar a alguien.',
    description: 'Tu experiencia puede ayudar a jóvenes a desarrollar sus ideas. Conoce el enfoque de Bolivia EcoHub y los valores que orientan el acompañamiento.',
    link: 'Conocer el ecosistema',
    href: '#ecosistema',
  },
  aliado: {
    title: 'El impacto se multiplica en red.',
    description: 'Si formas parte de una organización, institución o emprendimiento, descubre cómo la colaboración conecta personas, conocimientos y oportunidades sostenibles.',
    link: 'Descubrir la comunidad',
    href: '#comunidad',
  },
};

document.querySelectorAll('[data-profile]').forEach(button => {
  button.addEventListener('click', () => {
    const profile = profiles[button.dataset.profile];
    if (!profile) return;
    document.querySelectorAll('[data-profile]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('#profile-title').textContent = profile.title;
    document.querySelector('#profile-description').textContent = profile.description;
    const link = document.querySelector('#profile-link');
    link.textContent = profile.link + ' ↗';
    link.setAttribute('href', profile.href);
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();

if (window.gsap) {
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const motion = gsap.matchMedia();

  motion.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from('.hero__copy > *', { y: 18, opacity: 0, duration: .75, stagger: .08, ease: 'power2.out', clearProps: 'all' });
    if (!window.ScrollTrigger) return;

    document.querySelectorAll('.reveal').forEach(element => {
      gsap.fromTo(element, { y: 45, opacity: .3 }, {
        y: 0, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: element, start: 'top 95%', end: 'top 65%', scrub: true },
      });
    });
    gsap.to('.values-strip [aria-hidden]', {
      rotation: 180, ease: 'none',
      scrollTrigger: { trigger: '.values-strip', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.fromTo('.community__image img', { scale: 1.18, yPercent: -6 }, {
      scale: 1.04, yPercent: 2, ease: 'none',
      scrollTrigger: { trigger: '.community', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.fromTo('.closing__symbol', { rotation: -90 }, {
      rotation: 90, ease: 'none',
      scrollTrigger: { trigger: '.closing', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  motion.add({
    desktop: '(min-width: 1001px) and (min-height: 720px)',
    reduced: '(prefers-reduced-motion: reduce)',
  }, context => {
    if (context.conditions.reduced || !window.ScrollTrigger) return;
    const desktop = context.conditions.desktop;
    const header = document.querySelector('.header');
    const scene = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.hero',
        start: () => desktop ? `top top+=${header.offsetHeight}` : 'top top',
        end: 'bottom top',
        pin: false,
        scrub: .6,
        invalidateOnRefresh: true,
      },
    });
    scene.to('.hero__image', { scale: desktop ? 1.4 : 1.16 }, 0)
      .to('.orbit svg', { rotation: 95, scale: 1.2 }, 0)
      .to('.hero__sticker', { rotation: 8, y: desktop ? -65 : -28 }, 0)
      .to('.hero__visual', { borderTopLeftRadius: 12 }, 0);
    if (desktop) {
      scene.to('.hero__copy', { y: -20 }, 0)
        .to('.highlight', { color: '#ffe22e' }, 0)
        .to('.hero__visual-bottom', { y: -18 }, 0);
    }

    // Recalculate scene positions after fonts and images settle.
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts) document.fonts.ready.then(() => {
      if (!context.isReverted) refresh();
    });
    window.addEventListener('load', refresh, { once: true });
    return () => window.removeEventListener('load', refresh);
  });
}
