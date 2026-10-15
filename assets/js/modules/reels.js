/* Reels: cada vídeo se reproduce en silencio solo mientras está en pantalla
   (preload="none": no descarga nada hasta entonces) y se pausa al salir.
   El botón (o un toque en el vídeo) activa el sonido, de uno en uno.
   Sin JS el vídeo lleva controles nativos; con reduced-motion o ahorro de
   datos no hay autoplay y el botón reproduce con sonido. */
import { prefersReduced } from './utils.js';

export function initReels() {
  const vids = [...document.querySelectorAll('video[data-reel]')];
  if (!vids.length) return;
  const auto = !prefersReduced && !navigator.connection?.saveData;

  const boxOf = (v) => v.closest('.reel');
  const sync = (v) => {
    const box = boxOf(v);
    if (!box) return;
    box.classList.toggle('is-unmuted', !v.muted);
    const btn = box.querySelector('.reel-sound');
    if (btn) {
      btn.setAttribute('aria-pressed', String(!v.muted));
      btn.setAttribute('aria-label', v.muted ? 'Activar sonido' : 'Silenciar');
    }
  };
  const muteOthers = (keep) => vids.forEach((v) => {
    if (v === keep || v.muted) return;
    v.muted = true;
    if (!auto) v.pause();
    sync(v);
  });

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target;
      if (e.isIntersecting) {
        if (auto || !v.muted) v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    }
  }, { threshold: 0.35 });

  vids.forEach((v) => {
    v.controls = false;
    v.muted = true;
    io.observe(v);
    const toggle = () => {
      if (v.muted || v.paused) {
        muteOthers(v);
        v.muted = false;
        v.play().catch(() => {});
      } else {
        v.muted = true;
        if (!auto) v.pause();
      }
      sync(v);
    };
    boxOf(v)?.querySelector('.reel-sound')?.addEventListener('click', toggle);
    v.addEventListener('click', toggle);
    sync(v);
  });
}
