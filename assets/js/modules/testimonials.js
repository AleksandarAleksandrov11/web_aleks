/* Testimonios: al pulsar una tarjeta se abre el testimonio completo en un
   popup animado (el texto en la cinta va recortado; aquí se lee entero). */

export function initTestimonials() {
  const modal = document.getElementById('t-modal');
  const cards = document.querySelectorAll('.t-card');
  if (!modal || !cards.length) return;

  const cardEl = modal.querySelector('.t-modal-card');
  const quoteEl = modal.querySelector('.tm-quote');
  const nameEl = modal.querySelector('.tm-name');
  const roleEl = modal.querySelector('.tm-role');
  const avatarEl = modal.querySelector('.tm-avatar');
  let lastFocus = null;
  let lockedScrollY = 0;

  const read = (el) => {
    const cap = el.querySelector('figcaption');
    const strong = cap?.querySelector('strong');
    return {
      quote: el.querySelector('blockquote')?.textContent.trim() || '',
      name: strong?.textContent.trim() || '',
      role: strong?.nextElementSibling?.textContent.trim() || '',
      initials: el.querySelector('.avatar')?.textContent.trim() || '',
    };
  };

  const open = (el) => {
    const t = read(el);
    quoteEl.textContent = t.quote;
    nameEl.textContent = t.name;
    roleEl.textContent = t.role;
    avatarEl.textContent = t.initials;
    lastFocus = document.activeElement;
    modal.hidden = false;
    // Bloqueo de scroll robusto: overflow:hidden solo no basta en iOS Safari,
    // que al aplicarlo a media página desplazada "salta" el fondo arriba.
    // Fijamos el body en su sitio con position:fixed y compensamos con top,
    // así el popup se abre justo donde estabas, sin ningún salto.
    lockedScrollY = window.scrollY;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    requestAnimationFrame(() => modal.classList.add('is-open'));
    // preventScroll: el modal es fixed y ya está centrado en pantalla; sin esto
    // el navegador hace scroll de la página al enfocar (salto innecesario).
    cardEl.focus({ preventScroll: true });
  };

  const close = () => {
    modal.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    window.scrollTo({ top: lockedScrollY, left: 0, behavior: 'instant' });
    setTimeout(() => { modal.hidden = true; }, 420);
    lastFocus?.focus?.({ preventScroll: true });
  };

  // Solo las tarjetas de la pista visible (no las duplicadas aria-hidden) son interactivas
  document.querySelectorAll('.marquee-track:not([aria-hidden="true"]) .t-card').forEach((c) => {
    c.setAttribute('role', 'button');
    c.setAttribute('tabindex', '0');
    c.setAttribute('aria-haspopup', 'dialog');
    c.dataset.cursorLabel = 'Leer ↗';
  });

  document.addEventListener('click', (e) => {
    const c = e.target.closest('.t-card');
    if (c) open(c);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) { close(); return; }
    const c = e.target.closest?.('.t-card');
    if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(c); }
  });
  modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
}
