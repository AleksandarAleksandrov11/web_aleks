/* Cursor personalizado: punto + anillo con retardo + estela dibujada en canvas.
   Solo en punteros finos y sin reduced-motion. */
import { lerp, ticker, prefersReduced, isFinePointer } from './utils.js';

export function initCursor() {
  if (!isFinePointer || prefersReduced) return;

  document.documentElement.classList.add('has-cursor');

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.innerHTML = '<span class="cursor-label" aria-hidden="true"></span>';
  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas, ring, dot);

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  function size() {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
  size();
  window.addEventListener('resize', size, { passive: true });

  const label = ring.querySelector('.cursor-label');
  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;
  let visible = false;
  const trail = [];
  const TRAIL_MAX = 26;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY;
    if (!visible) { visible = true; rx = mx; ry = my; document.body.classList.remove('cursor-hide'); }
  }, { passive: true });

  document.addEventListener('pointerdown', () => document.body.classList.add('cursor-press'));
  document.addEventListener('pointerup', () => document.body.classList.remove('cursor-press'));
  document.addEventListener('mouseleave', () => { document.body.classList.add('cursor-hide'); visible = false; });

  /* Estados según el elemento bajo el cursor */
  const INTERACTIVE = 'a, button, [role="button"], summary, .chip, .theme-toggle';
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest?.(INTERACTIVE + ', [data-cursor-label], input, textarea, select, label');
    document.body.classList.remove('cursor-link', 'cursor-view', 'cursor-text');
    if (!t) return;
    if (t.matches('input, textarea, select, label')) { document.body.classList.add('cursor-text'); return; }
    const viewHost = t.closest('[data-cursor-label]');
    if (viewHost) {
      label.textContent = viewHost.dataset.cursorLabel || 'Ver';
      document.body.classList.add('cursor-view');
      return;
    }
    document.body.classList.add('cursor-link');
  });

  ticker.add(() => {
    rx = lerp(rx, mx, 0.16);
    ry = lerp(ry, my, 0.16);
    dot.style.transform = `translate(${mx}px, ${my}px) ${document.body.classList.contains('cursor-link') ? 'scale(0.5)' : ''}`;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;

    // Estela: polilínea con desvanecimiento
    trail.push({ x: mx, y: my });
    if (trail.length > TRAIL_MAX) trail.shift();
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (visible && trail.length > 2) {
      for (let i = 1; i < trail.length; i++) {
        const a = i / trail.length;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.strokeStyle = `rgba(255,255,255,${(a * 0.32).toFixed(3)})`;
        ctx.lineWidth = a * 2.2;
        ctx.stroke();
      }
    }
  });
}
