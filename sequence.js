'use strict';

// Photographic galleries follow native scroll; no timer or permanent render loop.
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const scenes = gsap.matchMedia();
  scenes.add({
    desktop: '(min-width: 1001px) and (min-height: 760px)',
    mobile: '(max-width: 760px)',
    motion: '(prefers-reduced-motion: no-preference)',
  }, context => {
    const connection = navigator.connection;
    if (!context.conditions.motion || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;
    const desktop = context.conditions.desktop;
    const mobile = context.conditions.mobile;
    const headerHeight = () => document.querySelector('.header').offsetHeight;
    const clamp = value => Math.max(0, Math.min(1, value));
    const hero = document.querySelector('.hero');
    const chapters = document.querySelector('.chapters');
    if (!hero || !chapters) return;
    let disposed = false;
    function safeZoom(image, preferred) {
      if (!image.naturalWidth) return 1;
      const candidate = image.srcset.split(',').map(source => source.trim().split(/\s+/)).find(([url]) => new URL(url, document.baseURI).href === image.currentSrc);
      const width = candidate?.[1]?.endsWith('w') ? parseFloat(candidate[1]) : image.naturalWidth;
      const height = image.naturalHeight * width / image.naturalWidth;
      const fit = Math.max(image.clientWidth / width, image.clientHeight / height);
      return Math.max(1, Math.min(preferred, 1 / fit));
    }

    const slides = [...hero.querySelectorAll('.hero__slide')];
    const photos = slides.map(slide => slide.querySelector('img'));
    const heroCount = hero.querySelector('.hero__photo-count');
    const heroLabel = hero.querySelector('.hero__photo-label');
    const bars = [...hero.querySelectorAll('.hero__photo-bars i')];
    const openingState = { progress: 0 };
    let heroLimits = [1, 1, 1];
    let galleryRequested = false;
    let currentPhoto = -1;
    photos.slice(1).forEach(image => { image.sizes = mobile ? '1100px' : '100vw'; });

    function requestGallery() {
      if (galleryRequested || disposed) return;
      galleryRequested = true;
      photos.slice(1).forEach(image => {
        if (image.getAttribute('src')) return;
        image.fetchPriority = 'low';
        image.decoding = 'async';
        image.srcset = image.dataset.srcset;
        image.src = image.dataset.src;
      });
    }
    function renderHero() {
      if (disposed) return;
      const p = openingState.progress;
      if (p > .015 && !galleryRequested) {
        const bounds = hero.getBoundingClientRect();
        if (bounds.bottom > headerHeight() && bounds.top < innerHeight) requestGallery();
      }
      const ready = photos.map(image => image.complete && image.naturalWidth > 0);
      const firstReveal = clamp((p - .2) / .18);
      const firstBlend = ready[1] ? clamp((p - .2) / .055) : 0;
      const secondBlend = ready[2] ? clamp((p - .6) / .06) : 0;
      slides[0].style.opacity = '1';
      slides[1].style.opacity = String(firstBlend);
      slides[2].style.opacity = String(secondBlend);
      const openMask = (1 - firstReveal) * (mobile ? 3 : 9);
      slides[1].style.clipPath = `inset(${openMask}% ${openMask * .8}% round ${(1 - firstReveal) * (mobile ? 20 : 65)}px)`;
      const closeMask = clamp((p - .8) / .2);
      slides[2].style.clipPath = `inset(${closeMask * (mobile ? 1 : 4)}% ${closeMask * (mobile ? 1 : 3)}% round ${closeMask * (mobile ? 18 : 48)}px)`;
      const zooms = [
        1 + (heroLimits[0] - 1) * clamp(p / .45),
        1 + (heroLimits[1] - 1) * (1 - clamp((p - .2) / .55)),
        1 + (heroLimits[2] - 1) * clamp((p - .6) / .4),
      ];
      photos.forEach((image, index) => { image.style.transform = `scale(${zooms[index]})`; });
      const index = secondBlend >= .5 ? 2 : firstBlend >= .5 ? 1 : 0;
      if (currentPhoto !== index) {
        heroCount.textContent = `0${index + 1} / 03`;
        heroLabel.textContent = slides[index].dataset.photoLabel;
        bars.forEach((bar, barIndex) => bar.classList.toggle('is-current', barIndex === index));
        hero.dataset.photo = String(index);
        currentPhoto = index;
      }
      hero.dataset.progress = p.toFixed(4);
    }
    function refreshHero() {
      heroLimits = photos.map((image, index) => safeZoom(image, mobile ? [1.025, 1.02, 1.025][index] : [1.1, 1.07, 1.055][index]));
      renderHero();
    }
    hero.classList.add('is-animated');
    const opening = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'ecohub-hero', trigger: hero, start: () => `top top+=${headerHeight()}`,
        end: () => `+=${Math.round(desktop ? innerHeight * 1.2 : hero.querySelector('.hero__stage').offsetHeight * .6)}`,
        pin: desktop ? hero.querySelector('.hero__stage') : false,
        scrub: desktop ? .3 : true, invalidateOnRefresh: true, onRefresh: refreshHero,
      },
    });
    opening.fromTo(openingState, { progress: 0 }, { progress: 1, duration: 1, onUpdate: renderHero }, 0);
    if (desktop) {
      opening.to('.hero__message', { y: -18, opacity: 0, duration: .3 }, .18)
        .fromTo('.hero__connection', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .3 }, .48);
    }
    refreshHero();

    let closeChapters = () => {};
    let chapterPhotos = [];
    if (desktop) {
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
      chapterPhotos = images;
      const caption = document.createElement('figcaption');
      visual.append(stack, caption);
      chapters.querySelector('.chapters__stage').appendChild(visual);
      chapters.classList.add('is-enhanced');
      const state = { progress: 0 };
      let limits = [1, 1, 1];
      let current = -1;
      function renderChapters() {
        if (disposed) return;
        const progress = state.progress;
        const index = progress >= .67 ? 2 : progress >= .33 ? 1 : 0;
        images[0].style.opacity = '1';
        images[1].style.opacity = String(clamp((progress - .28) / .1));
        images[2].style.opacity = String(clamp((progress - .62) / .1));
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
      closeChapters = () => {
        chapters.classList.remove('is-enhanced');
        copies.forEach(copy => { copy.style.removeProperty('opacity'); });
        visual.remove();
        delete chapters.dataset.chapter;
        delete chapters.dataset.progress;
        counter.textContent = '01';
      };
    }
    const refresh = () => { if (!disposed) ScrollTrigger.refresh(); };
    [...photos, ...chapterPhotos].forEach(image => image.addEventListener('load', refresh));
    return () => {
      disposed = true;
      [...photos, ...chapterPhotos].forEach(image => image.removeEventListener('load', refresh));
      hero.classList.remove('is-animated');
      slides.forEach(slide => { slide.style.removeProperty('opacity'); slide.style.removeProperty('clip-path'); });
      photos.forEach(image => { image.style.removeProperty('transform'); });
      bars.forEach(bar => bar.classList.remove('is-current'));
      heroCount.textContent = '01 / 03';
      heroLabel.textContent = slides[0].dataset.photoLabel;
      delete hero.dataset.photo;
      delete hero.dataset.progress;
      closeChapters();
    };
  });
}
