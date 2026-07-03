/* Tarjetas 3D: inclinación con inercia, brillo que sigue al cursor y
   cálculo del recorrido de scroll interno de las capturas altas. */
import { lerp, prefersReduced, isFinePointer } from './utils.js';

export function initTilt() {
  /* Recorrido del pan interno: cuánto puede desplazarse la captura alta */
  document.querySelectorAll('.frame-view img.tall, .wc-media img').forEach((img) => {
    const setPan = () => {
      const holder = img.closest('.frame-view, .wc-media');
      if (!holder || !img.naturalHeight) return;
      const scale = holder.clientWidth / img.naturalWidth;
      const imgH = img.naturalHeight * scale;
      const overflow = Math.max(imgH - holder.clientHeight, 0);
      const pan = (overflow / imgH) * 100;
      img.closest('[class*="frame"], .work-card')?.style.setProperty('--pan', `${pan.toFixed(2)}%`);
    };
    if (img.complete) setPan();
    else img.addEventListener('load', setPan, { once: true });
    window.addEventListener('resize', setPan, { passive: true });
  });

  if (!isFinePointer || prefersReduced) return;

  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const strength = parseFloat(el.dataset.tilt || '7');
    // Algunos elementos (las capturas del hero) tienen una inclinación de
    // reposo fija vía --base-rx/--base-ry; el resto la tiene en 0 y esto
    // no cambia nada para ellos.
    const cs = getComputedStyle(el);
    const baseRX = parseFloat(cs.getPropertyValue('--base-rx')) || 0;
    const baseRY = parseFloat(cs.getPropertyValue('--base-ry')) || 0;
    let trx = 0, tryy = 0, crx = 0, cry = 0, raf = null, hovering = false;

    const tick = () => {
      crx = lerp(crx, trx, 0.12);
      cry = lerp(cry, tryy, 0.12);
      el.style.transform = `perspective(1100px) rotateX(${(baseRX + crx).toFixed(3)}deg) rotateY(${(baseRY + cry).toFixed(3)}deg) ${hovering ? 'scale(1.012)' : ''}`;
      if (hovering || Math.abs(crx) > 0.05 || Math.abs(cry) > 0.05) raf = requestAnimationFrame(tick);
      else { el.style.transform = ''; raf = null; }
    };

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      trx = (0.5 - py) * strength;
      tryy = (px - 0.5) * strength;
      el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      hovering = true;
      if (!raf) raf = requestAnimationFrame(tick);
    });
    el.addEventListener('pointerleave', () => { trx = tryy = 0; hovering = false; });
  });
}
