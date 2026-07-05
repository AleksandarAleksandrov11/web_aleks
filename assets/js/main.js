/* Punto de entrada: arranca cada módulo. Todos degradan con elegancia
   (sin JS la web es 100% legible; con reduced-motion, estática y accesible).

   Los módulos se cargan con la versión de la build (?v=…) heredada de la URL
   de este propio archivo, para que el caché inmutable no sirva versiones
   antiguas de un módulo cuando cambia su contenido. */
const ver = new URL(import.meta.url).search; // "?v=abcd1234" o ""
const load = (name) => import(`./modules/${name}.js${ver}`);

const [
  { initLoader },
  { initTheme },
  { initNav },
  { initScroll },
  { initReveal },
  { initCursor },
  { initTilt },
  { initRotator },
  { initHeroCanvas },
  { initForm },
  { initMisc },
  { initConsent },
  { initMarqueeClones },
  { initTestimonials },
] = await Promise.all([
  load('loader'),
  load('theme'),
  load('nav'),
  load('scroll'),
  load('reveal'),
  load('cursor'),
  load('tilt'),
  load('rotator'),
  load('heroCanvas'),
  load('form'),
  load('misc'),
  load('consent'),
  load('marqueeClone'),
  load('testimonials'),
]);

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
initMarqueeClones();
initTestimonials();
