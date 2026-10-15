'use strict';

// A real frame sequence, loaded near the viewport with a bounded decoded-image cache.
if (window.gsap && window.ScrollTrigger && 'IntersectionObserver' in window) {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add({
    motion: '(prefers-reduced-motion: no-preference)',
    mobile: '(max-width: 760px)',
  }, context => {
    const connection = navigator.connection;
    if (!context.conditions.motion || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;
    const section = document.querySelector('.sequence');
    const canvas = section?.querySelector('canvas');
    const drawing = canvas?.getContext('2d', { alpha: false });
    if (!drawing) return;
    const mobile = context.conditions.mobile;
    const count = mobile ? 24 : 48;
    const folder = mobile ? 'mobile' : 'desktop';
    const cache = new Map();
    const active = new Map();
    const failed = new Set();
    let target = 0;
    let lastDrawn = -1;
    let frameRequest = 0;
    let disposed = false;
    let started = false;
    let timeline;
    let direction = 1;
    const meter = section.querySelector('.sequence__meter > span');
    const chapter = section.querySelector('.sequence__chapter');
    const chapters = ['01 / Imagina nuevas posibilidades', '02 / Experimenta otras formas', '03 / Transforma con propósito'];

    function draw() {
      frameRequest = 0;
      if (disposed || !cache.size) return;
      const index = [...cache.keys()].reduce((best, value) => Math.abs(value - target) < Math.abs(best - target) ? value : best);
      if (index === lastDrawn) return;
      const image = cache.get(index);
      const ratio = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
      const width = image.naturalWidth * ratio;
      const height = image.naturalHeight * ratio;
      drawing.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      lastDrawn = index;
      canvas.dataset.frame = String(index);
      section.classList.add('is-ready');
    }

    function requestDraw() {
      if (!disposed && !frameRequest) frameRequest = requestAnimationFrame(draw);
    }

    function wanted() {
      const list = [target];
      for (let offset = 1; offset <= 4; offset++) list.push(target + offset * direction, target - offset * direction);
      return list.filter(index => index >= 0 && index < count);
    }

    function pump() {
      if (disposed || !started) return;
      for (const index of wanted()) {
        if (active.size >= 3) break;
        if (cache.has(index) || active.has(index) || failed.has(index)) continue;
        const image = new Image();
        image.decoding = 'async';
        active.set(index, image);
        image.onload = () => {
          active.delete(index);
          if (disposed) return;
          cache.set(index, image);
          while (cache.size > 16) {
            const farthest = [...cache.keys()].sort((a, b) => Math.abs(b - target) - Math.abs(a - target))[0];
            cache.delete(farthest);
          }
          requestDraw();
          pump();
        };
        image.onerror = () => {
          active.delete(index);
          if (disposed) return;
          failed.add(index);
          pump();
        };
        image.src = `assets/sequence/${folder}/${String(index).padStart(3, '0')}.webp`;
      }
    }

    function update(progress) {
      const next = Math.round(progress * (count - 1));
      direction = next >= target ? 1 : -1;
      target = next;
      meter.style.transform = `scaleX(${progress})`;
      const text = chapters[Math.min(2, Math.floor(progress * 3))];
      if (chapter.textContent !== text) chapter.textContent = text;
      requestDraw();
      pump();
    }

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      const maxWidth = mobile ? 480 : 896;
      const scale = Math.min(1.5, maxWidth / Math.max(1, bounds.width));
      canvas.width = Math.max(1, Math.round(bounds.width * scale));
      canvas.height = Math.max(1, Math.round(bounds.height * scale));
      lastDrawn = -1;
      requestDraw();
    }

    // Pin only once on the page; mobile keeps normal scrolling with a shorter sequence.
    section.classList.add('is-animated');
    timeline = ScrollTrigger.create({
      trigger: section,
      start: () => `top top+=${document.querySelector('.header').offsetHeight}`,
      end: () => mobile ? 'bottom top' : `+=${Math.round(innerHeight * 1.5)}`,
      pin: mobile ? false : section.querySelector('.sequence__stage'),
      invalidateOnRefresh: true,
      onUpdate: self => update(self.progress),
      onRefresh: resize,
    });
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      started = true;
      pump();
      observer.disconnect();
    }, { rootMargin: '450px 0px' });
    observer.observe(section);
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(canvas);
    resize();

    return () => {
      disposed = true;
      observer.disconnect();
      sizeObserver.disconnect();
      timeline.kill(true);
      if (frameRequest) cancelAnimationFrame(frameRequest);
      active.forEach(image => { image.onload = null; image.onerror = null; });
      active.clear();
      cache.clear();
      section.classList.remove('is-ready', 'is-animated');
      delete canvas.dataset.frame;
      meter.style.removeProperty('transform');
      chapter.textContent = chapters[0];
      drawing.clearRect(0, 0, canvas.width, canvas.height);
    };
  });
}
