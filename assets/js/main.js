/* Punto de entrada: arranca cada módulo. Todos degradan con elegancia
   (sin JS la web es 100% legible; con reduced-motion, estática y accesible). */
import { initLoader } from './modules/loader.js';
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
import { initTestimonials } from './modules/testimonials.js';

initLoader();
initTheme();
initNav();
initScroll();
initReveal();
initCursor();
initTilt();
initRotator();
initHeroCanvas();
initForm();
initMisc();
initConsent();
initTestimonials();
