/* Piezas pequeñas: acordeón FAQ, miniatura flotante de servicios,
   pausa de marquees fuera de pantalla y año del footer. */
import { lerp, ticker, prefersReduced, isFinePointer } from './utils.js';

export function initMisc() {
  /* FAQ accesible */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    q?.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      q.setAttribute('aria-expanded', String(open));
    });
  });

  /* Los marquees solo se animan cuando se ven */
  const mio = new IntersectionObserver((entries) => {
    for (const e of entries) e.target.classList.toggle('is-paused', !e.isIntersecting);
  });
  document.querySelectorAll('.marquee').forEach((m) => mio.observe(m));

  /* Miniatura que sigue al cursor en las filas de servicios */
  const rows = document.querySelector('.svc-rows');
  if (rows && isFinePointer && !prefersReduced) {
    const peek = document.createElement('div');
    peek.className = 'svc-peek';
    peek.setAttribute('aria-hidden', 'true');
    document.body.append(peek);
    let mx = 0, my = 0, cx = 0, cy = 0, on = false;

    rows.addEventListener('pointermove', (e) => {
      const row = e.target.closest('.svc-row[data-peek]');
      if (!row) { peek.classList.remove('is-on'); on = false; return; }
      mx = e.clientX; my = e.clientY;
      const src = row.dataset.peek;
      const img = peek.querySelector('img');
      if (!img || img.getAttribute('src') !== src) {
        peek.innerHTML = `<img src="${src}" alt="" loading="lazy" decoding="async">`;
      }
      if (!on) { cx = mx; cy = my; on = true; }
      peek.classList.add('is-on');
    });
    rows.addEventListener('pointerleave', () => { peek.classList.remove('is-on'); on = false; });
    ticker.add(() => {
      if (!on) return;
      cx = lerp(cx, mx, 0.14);
      cy = lerp(cy, my, 0.14);
      peek.style.left = `${cx + 26}px`;
      peek.style.top = `${cy - 130}px`;
    });
  }

  /* Año dinámico */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
}
