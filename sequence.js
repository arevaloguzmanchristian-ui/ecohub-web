'use strict';

// Photo-only scaling: text, captions and controls never inherit a zoom.
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
    function safeZoom(image, preferred) {
      if (!image.naturalWidth) return 1;
      // Width-descriptor srcsets report density-corrected naturalWidth, not decoded pixels.
      const candidate = image.srcset.split(',').map(source => source.trim().split(/\s+/)).find(([url]) => new URL(url, document.baseURI).href === image.currentSrc);
      const width = candidate?.[1]?.endsWith('w') ? parseFloat(candidate[1]) : image.naturalWidth;
      const height = image.naturalHeight * width / image.naturalWidth;
      const fit = Math.max(image.clientWidth / width, image.clientHeight / height);
      return Math.max(1, Math.min(preferred, 1 / fit));
    }
    const landscape = hero.querySelector('.hero__landscape img');
    hero.classList.add('is-animated');
    const opening = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'ecohub-hero', trigger: hero, start: () => `top top+=${headerHeight()}`,
        end: () => `+=${Math.round(innerHeight * .8)}`,
        pin: hero.querySelector('.hero__stage'), scrub: .3, invalidateOnRefresh: true,
      },
    });
    opening.fromTo(landscape, { scale: 1 }, { scale: () => safeZoom(landscape, 1.1), duration: 1 }, 0)
      .to('.hero__message', { y: -18, opacity: 0, duration: .3 }, .18)
      .fromTo('.hero__connection', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .3 }, .48);

    const panels = [...chapters.querySelectorAll('.chapter')];
    const copies = panels.map(panel => panel.querySelector('.chapter__copy'));
    const counter = chapters.querySelector('.chapters__counter span');
    const visual = document.createElement('figure');
    visual.className = 'chapters__visual';
    visual.setAttribute('aria-hidden', 'true');
    const stack = document.createElement('div');
    stack.className = 'chapters__images';
    const images = panels.map(panel => {
      const image = panel.querySelector('img').cloneNode(true);
      stack.appendChild(image);
      return image;
    });
    const caption = document.createElement('figcaption');
    visual.append(stack, caption);
    chapters.querySelector('.chapters__stage').appendChild(visual);
    chapters.classList.add('is-enhanced');
    const state = { progress: 0 };
    const clamp = value => Math.max(0, Math.min(1, value));
    let limits = [1, 1, 1];
    let current = -1;
    let disposed = false;
    function renderChapters() {
      if (disposed) return;
      const progress = state.progress;
      const firstBlend = clamp((progress - .28) / .1);
      const secondBlend = clamp((progress - .62) / .1);
      const index = progress >= .67 ? 2 : progress >= .33 ? 1 : 0;
      // A solid base image prevents empty frames; only photographs crossfade.
      images[0].style.opacity = '1';
      images[1].style.opacity = String(firstBlend);
      images[2].style.opacity = String(secondBlend);
      images.forEach((image, imageIndex) => {
        const local = clamp((progress - [0, .28, .62][imageIndex]) / [.38, .44, .38][imageIndex]);
        image.style.transform = `scale(${1 + (limits[imageIndex] - 1) * local})`;
      });
      if (index !== current) {
        copies.forEach((copy, copyIndex) => { copy.style.opacity = copyIndex === index ? '1' : '0'; });
        caption.textContent = panels[index].querySelector('figcaption').textContent;
        counter.textContent = `0${index + 1}`;
        chapters.dataset.chapter = String(index);
        current = index;
      }
      chapters.dataset.progress = progress.toFixed(4);
    }
    function refreshImages() {
      limits = images.map(image => safeZoom(image, 1.025));
      renderChapters();
    }
    const journey = gsap.timeline({
      scrollTrigger: {
        id: 'ecohub-chapters', trigger: '.chapters__stage',
        start: () => `top top+=${headerHeight() + 8}`,
        end: () => `+=${Math.round(innerHeight * 1.65)}`,
        pin: true, scrub: .25, invalidateOnRefresh: true, onRefresh: refreshImages,
      },
    });
    journey.fromTo(state, { progress: 0 }, { progress: 1, duration: 1, ease: 'none', onUpdate: renderChapters });
    refreshImages();
    const refresh = () => ScrollTrigger.refresh();
    [landscape, ...images].forEach(image => image.addEventListener('load', refresh, { once: true }));
    return () => {
      disposed = true;
      [landscape, ...images].forEach(image => image.removeEventListener('load', refresh));
      hero.classList.remove('is-animated');
      chapters.classList.remove('is-enhanced');
      copies.forEach(copy => { copy.style.removeProperty('opacity'); });
      visual.remove();
      delete chapters.dataset.chapter;
      delete chapters.dataset.progress;
      counter.textContent = '01';
    };
  });
}
