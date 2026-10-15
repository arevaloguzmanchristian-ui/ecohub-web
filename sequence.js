'use strict';

// Two finite scroll scenes. No frame loop, scroll replacement or bulk frame downloads.
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const scenes = gsap.matchMedia();
  scenes.add({
    desktop: '(min-width: 1001px) and (min-height: 760px)',
    motion: '(prefers-reduced-motion: no-preference)',
  }, context => {
    const connection = navigator.connection;
    if (!context.conditions.desktop || !context.conditions.motion || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;
    const headerHeight = () => document.querySelector('.header').offsetHeight;
    const hero = document.querySelector('.hero');
    const chapters = document.querySelector('.chapters');
    if (!hero || !chapters) return;

    hero.classList.add('is-animated');
    const opening = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'ecohub-hero', trigger: hero, start: () => `top top+=${headerHeight()}`,
        end: () => `+=${Math.round(innerHeight * .8)}`,
        pin: hero.querySelector('.hero__stage'), scrub: .45, invalidateOnRefresh: true,
      },
    });
    opening.to('.hero__landscape img', { scale: 1.08, duration: 1 }, 0)
      .to('.hero__human-image img', { scale: 1.1, duration: 1 }, 0)
      .to('.hero__human', { rotation: 0, scale: .94, yPercent: 8, borderTopLeftRadius: 32, duration: 1 }, 0)
      .to('.hero__message', { y: -24, opacity: 0, duration: .3 }, .18)
      .fromTo('.hero__connection', { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: .3 }, .5)
      .to('.hero__stage', { clipPath: 'inset(0% 2% 0% 2% round 35px)', duration: .35 }, .65);

    chapters.classList.add('is-enhanced');
    const panels = [...chapters.querySelectorAll('.chapter')];
    const counter = chapters.querySelector('.chapters__counter span');
    gsap.set(panels.slice(1), { opacity: 0, y: 18 });
    const journey = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'ecohub-chapters', trigger: '.chapters__stage',
        start: () => `top top+=${headerHeight() + 8}`,
        end: () => `+=${Math.round(innerHeight * 1.5)}`,
        pin: true, scrub: .35, invalidateOnRefresh: true,
        onUpdate: self => {
          const index = Math.min(2, Math.floor(self.progress * 3));
          counter.textContent = `0${index + 1}`;
          chapters.dataset.chapter = String(index);
        },
      },
    });
    journey.to(panels[0], { opacity: 0, y: -14, duration: .18 }, .8)
      .to(panels[1], { opacity: 1, y: 0, duration: .2 }, 1)
      .to(panels[1], { opacity: 0, y: -14, duration: .18 }, 1.8)
      .to(panels[2], { opacity: 1, y: 0, duration: .2 }, 2)
      .to({}, { duration: .8 }, 2.2);

    return () => {
      hero.classList.remove('is-animated');
      chapters.classList.remove('is-enhanced');
      delete chapters.dataset.chapter;
      counter.textContent = '01';
    };
  });
}
