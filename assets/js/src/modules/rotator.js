/* Rotador de palabras del hero (kinetic typography con máscara).
   El HTML servido solo lleva la primera palabra como texto real (limpio
   para SEO y accesible vía aria-label en el H1); las demás palabras del
   ciclo se generan aquí en tiempo de ejecución. */
import { prefersReduced } from './utils.js';

export function initRotator() {
  document.querySelectorAll('.rotator[data-words]').forEach((rot) => {
    const list = rot.dataset.words.split(',').map((w) => w.trim()).filter(Boolean);
    if (list.length < 2) return;
    rot.innerHTML = list.map((w) => `<span>${w}</span>`).join('');

    const words = [...rot.querySelectorAll('span')];
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
