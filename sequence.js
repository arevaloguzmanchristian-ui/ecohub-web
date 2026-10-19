'use strict';

// Photographic galleries follow native scroll; no timer or permanent render loop.
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const scenes = gsap.matchMedia();
  scenes.add({
    desktop: '(min-width: 1001px) and (min-height: 640px)',
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
    const decodedSources = new WeakMap();
    const isReady = image => image.complete && image.naturalWidth > 0 && decodedSources.get(image) === image.currentSrc;
    async function prepareImage(image, render) {
      if (!image.complete || !image.naturalWidth) return;
      const source = image.currentSrc;
      try { if (image.decode) await image.decode(); } catch { return; }
      if (disposed || source !== image.currentSrc) return;
      decodedSources.set(image, source);
      render();
    }
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
    const messages = [...hero.querySelectorAll('.hero__message, .hero__connection, .hero__community')];
    const openingState = { progress: 0 };
    let heroLimits = [1, 1, 1];
    let galleryRequested = false;
    let currentPhoto = -1;
    let heroPinned = false;
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
      const galleryMotion = !hero.classList.contains('is-flow');
      if (galleryMotion && p > .015 && !galleryRequested) {
        const bounds = hero.getBoundingClientRect();
        if (bounds.bottom > headerHeight() && bounds.top < innerHeight) requestGallery();
      }
      const firstBlend = galleryMotion && isReady(photos[1]) ? clamp((p - .36) / .06) : 0;
      const secondBlend = galleryMotion && isReady(photos[2]) ? clamp((p - .68) / .06) : 0;
      slides[0].style.opacity = '1';
      slides[1].style.opacity = String(firstBlend);
      slides[2].style.opacity = String(secondBlend);
      const index = secondBlend >= .5 ? 2 : firstBlend >= .5 ? 1 : 0;
      if (heroPinned) {
        // Photographs blend; copy changes at dominance, never as two overlapping
        // paragraphs or an empty midpoint where the reader can stop scrolling.
        messages.forEach((message, messageIndex) => {
          message.style.opacity = messageIndex === index ? '1' : '0';
          message.style.removeProperty('transform');
        });
      } else {
        messages.forEach((message, index) => { message.style.opacity = index === 0 ? '1' : '0'; message.style.removeProperty('transform'); });
      }
      messages.forEach((message, messageIndex) => {
        if (!galleryMotion) message.removeAttribute('aria-hidden');
        else {
          const hidden = String(messageIndex !== (heroPinned ? index : 0));
          if (message.getAttribute('aria-hidden') !== hidden) message.setAttribute('aria-hidden', hidden);
        }
      });
      const zooms = [
        1 + (heroLimits[0] - 1) * clamp(p / .5),
        1 + (heroLimits[1] - 1) * (1 - clamp((p - .28) / .55)),
        1 + (heroLimits[2] - 1) * clamp((p - .66) / .34),
      ];
      photos.forEach((image, index) => { image.style.transform = `scale(${galleryMotion ? zooms[index] : 1})`; });
      if (currentPhoto !== index) {
        window.ecohubMedia?.setCredit(hero.querySelector('.hero__stage'), photos[index].getAttribute('src').split('/').pop());
        heroCount.textContent = `0${index + 1} / 03`;
        heroLabel.textContent = slides[index].dataset.photoLabel;
        bars.forEach((bar, barIndex) => bar.classList.toggle('is-current', barIndex === index));
        hero.dataset.photo = String(index);
        currentPhoto = index;
      }
      hero.dataset.progress = p.toFixed(4);
    }
    function refreshHero() {
      heroLimits = photos.map((image, index) => safeZoom(image, mobile ? [1.025, 1.02, 1.01][index] : [1.08, 1.055, 1.02][index]));
      if (heroPinned) {
        hero.style.setProperty('--hero-copy-height', `${Math.ceil(Math.max(...messages.map(message => message.scrollHeight)))}px`);
      } else hero.style.removeProperty('--hero-copy-height');
      renderHero();
    }
    hero.classList.add('is-animated');
    let heroScene;
    let heroSignature = '';
    function rebuildHero() {
      hero.classList.remove('is-flow');
      const contentHeight = Math.max(...messages.map(message => message.scrollHeight));
      const actionsHeight = hero.querySelector('.hero__actions').offsetHeight;
      const available = innerHeight - headerHeight();
      const fits = desktop && contentHeight + actionsHeight + 28 + 96 <= available;
      const flow = !mobile && (!desktop || !fits);
      const signature = [innerWidth, innerHeight, headerHeight(), contentHeight, actionsHeight, fits].join('/');
      hero.classList.toggle('is-flow', flow);
      if (signature === heroSignature) return false;
      heroSignature = signature;
      heroScene?.revert();
      heroPinned = fits;
      heroScene = gsap.context(() => {
        const opening = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            id: 'ecohub-hero', trigger: hero, start: () => document.documentElement.classList.contains('visual-ready') ? 'top top' : `top top+=${headerHeight()}`,
            end: () => `+=${Math.round(heroPinned ? innerHeight * 1.25 : hero.querySelector('.hero__stage').offsetHeight * .6)}`,
            pin: heroPinned ? hero.querySelector('.hero__stage') : false,
            scrub: true, invalidateOnRefresh: true, onRefresh: refreshHero,
          },
        });
        opening.fromTo(openingState, { progress: 0 }, { progress: 1, duration: 1, onUpdate: renderHero }, 0);
      });
      refreshHero();
      return true;
    }
    rebuildHero();

    let closeChapters = () => {};
    let chapterScene;
    let chapterSignature = '';
    function rebuildChapters() {
      if (disposed || !desktop) return false;
      const panels = [...chapters.querySelectorAll('.chapter')];
      const copies = panels.map(panel => panel.querySelector('.chapter__copy'));
      const frame = chapters.querySelector('.chapters__frame');
      const heading = frame.querySelector('.section-heading');
      const availability = frame.querySelector('.chapters__availability');
      chapters.classList.add('is-measuring');
      let neededHeight = Math.ceil(Math.max(420, ...copies.map(copy => copy.scrollHeight + 24)));
      const chromeHeight = heading.offsetHeight + parseFloat(getComputedStyle(heading).marginBottom)
        + availability.offsetHeight + parseFloat(getComputedStyle(availability).marginTop);
      chapters.classList.remove('is-measuring');
      // Expanded explanations must fit at their real reading size. A low laptop,
      // narrow window or enlarged font keeps every chapter in normal document flow.
      const availableHeight = innerHeight - headerHeight() - 32;
      const signature = [frame.clientWidth, availableHeight, neededHeight, chromeHeight].join('/');
      if (signature === chapterSignature) return false;
      chapterSignature = signature;
      chapterScene?.revert();
      closeChapters();
      closeChapters = () => {};
      if (neededHeight + chromeHeight > availableHeight) return true;
      neededHeight = Math.floor(availableHeight - chromeHeight);
      chapterScene = gsap.context(() => {
        const stage = chapters.querySelector('.chapters__stage');
        stage.style.setProperty('--chapter-height', `${neededHeight}px`);
        const counter = chapters.querySelector('.chapters__counter span');
        const visual = document.createElement('figure');
        visual.className = 'chapters__visual';
        panels.forEach(panel => { panel.querySelector('figure').inert = true; panel.querySelector('figure').setAttribute('aria-hidden', 'true'); });
        const stack = document.createElement('div');
        stack.className = 'chapters__images';
        const images = panels.map(panel => {
          const image = panel.querySelector('img').cloneNode(true);
          stack.appendChild(image);
          return image;
        });
        const caption = document.createElement('figcaption');
        visual.append(stack, caption);
        stage.appendChild(visual);
        chapters.classList.add('is-enhanced');
        const state = { progress: 0 };
        let limits = [1, 1, 1];
        let current = -1;
        let chapterDisposed = false;
        function renderChapters() {
          if (disposed || chapterDisposed) return;
          const progress = state.progress;
          const firstBlend = isReady(images[1]) ? clamp((progress - .28) / .1) : 0;
          const secondBlend = isReady(images[2]) ? clamp((progress - .62) / .1) : 0;
          const index = secondBlend >= .5 ? 2 : firstBlend >= .5 ? 1 : 0;
          images[0].style.opacity = '1';
          images[1].style.opacity = String(firstBlend);
          images[2].style.opacity = String(secondBlend);
          images.forEach((image, imageIndex) => {
            const local = clamp((progress - [0, .28, .62][imageIndex]) / [.38, .44, .38][imageIndex]);
            image.style.transform = `scale(${1 + (limits[imageIndex] - 1) * local})`;
          });
          if (index !== current) {
            window.ecohubMedia?.setCredit(stack, images[index].getAttribute('src').split('/').pop());
            images.forEach((image, imageIndex) => image.setAttribute('aria-hidden', String(imageIndex !== index)));
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
            id: 'ecohub-chapters', trigger: frame,
            start: () => `top top+=${headerHeight() + 8}`,
            end: () => `+=${Math.round(neededHeight * 1.65)}`,
            pin: frame, scrub: true, invalidateOnRefresh: true, onRefresh: refreshImages,
          },
        });
        journey.fromTo(state, { progress: 0 }, { progress: 1, duration: 1, ease: 'none', onUpdate: renderChapters });
        refreshImages();
        const onImageLoad = event => prepareImage(event.currentTarget, refreshImages);
        images.forEach(image => { image.addEventListener('load', onImageLoad); prepareImage(image, refreshImages); });
        closeChapters = () => {
          chapterDisposed = true;
          images.forEach(image => image.removeEventListener('load', onImageLoad));
          chapters.classList.remove('is-enhanced');
          stage.style.removeProperty('--chapter-height');
          copies.forEach(copy => { copy.style.removeProperty('opacity'); });
          visual.remove();
          panels.forEach(panel => { panel.querySelector('figure').inert = false; panel.querySelector('figure').removeAttribute('aria-hidden'); });
          delete chapters.dataset.chapter;
          delete chapters.dataset.progress;
          counter.textContent = '01';
        };
      });
      return true;
    }
    rebuildChapters();
    let rebuildFrame;
    let lastSize = `${innerWidth}/${innerHeight}`;
    let layoutDirty = false;
    function queueSceneRebuild(event) {
      if (event?.type === 'resize' || event?.type === 'ecohub:layout' || event?.type === 'fonts') layoutDirty = true;
      cancelAnimationFrame(rebuildFrame);
      rebuildFrame = requestAnimationFrame(() => {
        if (disposed) return;
        const heroChanged = rebuildHero();
        const chaptersChanged = rebuildChapters();
        const territoryChanged = updateTerritory();
        if (layoutDirty || heroChanged || chaptersChanged || territoryChanged) ScrollTrigger.refresh();
        layoutDirty = false;
      });
    }
    function onResize() {
      const size = `${innerWidth}/${innerHeight}`;
      if (size === lastSize) return;
      lastSize = size;
      queueSceneRebuild({ type: 'resize' });
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('ecohub:layout', queueSceneRebuild);
    document.fonts?.ready.then(() => { if (!disposed) queueSceneRebuild({ type: 'fonts' }); });
    // One positioning strategy: native sticky, bounded by a three-row grid.
    // Both opaque sheets retain real rows; no margins, extra pin or global fixed layer.
    const territory = document.querySelector('.territory');
    const stack = document.querySelector('.territory-stack');
    const agents = document.querySelector('.agents');
    const continuation = document.querySelector('.territory__continuation');
    const territoryImage = territory?.querySelector('.territory__panorama img');
    let territoryTrack;
    let territorySignature = '';
    function updateTerritory() {
      if (disposed || !stack || !territoryImage) return false;
      const available = innerHeight - headerHeight();
      const textHeight = Math.max(territory.querySelector('.territory__copy').offsetHeight, territory.querySelector('.territory__aside').offsetHeight);
      const fits = desktop && innerHeight >= 740 && isReady(territoryImage) && textHeight <= available;
      const entry = agents.offsetHeight;
      const signature = [fits, available, textHeight, entry].join('/');
      if (signature === territorySignature) return false;
      territorySignature = signature;
      territoryTrack?.kill();
      stack.classList.toggle('is-layered', fits);
      if (!fits) {
        stack.style.removeProperty('--territory-entry');
        delete territory.dataset.curtain;
        return true;
      }
      stack.style.setProperty('--territory-entry', `${agents.offsetHeight}px`);
      // Tracking only: CSS owns positioning and the sheets do all the revealing.
      territoryTrack = ScrollTrigger.create({
        id: 'ecohub-territory', trigger: territory.querySelector('.territory__anchor'),
        start: 'top bottom', endTrigger: continuation, end: () => `top top+=${headerHeight()}`,
        onUpdate: self => { territory.dataset.curtain = self.progress.toFixed(4); },
        onRefresh: self => { territory.dataset.curtain = self.progress.toFixed(4); },
      });
      return true;
    }
    const onTerritoryLoad = () => prepareImage(territoryImage, queueSceneRebuild);
    if (desktop && territoryImage) {
      territoryImage.addEventListener('load', onTerritoryLoad);
      prepareImage(territoryImage, queueSceneRebuild);
    }
    let layoutObserver;
    if ('ResizeObserver' in window) {
      layoutObserver = new ResizeObserver(() => queueSceneRebuild());
      [...messages, hero.querySelector('.hero__actions'), ...chapters.querySelectorAll('.chapter__copy'), territory?.querySelector('.territory__copy'), agents].filter(Boolean).forEach(element => layoutObserver.observe(element));
    }
    queueSceneRebuild({ type: 'fonts' });
    // Image dimensions are reserved in CSS/HTML. Decoding changes readiness and
    // zoom limits, not pin geometry: never rebuild every pin on a gallery load.
    const onHeroLoad = event => prepareImage(event.currentTarget, refreshHero);
    photos.forEach(image => { image.addEventListener('load', onHeroLoad); prepareImage(image, refreshHero); });
    return () => {
      disposed = true;
      photos.forEach(image => image.removeEventListener('load', onHeroLoad));
      window.removeEventListener('resize', onResize);
      window.removeEventListener('ecohub:layout', queueSceneRebuild);
      layoutObserver?.disconnect();
      cancelAnimationFrame(rebuildFrame);
      heroScene?.revert();
      chapterScene?.revert();
      territoryTrack?.kill();
      territoryImage?.removeEventListener('load', onTerritoryLoad);
      stack?.classList.remove('is-layered');
      stack?.style.removeProperty('--territory-entry');
      if (territory) delete territory.dataset.curtain;
      hero.classList.remove('is-animated', 'is-flow');
      hero.style.removeProperty('--hero-copy-height');
      slides.forEach(slide => { slide.style.removeProperty('opacity'); slide.style.removeProperty('clip-path'); });
      photos.forEach(image => { image.style.removeProperty('transform'); });
      messages.forEach(message => { message.style.removeProperty('opacity'); message.style.removeProperty('transform'); message.removeAttribute('aria-hidden'); });
      bars.forEach(bar => bar.classList.remove('is-current'));
      heroCount.textContent = '01 / 03';
      heroLabel.textContent = slides[0].dataset.photoLabel;
      delete hero.dataset.photo;
      delete hero.dataset.progress;
      closeChapters();
    };
  });
}
