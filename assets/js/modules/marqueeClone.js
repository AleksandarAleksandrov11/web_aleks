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
  // La pista original lleva corriendo desde la carga (o desde antes de este
  // resize), así que ya tiene una fase de animación en marcha. Si los clones
  // nuevos arrancan en 0 se desincronizan del original y, al reconstruirse
  // en un resize, las tarjetas acaban solapándose/atropellándose entre sí.
  const originalAnim = track.getAnimations()[0];
  const currentTime = originalAnim?.currentTime;
  for (let i = 0; i < copies; i++) {
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    el.appendChild(clone);
    const cloneAnim = clone.getAnimations()[0];
    if (cloneAnim && currentTime != null) cloneAnim.currentTime = currentTime;
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
