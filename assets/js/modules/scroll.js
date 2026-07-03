/* Scroll: suavizado de rueda (solo puntero fino), parallax, estado del
   header, botón flotante de WhatsApp y progreso de la línea del proceso. */
import { clamp, lerp, ticker, prefersReduced, isFinePointer } from './utils.js';

export function initScroll() {
  const nav = document.querySelector('.nav');
  const wa = document.querySelector('.wa-float');
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
  const steps = document.querySelector('.steps');

  /* --- Rueda suavizada ---
     Modelo propio (target/current) que solo se anima mientras hace falta
     (rAF autogestionado, no depende del ticker compartido). Nunca compara
     contra window.scrollY frame a frame (eso causaba el bug anterior: el
     redondeo de scrollTo desincronizaba `current` y el suavizado se
     detenía casi al instante). En su lugar, seguimos nuestro propio
     modelo y solo lo resincronizamos si detectamos un salto externo grande
     (teclado, barra de scroll, anclas). */
  if (!prefersReduced && isFinePointer) {
    const max = () => document.documentElement.scrollHeight - innerHeight;
    let target = window.scrollY;
    let current = target;
    let expected = target;
    let raf = null;

    function frame() {
      current = lerp(current, target, 0.14);
      if (Math.abs(target - current) < 0.4) current = target;
      expected = Math.round(current);
      // behavior:'instant' es imprescindible: sin él, el scroll-behavior:smooth
      // del <html> reinterpreta cada llamada como una animación nativa propia,
      // que se reinicia en cada frame y apenas deja avanzar el scroll real.
      window.scrollTo({ top: expected, left: 0, behavior: 'instant' });
      raf = current === target ? null : requestAnimationFrame(frame);
    }

    window.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.defaultPrevented) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.target.closest?.('textarea, select, [data-native-scroll], .mobile-menu, .t-modal-card, .cookie-banner')) return;
      e.preventDefault();
      const d = e.deltaMode === 1 ? e.deltaY * 34 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
      target = clamp(target + d, 0, max());
      if (!raf) raf = requestAnimationFrame(frame);
    }, { passive: false });

    // Teclado, barra de scroll o anclas: si el salto real no coincide con lo
    // que esperábamos, cedemos el control y partimos de la posición real.
    window.addEventListener('scroll', () => {
      if (Math.abs(window.scrollY - expected) > 40) {
        target = current = expected = window.scrollY;
      }
    }, { passive: true });
  }

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
