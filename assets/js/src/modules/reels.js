/* Reels: cada vídeo se reproduce en silencio solo mientras está en pantalla
   (preload="none": no descarga nada hasta acercarse) y se pausa al salir.
   El botón (o un toque en el vídeo) activa el sonido, de uno en uno.
   Sin JS el vídeo lleva controles nativos; con reduced-motion o ahorro de
   datos no hay autoplay y el botón reproduce con sonido. */
import { prefersReduced } from './utils.js';

export function initReels() {
  const vids = [...document.querySelectorAll('video[data-reel]')];
  if (!vids.length) return;
  const auto = !prefersReduced && !navigator.connection?.saveData;
  // Ningún vídeo se descarga ni arranca hasta que la página ha terminado de
  // cargar: el texto, las imágenes y las fuentes van primero.
  let ready = document.readyState === 'complete';
  if (!ready) {
    window.addEventListener('load', () => {
      ready = true;
      vids.forEach((v) => { if (v.dataset.inview) v.play().catch(() => {}); });
    }, { once: true });
  }

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
        if (auto) v.dataset.inview = '1';
        if ((auto && ready) || !v.muted) v.play().catch(() => {});
      } else {
        delete v.dataset.inview;
        if (!v.paused) v.pause();
      }
    }
  }, { threshold: 0.35 });

  // Precarga un poco antes de que el vídeo entre en pantalla: así arranca
  // al instante sin descargar de golpe los que quedan lejos.
  const near = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const v = e.target;
      // Sin load(): no debe cortar una reproducción ya iniciada
      if (auto && ready && v.preload === 'none') v.preload = 'auto';
      near.unobserve(v);
    }
  }, { rootMargin: '300px 0px' });

  // Pósters diferidos (data-poster): se piden cuando el bloque de vídeos se
  // acerca a la pantalla, no en la carga inicial de la página.
  const posterIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.querySelectorAll('video[data-poster]').forEach((v) => {
        v.poster = v.dataset.poster;
        v.removeAttribute('data-poster');
      });
      posterIO.unobserve(e.target);
    }
  }, { rootMargin: '600px 0px' });
  new Set(vids.map((v) => v.closest('.reels-grid, .case-phones') || v.parentElement)).forEach((box) => posterIO.observe(box));

  vids.forEach((v) => {
    v.controls = false;
    v.muted = true;
    io.observe(v);
    near.observe(v);
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
