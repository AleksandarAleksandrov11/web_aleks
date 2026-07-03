/* Consentimiento de cookies / analítica.
   Vercel Web Analytics y Speed Insights son anónimos y sin cookies, pero solo
   se cargan tras el consentimiento explícito del usuario. La decisión se guarda
   en localStorage (aas_cookie_consent): 'accepted' | 'rejected'. */

const KEY = 'aas_cookie_consent';

function loadVercelAnalytics() {
  if (window.__aasAnalyticsLoaded) return;
  window.__aasAnalyticsLoaded = true;

  // Web Analytics
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  const a = document.createElement('script');
  a.defer = true;
  a.src = '/_vercel/insights/script.js';
  document.head.appendChild(a);

  // Speed Insights
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
  const s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/speed-insights/script.js';
  document.head.appendChild(s);
}

export function initConsent() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch {}

  if (saved === 'accepted') { loadVercelAnalytics(); return; }
  if (saved === 'rejected') { return; }

  const decide = (value) => {
    try { localStorage.setItem(KEY, value); } catch {}
    if (value === 'accepted') loadVercelAnalytics();
    banner.classList.remove('is-visible');
    document.body.classList.remove('cookie-open');
    setTimeout(() => { banner.hidden = true; }, 500);
  };

  banner.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-ck]');
    if (!btn) return;
    decide(btn.dataset.ck === 'accept' ? 'accepted' : 'rejected');
  });

  // Aparece cuando la intro ha terminado (o poco después), sin bloquear el LCP
  const reveal = () => {
    banner.hidden = false;
    document.body.classList.add('cookie-open');
    requestAnimationFrame(() => banner.classList.add('is-visible'));
  };
  if (document.documentElement.classList.contains('intro-done')) {
    setTimeout(reveal, 600);
  } else {
    window.addEventListener('intro:done', () => setTimeout(reveal, 400), { once: true });
    // Salvaguarda por si no hay intro
    setTimeout(() => { if (banner.hidden) reveal(); }, 4200);
  }
}
