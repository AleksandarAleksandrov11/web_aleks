/* Interruptor de tema con revelado circular (View Transitions API).
   El tema inicial lo aplica un script inline en <head> para evitar parpadeos. */
import { prefersReduced } from './utils.js';

export function initTheme() {
  const toggles = document.querySelectorAll('.theme-toggle');
  if (!toggles.length) return;

  const apply = (theme) => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('aas_theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a0a0b' : '#ffffff');
  };

  toggles.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';

      if (prefersReduced || !document.startViewTransition) { apply(next); return; }

      const x = e.clientX || innerWidth - 40;
      const y = e.clientY || 40;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

      document.startViewTransition(() => apply(next)).ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 750, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      });
    });
  });
}
