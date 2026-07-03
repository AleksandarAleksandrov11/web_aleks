/* Header: roll tipográfico por letras, menú móvil, botones magnéticos
   y prefetch de páginas internas al pasar el cursor. */
import { lerp, ticker, prefersReduced, isFinePointer } from './utils.js';

export function initNav() {
  /* Duplicado por letras para el roll sans → serif */
  document.querySelectorAll('.nav-link').forEach((link) => {
    const text = link.textContent.trim();
    link.setAttribute('aria-label', text);
    const roll = document.createElement('span');
    roll.className = 'roll';
    roll.setAttribute('aria-hidden', 'true');
    [...text].forEach((ch, i) => {
      const cell = document.createElement('span');
      cell.className = 'ch';
      cell.style.setProperty('--i', i);
      cell.innerHTML = `<span class="ch ch-a" style="--i:${i}">${ch === ' ' ? '&nbsp;' : ch}</span><span class="ch ch-b" style="--i:${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`;
      // Estructura: celda relativa con capa A (sans) y capa B (serif)
      cell.style.position = 'relative';
      cell.style.display = 'inline-block';
      roll.append(cell);
    });
    link.textContent = '';
    link.append(roll);
  });

  /* Menú móvil */
  const burger = document.querySelector('.nav-burger');
  const menu = document.querySelector('.mobile-menu');
  if (burger && menu) {
    menu.querySelectorAll('.mobile-link').forEach((a, i) => a.style.setProperty('--i', i));
    const toggle = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      document.documentElement.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggle(burger.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) toggle(false); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });
  }

  /* Botones magnéticos */
  if (isFinePointer && !prefersReduced) {
    document.querySelectorAll('.btn, .theme-toggle, .wa-float').forEach((el) => {
      let tx = 0, ty = 0, cx = 0, cy = 0, active = false, raf = null;
      const strength = el.classList.contains('wa-float') ? 0.22 : 0.32;
      const tick = () => {
        cx = lerp(cx, tx, 0.18); cy = lerp(cy, ty, 0.18);
        el.style.translate = `${cx.toFixed(2)}px ${cy.toFixed(2)}px`;
        if (active || Math.abs(cx) > 0.2 || Math.abs(cy) > 0.2) raf = requestAnimationFrame(tick);
        else { el.style.translate = ''; raf = null; }
      };
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        tx = (e.clientX - r.left - r.width / 2) * strength;
        ty = (e.clientY - r.top - r.height / 2) * strength;
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
        active = true;
        if (!raf) raf = requestAnimationFrame(tick);
      });
      el.addEventListener('pointerleave', () => { tx = ty = 0; active = false; });
    });
  }

  /* Prefetch al pasar el cursor por enlaces internos */
  const prefetched = new Set();
  document.addEventListener('pointerover', (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a || a.origin !== location.origin || prefetched.has(a.pathname)) return;
    if (a.pathname === location.pathname || a.hash) return;
    prefetched.add(a.pathname);
    const l = document.createElement('link');
    l.rel = 'prefetch';
    l.href = a.href;
    document.head.append(l);
  });
}
