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

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches && window.gsap) {
  gsap.from('.hero__copy > *', { y: 18, opacity: 0, duration: .75, stagger: .08, ease: 'power2.out', clearProps: 'all' });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        gsap.from(entry.target, { y: 25, opacity: .25, duration: .7, ease: 'power2.out', clearProps: 'all' });
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }
}
