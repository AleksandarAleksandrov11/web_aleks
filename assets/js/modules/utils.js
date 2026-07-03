/* Utilidades compartidas: ticker rAF único, easings y helpers de entorno. */

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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
