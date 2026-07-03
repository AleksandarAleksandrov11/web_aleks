/* Revelados al hacer scroll: bloques, grupos escalonados, titulares partidos
   por palabras, contadores y zooms de imagen. */
import { prefersReduced } from './utils.js';

export function initReveal() {
  /* Partir titulares en palabras enmascaradas */
  document.querySelectorAll('[data-split]').forEach((el) => {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    const splitNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        const tokens = node.textContent.split(/(\s+)/);
        for (const tk of tokens) {
          if (!tk) continue;
          if (/^\s+$/.test(tk)) { frag.append(document.createTextNode(tk)); continue; }
          const w = document.createElement('span');
          w.className = 'w';
          const wi = document.createElement('span');
          wi.className = 'wi';
          wi.textContent = tk;
          w.append(wi);
          frag.append(w);
        }
        node.replaceWith(frag);
      } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        !node.classList.contains('w') &&
        !node.classList.contains('rotator') &&
        !node.classList.contains('sr-only')
      ) {
        [...node.childNodes].forEach(splitNode);
      }
    };
    [...el.childNodes].forEach(splitNode);
    // La puntuación suelta se une a lo anterior para evitar huérfanos al saltar de línea
    el.querySelectorAll('.w').forEach((w) => {
      if (!/^[.,;:!?…)\]»]+$/.test(w.textContent.trim())) return;
      const prev = w.previousElementSibling;
      if (!prev || w.previousSibling !== prev) return; // solo si es adyacente, sin espacio
      const holder = document.createElement('span');
      holder.style.whiteSpace = 'nowrap';
      prev.replaceWith(holder);
      holder.append(prev, w);
    });
    el.querySelectorAll('.wi').forEach((wi, i) => wi.style.setProperty('--wi', i));
  });

  if (prefersReduced) {
    document.querySelectorAll('[data-reveal], [data-reveal-group], [data-split], [data-zoom]')
      .forEach((el) => el.classList.add('is-in'));
    runCounters(true);
    return;
  }

  /* Promueve a su propia capa SOLO mientras dura la transición (~1,2 s como
     mucho, según el retardo escalonado). Son animaciones de un solo uso: no
     tiene sentido dejar la capa reservada para siempre en cada bloque. */
  function promote(target) {
    const els = target.matches('[data-reveal]') ? [target]
      : target.matches('[data-reveal-group]') ? [...target.children]
      : target.matches('[data-split]') ? [...target.querySelectorAll('.wi')]
      : [];
    els.forEach((el) => { el.style.willChange = 'opacity, transform, filter'; });
    setTimeout(() => els.forEach((el) => { el.style.willChange = ''; }), 1300);
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      promote(e.target);
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('[data-reveal], [data-reveal-group], [data-split], [data-zoom]')
    .forEach((el) => io.observe(el));

  runCounters(false);
}

/* Contadores animados: <b data-count-to="30">0</b> */
function runCounters(instant) {
  const els = document.querySelectorAll('[data-count-to]');
  if (!els.length) return;
  const animate = (el) => {
    const to = parseFloat(el.dataset.countTo);
    if (instant) { el.textContent = to; return; }
    const dur = 1600;
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(to * ease(p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      animate(e.target);
      io.unobserve(e.target);
    }
  }, { threshold: 0.6 });
  els.forEach((el) => (instant ? animate(el) : io.observe(el)));
}
