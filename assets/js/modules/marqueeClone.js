/* Marquees (servicios, testimonios): el HTML servido lleva una sola pista
   con cada elemento una única vez, para no duplicar contenido de cara a un
   analizador SEO. Aquí clonamos esa pista las veces que hagan falta para
   cubrir el ancho de pantalla (bucle continuo sin huecos), y solo si hay
   movimiento real: con prefers-reduced-motion no hace falta ni el doble
   de nodos. */
import { prefersReduced } from './utils.js';

function fill(el) {
  const track = el.querySelector('.marquee-track');
  if (!track) return;
  el.querySelectorAll('.marquee-track[aria-hidden="true"]').forEach((c) => c.remove());
  const trackWidth = track.getBoundingClientRect().width;
  if (!trackWidth) return;
  const target = innerWidth * 2.1; // margen de sobra para que el bucle nunca deje huecos
  const copies = Math.max(1, Math.ceil(target / trackWidth));
  for (let i = 0; i < copies; i++) {
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    el.appendChild(clone);
  }
}

export function initMarqueeClones() {
  if (prefersReduced) return;
  const els = [...document.querySelectorAll('.marquee[data-marquee]')];
  if (!els.length) return;
  els.forEach(fill);
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => els.forEach(fill), 200);
  }, { passive: true });
}
