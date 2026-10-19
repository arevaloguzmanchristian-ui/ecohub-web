'use strict';

// No blocking loader: each reserved image frame owns its skeleton and credit.
(() => {
  const handled = new WeakSet();
  const loaderObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.style.setProperty('--skeleton-play', entry.isIntersecting && !navigator.connection?.saveData ? 'running' : 'paused'));
  }, { rootMargin: '100px' }) : null;
  const credits = fetch('assets/bolivia/credits.json').then(response => {
    if (!response.ok) throw new Error('Image credits unavailable');
    return response.json();
  }).then(items => new Map(items.map(item => [item.file, item]))).catch(() => new Map());
  let creditId = 0;
  const fileOf = image => (image.getAttribute('src') || image.dataset.src || '').split('/').pop().replace(/-(small|medium)\.webp$/, '.webp');
  function setCredit(host, file) {
    if (!host || host.dataset.creditFile === file) return;
    host.dataset.creditFile = file;
    let control = [...host.children].find(child => child.classList.contains('image-credit'));
    if (!control) {
      control = document.createElement('div');
      control.className = 'image-credit';
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'image-credit__toggle';
      toggle.textContent = 'ⓘ';
      toggle.setAttribute('aria-label', 'Créditos de esta imagen');
      toggle.setAttribute('aria-expanded', 'false');
      const body = document.createElement('div');
      body.className = 'image-credit__body';
      body.id = `image-credit-${++creditId}`;
      toggle.setAttribute('aria-controls', body.id);
      control.append(toggle, body);
      host.appendChild(control);
      toggle.addEventListener('click', () => {
        const open = !control.classList.contains('is-open');
        control.classList.toggle('is-open', open);
        control.classList.toggle('is-dismissed', !open);
        toggle.setAttribute('aria-expanded', String(open));
      });
      control.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        control.classList.remove('is-open');
        control.classList.add('is-dismissed');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus({ preventScroll: true });
      });
      host.addEventListener('pointerleave', () => {
        if (host.contains(document.activeElement)) return;
        control.classList.remove('is-dismissed', 'is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
      control.addEventListener('focusout', event => {
        if (control.contains(event.relatedTarget)) return;
        control.classList.remove('is-dismissed', 'is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    }
    control.classList.remove('is-open', 'is-dismissed');
    control.querySelector('button').setAttribute('aria-expanded', 'false');
    const body = control.querySelector('.image-credit__body');
    const fallback = document.createElement('a');
    fallback.href = 'assets/bolivia/credits.json';
    fallback.textContent = 'Fuente y licencia de la imagen';
    body.replaceChildren(fallback);
    credits.then(items => {
      if (!host.isConnected || host.dataset.creditFile !== file) return;
      const item = /^(kibo-pablito|hubito-luca)/.test(file) ? {
        author: 'Concepto facilitado por el equipo', source: 'assets/agents/README.md',
        license: 'Procedencia', license_url: 'assets/agents/concept-sources.json', illustration: true,
      } : items.get(file);
      if (!item) return;
      const author = document.createElement('a');
      author.href = item.source;
      author.textContent = item.author;
      const license = document.createElement('a');
      license.href = item.license_url;
      license.textContent = item.license;
      const modifications = document.createElement('small');
      modifications.textContent = item.illustration ? 'Silueta extraída y adaptada a WebP.' : 'Adaptación WebP y encuadre para la web.';
      body.replaceChildren(document.createTextNode(item.illustration ? 'Ilustración: ' : 'Foto: '), author, document.createTextNode(' · '), license, modifications);
    });
  }
  window.ecohubMedia = { setCredit };

  function enhanceImage(image) {
    if (handled.has(image) || image.closest('.brand,.agent-measure')) return;
    handled.add(image);
    let host = image.parentElement;
    const isHero = !!image.closest('.hero__slide');
    const isChapters = !!image.closest('.chapters__images');
    const isAgent = !!image.closest('.agent-figure');
    if (!isHero && !isChapters && !isAgent && !host.matches('.scene-photo__frame,.territory__panorama,.registration__photo')) {
      const shell = document.createElement('div');
      shell.className = 'image-shell';
      image.before(shell);
      shell.appendChild(image);
      host = shell;
    } else if (host.matches('.scene-photo__frame,.chapters__images,.agent-figure')) host.classList.add('image-shell');
    const creditHost = isHero ? image.closest('.hero__stage') : isChapters ? host : host.matches('.territory__panorama') ? image.closest('.territory__scene') : host.matches('.registration__photo') ? image.closest('.registration') : host;
    if ((!isHero && !isChapters) || !creditHost.dataset.creditFile) setCredit(creditHost, fileOf(image));
    // Blended chapter layers already keep a decoded photograph behind new ones.
    if (isChapters) return;
    if (image.getAttribute('src')) {
      host.classList.add('media-loading');
      loaderObserver?.observe(host);
    }
    let generation = 0;
    async function ready() {
      if (!image.complete || !image.naturalWidth) return;
      const current = ++generation;
      const source = image.currentSrc;
      try { await image.decode(); } catch { if (!image.naturalWidth) { failed(); return; } }
      if (current !== generation || image.currentSrc !== source) return;
      host.classList.remove('media-loading', 'media-failed');
      loaderObserver?.unobserve(host);
      host.style.removeProperty('--skeleton-play');
      host.querySelector('.media-status')?.remove();
    }
    function failed() {
      generation++;
      host.classList.remove('media-loading');
      loaderObserver?.unobserve(host);
      host.style.removeProperty('--skeleton-play');
      host.classList.add('media-failed');
      if (host.querySelector('.media-status')) return;
      const message = document.createElement('span');
      message.className = 'media-status';
      message.textContent = 'Imagen no disponible';
      host.appendChild(message);
    }
    image.addEventListener('load', ready);
    image.addEventListener('error', failed);
    if (image.complete && image.getAttribute('src')) {
      if (image.naturalWidth) ready();
      else failed();
    }
  }
  document.querySelectorAll('main img').forEach(enhanceImage);
  new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.matches('img')) enhanceImage(node);
      node.querySelectorAll('img').forEach(enhanceImage);
    }));
  }).observe(document.querySelector('main'), { childList: true, subtree: true });
})();
