/* Campo de puntos interactivo del hero: una retícula serena que respira
   y se aparta suavemente del cursor. Se pausa fuera de pantalla. */
import { ticker, prefersReduced, cssVar } from './utils.js';

export function initHeroCanvas() {
  const canvas = document.querySelector('.hero-canvas');
  if (!canvas || prefersReduced) return;

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W, H, dots = [];
  const GAP = 34;

  function build() {
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = [];
    for (let y = GAP / 2; y < H; y += GAP) {
      for (let x = GAP / 2; x < W; x += GAP) {
        dots.push({ ox: x, oy: y, x, y });
      }
    }
  }
  build();
  window.addEventListener('resize', build, { passive: true });

  let mx = -9999, my = -9999;
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
  }, { passive: true });
  canvas.parentElement.addEventListener('pointerleave', () => { mx = my = -9999; });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  let ink = '12,12,13';
  const readInk = () => {
    ink = document.documentElement.dataset.theme === 'dark' ? '244,244,242' : '12,12,13';
  };
  readInk();
  new MutationObserver(readInk).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const R = 130;
  ticker.add((dt, now) => {
    if (!visible || document.hidden) return;
    ctx.clearRect(0, 0, W, H);
    const breathe = Math.sin(now * 0.0008) * 0.35 + 0.65;
    for (const d of dots) {
      const dx = d.ox - mx, dy = d.oy - my;
      const dist = Math.hypot(dx, dy);
      let px = d.ox, py = d.oy, boost = 0;
      if (dist < R) {
        const f = (1 - dist / R);
        const force = f * f * 16;
        px += (dx / (dist || 1)) * force;
        py += (dy / (dist || 1)) * force;
        boost = f * 0.35;
      }
      d.x += (px - d.x) * 0.09;
      d.y += (py - d.y) * 0.09;
      // Desvanecer hacia el centro-izquierda para no competir con el texto
      const edge = Math.min(d.oy / H + 0.25, 1) * Math.min((W - d.ox) / (W * 0.75) + 0.15, 1);
      const a = (0.05 + boost) * breathe * edge;
      if (a < 0.012) continue;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 1 + boost * 2.4, 0, 6.2832);
      ctx.fillStyle = `rgba(${ink},${a.toFixed(3)})`;
      ctx.fill();
    }
  });
}
