'use strict';

// Scroll-composited photographic scenes reuse the images already used on the page.
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
    const sources = ['assets/naturaleza.webp', 'assets/energia.webp', 'assets/comunidad.webp'];
    const images = [];
    const loading = [];
    let progress = 0;
    let frameRequest = 0;
    let disposed = false;
    const chapter = section.querySelector('.sequence__chapter');
    const chapters = ['01 / Conecta con lo que importa', '02 / Activa nuevas posibilidades', '03 / Avanza en comunidad'];
    const state = { progress: 0 };

    function paint(image, zoom, alpha) {
      const ratio = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight) * zoom;
      const width = image.naturalWidth * ratio;
      const height = image.naturalHeight * ratio;
      drawing.globalAlpha = alpha;
      drawing.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    }

    function draw() {
      frameRequest = 0;
      if (disposed) return;
      const position = progress * 2;
      const current = Math.min(2, Math.floor(position));
      const next = Math.min(2, current + 1);
      const blend = position - current;
      const fallback = images.find(Boolean);
      if (!fallback) return;
      drawing.globalAlpha = 1;
      drawing.fillStyle = '#005a85';
      drawing.fillRect(0, 0, canvas.width, canvas.height);
      paint(images[current] || fallback, 1.03 + blend * .07, 1);
      if (next !== current && images[next]) {
        const dissolve = Math.max(0, Math.min(1, (blend - .45) / .5));
        paint(images[next], 1.1 - dissolve * .07, dissolve);
      }
      drawing.globalAlpha = 1;
      canvas.dataset.scene = String(current);
      canvas.dataset.progress = progress.toFixed(3);
      section.classList.add('is-ready');
    }

    function requestDraw() {
      if (!disposed && !frameRequest) frameRequest = requestAnimationFrame(draw);
    }

    function update() {
      progress = state.progress;
      const text = chapters[Math.min(2, Math.floor(progress * 3))];
      if (chapter.textContent !== text) chapter.textContent = text;
      requestDraw();
    }

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      const scale = Math.min(1.5, (mobile ? 560 : 1200) / Math.max(1, bounds.width));
      canvas.width = Math.max(1, Math.round(bounds.width * scale));
      canvas.height = Math.max(1, Math.round(bounds.height * scale));
      requestDraw();
    }

    section.classList.add('is-animated');
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: () => mobile ? 'top 65%' : `top top+=${document.querySelector('.header').offsetHeight}`,
        end: () => mobile ? 'bottom 35%' : `+=${Math.round(innerHeight * 1.8)}`,
        pin: mobile ? false : section.querySelector('.sequence__stage'),
        scrub: .45,
        invalidateOnRefresh: true,
        onRefresh: resize,
      },
    });
    timeline.to(state, { progress: 1, duration: 1, ease: 'none', onUpdate: update }, 0)
      .fromTo('.sequence__word', { y: 25, rotation: 2, opacity: .55 }, {
        y: 0, rotation: 0, opacity: 1, stagger: .115, duration: .22, ease: 'power1.out',
      }, 0)
      .to('.sequence__word--accent', { backgroundSize: '100% 3px', duration: .22, ease: 'none' }, .76)
      .to('.sequence__meter > span', { scaleX: 1, duration: 1, ease: 'none' }, 0);

    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      sources.forEach((source, index) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => {
          if (disposed) return;
          images[index] = image;
          requestDraw();
        };
        image.onerror = () => { /* Keep the poster or another available scene. */ };
        loading.push(image);
        image.src = source;
      });
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
      timeline.scrollTrigger?.kill(true);
      timeline.kill();
      section.querySelectorAll('.sequence__word').forEach(word => {
        word.style.removeProperty('transform');
        word.style.removeProperty('opacity');
        word.style.removeProperty('background-size');
      });
      section.querySelector('.sequence__meter > span').style.removeProperty('transform');
      if (frameRequest) cancelAnimationFrame(frameRequest);
      loading.forEach(image => { image.onload = null; image.onerror = null; });
      images.length = 0;
      section.classList.remove('is-ready', 'is-animated');
      delete canvas.dataset.scene;
      delete canvas.dataset.progress;
      chapter.textContent = chapters[0];
      drawing.clearRect(0, 0, canvas.width, canvas.height);
    };
  });
}
