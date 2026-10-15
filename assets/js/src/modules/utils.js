/* Utilidades compartidas: ticker rAF único, easings y helpers de entorno. */

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* Heurística de equipo modesto: pocos núcleos o poca RAM (deviceMemory solo
   existe en navegadores basados en Chromium, de ahí el valor por defecto
   generoso). Se usa para recortar el trabajo por frame de los efectos más
   costosos (estela del cursor, retícula del hero, partículas de la intro)
   sin desactivar el movimiento por completo. */
export const isLowPower =
  (navigator.hardwareConcurrency || 8) <= 4 ||
  (navigator.deviceMemory || 8) <= 4 ||
  navigator.connection?.saveData === true;

/* Ticker: un único requestAnimationFrame para toda la web. */
const subscribers = new Set();
let running = false;
let last = performance.now();

function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  for (const fn of subscribers) fn(dt, now);
  if (subscribers.size) requestAnimationFrame(loop);
  else running = false;
}

export const ticker = {
  add(fn) {
    subscribers.add(fn);
    if (!running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(loop);
    }
    return () => subscribers.delete(fn);
  },
  remove(fn) { subscribers.delete(fn); },
};

/* Observer perezoso reutilizable */
export function onIntersect(el, cb, options = { threshold: 0.15 }) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) cb(e, io);
  }, options);
  io.observe(el);
  return io;
}

/* Lee una custom property CSS calculada */
export function cssVar(name, el = document.documentElement) {
  return getComputedStyle(el).getPropertyValue(name).trim();
}
