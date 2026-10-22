(() => {
  'use strict';
  if (document.getElementById('pablito-landing')) return;
  const script = document.currentScript;
  const base = new URL('../../', script.src);
  const endpoint = 'https://ecohub.mittril.com/api/asistente-landing-v1.php';
  const sources = { proyecto: 'El proyecto', propuesta: 'Cómo te acompaña', 'para-quien': 'Para quién', sostenibilidad: 'Sostenibilidad', agentes: 'Agentes', territorio: 'Comunidad', preguntas: 'Preguntas frecuentes', registro: 'Prerregistro' };
  const root = document.createElement('aside');
  root.id = 'pablito-landing';
  root.setAttribute('aria-label', 'Ayuda sobre Bolivia EcoHub');
  root.innerHTML = `
    <button class="pl-launch" type="button" aria-expanded="false" aria-controls="pl-dialog">
      <img src="${new URL('assets/agents/pablito-small.webp', base).href}" alt="" width="48" height="60" />
      <span>Pregúntale a Pablito<span>Sobre EcoHub</span></span>
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a3 3 0 0 1-3 3H8l-5 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z"/></svg>
    </button>
    <section id="pl-dialog" class="pl-dialog" role="dialog" aria-modal="false" aria-labelledby="pl-title" hidden>
      <header class="pl-head">
        <img src="${new URL('assets/agents/pablito-small.webp', base).href}" alt="" width="48" height="60" />
        <div><h2 id="pl-title">Pablito</h2><p>Tu guía de la landing EcoHub</p></div>
        <button type="button" class="pl-close" aria-label="Cerrar chat">×</button>
      </header>
      <div class="pl-content">
        <p class="pl-intro">¡Hola! Te ayudo a conocer EcoHub, su propuesta y cómo acceder al prerregistro. Solo respondo sobre lo publicado en esta página.</p>
        <p class="pl-privacy">Asistente con IA. Puede equivocarse: verifica las secciones enlazadas. Tu pregunta se envía a nuestro servidor y a MiniMax. No compartas datos personales ni contraseñas; este chat no registra inscripciones.</p>
        <div class="pl-suggestions" aria-label="Preguntas sugeridas">
          <button type="button">¿Qué es EcoHub?</button>
          <button type="button">¿Para quién es?</button>
          <button type="button">¿Cómo me prerregistro?</button>
        </div>
        <div class="pl-log" role="log" aria-label="Conversación con Pablito" aria-live="polite" aria-relevant="additions"></div>
        <p class="pl-status" role="status"></p>
      </div>
      <form class="pl-form">
        <label for="pl-question">Tu pregunta sobre EcoHub</label>
        <textarea id="pl-question" rows="2" maxlength="1000" placeholder="¿Qué acompañamiento propone?" required></textarea>
        <div class="pl-actions"><a href="https://ecohub.mittril.com/form/">Ir al prerregistro ↗</a><button type="submit">Enviar</button></div>
        <p>Enter: salto de línea · Ctrl/⌘ + Enter: enviar</p>
      </form>
    </section>`;
  document.body.append(root);
  const launcher = root.querySelector('.pl-launch');
  const dialog = root.querySelector('.pl-dialog');
  const closer = root.querySelector('.pl-close');
  const form = root.querySelector('form');
  const input = root.querySelector('textarea');
  const send = root.querySelector('[type="submit"]');
  const log = root.querySelector('.pl-log');
  const status = root.querySelector('.pl-status');
  const content = root.querySelector('.pl-content');
  let pending = null;
  let history = [];

  function setOpen(open) {
    dialog.hidden = !open;
    launcher.hidden = open;
    launcher.setAttribute('aria-expanded', String(open));
    if (open) input.focus({ preventScroll: true });
    else {
      pending?.abort();
      launcher.focus({ preventScroll: true });
    }
  }
  launcher.addEventListener('click', () => setOpen(true));
  closer.addEventListener('click', () => setOpen(false));
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !dialog.hidden) {
      event.preventDefault(); setOpen(false);
    }
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault(); if (!pending) form.requestSubmit();
    }
  });
  root.querySelectorAll('.pl-suggestions button').forEach(button => {
    button.addEventListener('click', () => {
      if (pending) return;
      input.value = button.textContent;
      form.requestSubmit();
    });
  });
  function addMessage(role, text, refs = []) {
    const message = document.createElement('div');
    message.className = `pl-message pl-message--${role}`;
    const label = document.createElement('strong');
    label.textContent = role === 'user' ? 'Tú' : 'Pablito';
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    message.append(label, paragraph);
    const valid = [...new Set(refs)].filter(id => Object.hasOwn(sources, id));
    if (valid.length) {
      const links = document.createElement('div');
      links.className = 'pl-sources';
      valid.forEach(id => {
        const a = document.createElement('a');
        a.href = `#${id}`;
        a.textContent = sources[id];
        a.addEventListener('click', () => setOpen(false));
        links.append(a);
      });
      message.append(links);
    }
    log.append(message);
    // Keep this ephemeral conversation bounded; never store it in browser storage.
    while (log.children.length > 24) log.firstElementChild.remove();
    content.scrollTop = content.scrollHeight;
    return message;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message || pending) return;
    const controller = new AbortController();
    pending = controller;
    const timer = setTimeout(() => controller.abort(), 105000);
    send.disabled = true;
    input.readOnly = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Pablito está consultando la información de la página…';
    const bubble = addMessage('user', message);
    input.value = '';
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'omit', signal: controller.signal,
        body: JSON.stringify({ mensaje: message, historial: history.slice(-6) }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok || typeof data.respuesta !== 'string') {
        throw new Error(data.error || 'No se pudo completar la consulta.');
      }
      if (controller.signal.aborted) return;
      addMessage('assistant', data.respuesta, Array.isArray(data.fuentes) ? data.fuentes : []);
      history.push({ rol: 'user', texto: message }, { rol: 'assistant', texto: data.respuesta });
      history = history.slice(-6);
      status.textContent = '';
    } catch (error) {
      bubble.remove();
      input.value = message;
      status.textContent = error.name === 'AbortError'
        ? 'Consulta cancelada o tiempo de espera agotado. Puedes reintentar.'
        : 'No pudimos responder. ' + (error instanceof TypeError || error instanceof SyntaxError ? 'Revisa tu conexión o consulta las preguntas frecuentes.' : error.message);
    } finally {
      clearTimeout(timer);
      if (pending === controller) pending = null;
      send.disabled = false;
      input.readOnly = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
