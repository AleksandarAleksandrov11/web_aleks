/* Punto de entrada. Se empaqueta con esbuild en un único archivo
   minificado (assets/js/main.js): una sola petición en vez de una cascada
   de módulos. Para regenerarlo, ver assets/js/src/README.md.

   Todos los módulos degradan con elegancia (sin JS la web es 100% legible;
   con reduced-motion, estática y accesible). Lo imprescindible arranca ya;
   lo decorativo espera a que el navegador quede libre, para no competir con
   el primer pintado ni con la interacción. */
import { initTheme } from './modules/theme.js';
import { initNav } from './modules/nav.js';
import { initScroll } from './modules/scroll.js';
import { initReveal } from './modules/reveal.js';
import { initCursor } from './modules/cursor.js';
import { initTilt } from './modules/tilt.js';
import { initRotator } from './modules/rotator.js';
import { initHeroCanvas } from './modules/heroCanvas.js';
import { initForm } from './modules/form.js';
import { initMisc } from './modules/misc.js';
import { initConsent } from './modules/consent.js';
import { initMarqueeClones } from './modules/marqueeClone.js';
import { initTestimonials } from './modules/testimonials.js';
import { initReels } from './modules/reels.js';

initTheme();
initNav();
initScroll();
initReveal();
initRotator();
initForm();
initMisc();
initTestimonials();
initReels();

const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
idle(() => {
  initMarqueeClones();
  initCursor();
  initTilt();
  initHeroCanvas();
  initConsent();
}, { timeout: 1500 });
