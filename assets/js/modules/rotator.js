/* Rotador de palabras del hero (kinetic typography con máscara). */
import { prefersReduced } from './utils.js';

export function initRotator() {
  document.querySelectorAll('.rotator').forEach((rot) => {
    const words = [...rot.querySelectorAll('span')];
    if (words.length < 2) return;
    let i = 0;
    words[0].classList.add('is-in');
    if (prefersReduced) return;
    setInterval(() => {
      const prev = words[i];
      i = (i + 1) % words.length;
      const next = words[i];
      prev.classList.remove('is-in');
      prev.classList.add('is-out');
      next.classList.remove('is-out');
      // reflow para reiniciar la transición desde abajo
      void next.offsetWidth;
      next.classList.add('is-in');
      setTimeout(() => prev.classList.remove('is-out'), 900);
    }, 2800);
  });
}
