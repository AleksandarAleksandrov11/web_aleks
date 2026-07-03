/* Piezas pequeñas: acordeones (FAQ y servicios), pausa de marquees
   fuera de pantalla y año del footer. */

export function initMisc() {
  /* Acordeones accesibles: FAQ y servicios comparten el mismo patrón */
  const bindAccordion = (itemSel, headSel, { single = false } = {}) => {
    const items = [...document.querySelectorAll(itemSel)];
    items.forEach((item) => {
      const head = item.querySelector(headSel);
      head?.addEventListener('click', () => {
        const open = !item.classList.contains('is-open');
        if (single && open) {
          items.forEach((o) => {
            if (o !== item) { o.classList.remove('is-open'); o.querySelector(headSel)?.setAttribute('aria-expanded', 'false'); }
          });
        }
        item.classList.toggle('is-open', open);
        head.setAttribute('aria-expanded', String(open));
      });
    });
  };
  bindAccordion('.faq-item', '.faq-q');
  bindAccordion('.svc-item', '.svc-head', { single: true });

  /* Los marquees solo se animan cuando se ven */
  const mio = new IntersectionObserver((entries) => {
    for (const e of entries) e.target.classList.toggle('is-paused', !e.isIntersecting);
  });
  document.querySelectorAll('.marquee').forEach((m) => mio.observe(m));

  /* Año dinámico */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
}
