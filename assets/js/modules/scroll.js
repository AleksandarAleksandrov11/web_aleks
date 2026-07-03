/* Scroll: parallax, estado del header, botón flotante de WhatsApp
   y progreso de la línea del proceso. Usa el scroll nativo del navegador
   (fiable en todos los dispositivos); el resto del motion no depende de él. */
import { clamp, ticker, prefersReduced } from './utils.js';

export function initScroll() {
  const nav = document.querySelector('.nav');
  const wa = document.querySelector('.wa-float');
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
  const steps = document.querySelector('.steps');

  /* --- Estados ligados al scroll (un solo listener pasivo) --- */
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (nav) {
      nav.classList.toggle('is-scrolled', y > 24);
      const goingDown = y > lastY + 6 && y > 500;
      const goingUp = y < lastY - 4;
      if (goingDown) nav.classList.add('is-hidden');
      else if (goingUp || y < 500) nav.classList.remove('is-hidden');
    }
    wa?.classList.toggle('is-on', y > 420);
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  // La pista de WhatsApp también aparece pronto en páginas cortas
  if (wa && document.documentElement.scrollHeight <= innerHeight * 1.4) wa.classList.add('is-on');

  /* --- Parallax sutil (expone --py; el elemento decide cómo componerlo) --- */
  if (!prefersReduced && parallaxEls.length) {
    ticker.add(() => {
      const vh = innerHeight;
      for (const el of parallaxEls) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) continue;
        const center = (r.top + r.height / 2 - vh / 2) / vh; // -0.5 … 0.5 aprox
        const speed = parseFloat(el.dataset.parallax || '0.1');
        el.style.setProperty('--py', `${(-center * speed * 100).toFixed(2)}px`);
      }
    });
  }

  /* --- Progreso de la línea del proceso --- */
  if (steps) {
    const items = [...steps.querySelectorAll('.step')];
    ticker.add(() => {
      const r = steps.getBoundingClientRect();
      const total = r.height - innerHeight * 0.5;
      const p = clamp((innerHeight * 0.6 - r.top) / Math.max(total, 1), 0, 1);
      steps.style.setProperty('--p', p.toFixed(4));
      for (const it of items) {
        const ir = it.getBoundingClientRect();
        it.classList.toggle('is-active', ir.top < innerHeight * 0.6 && ir.bottom > innerHeight * 0.25);
      }
    });
  }
}
