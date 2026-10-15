/* Formulario de contacto conversacional: una pregunta a la vez, con
   navegación adelante/atrás, validación en vivo y envío AJAX a FormSubmit.
   Sin JS, los pasos se apilan y el formulario se envía de forma nativa. */

const RULES = {
  name: {
    test: (v) => /^[\p{L}][\p{L}\s'’.-]{1,59}$/u.test(v.trim()),
    msg: 'Solo letras, espacios y guiones (2–60 caracteres).',
  },
  phone: {
    test: (v) => {
      const digits = v.replace(/[^\d]/g, '');
      return /^[+]?[\d\s()-]+$/.test(v.trim()) && digits.length >= 7 && digits.length <= 15;
    },
    msg: 'Introduce un teléfono válido (7–15 dígitos, con prefijo opcional).',
  },
  email: {
    optional: true,
    test: (v) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/.test(v.trim()) && v.trim().length <= 254,
    msg: 'Introduce un correo válido (ej. nombre@dominio.com).',
  },
  message: {
    test: (v) => v.trim().length >= 20 && v.trim().length <= 1200 && !/[<>]/.test(v),
    msg: 'Mínimo 20 caracteres, máximo 1200. Sin caracteres < ni >.',
  },
  social: {
    optional: true,
    test: (v) => v.trim().length <= 200 && !/[<>]/.test(v),
    msg: 'Máximo 200 caracteres, sin < ni >.',
  },
};

const sanitize = (v) => v.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();

export function initForm() {
  const form = document.querySelector('form.qform');
  if (!form) return;

  const steps = [...form.querySelectorAll('.qstep')];
  const total = steps.length;
  if (!total) return;

  const backBtn = form.querySelector('.qform-back');
  const bar = form.querySelector('.qform-bar');
  const countCur = form.querySelector('.qform-count .cur');
  const countTot = form.querySelector('.qform-count .tot');
  const progress = form.querySelector('.qform-progress');
  const consent = form.querySelector('[name="consent"]');
  const globalErr = form.querySelector('.form-global-err');
  const touched = new Set();
  let current = 0;

  const stepKey = (i) => steps[i].dataset.step;
  const fieldOf = (el) => el.querySelector('input:not([type="hidden"]):not([type="checkbox"]), textarea');

  /* El teléfono solo admite caracteres telefónicos al teclear */
  const phoneInput = form.querySelector('[name="phone"]');
  phoneInput?.addEventListener('beforeinput', (e) => {
    if (e.data && !/^[\d\s+()-]+$/.test(e.data)) e.preventDefault();
  });

  /* Contador del mensaje */
  const msgInput = form.querySelector('[name="message"]');
  const msgCount = form.querySelector('.count');
  msgInput?.addEventListener('input', () => {
    if (msgCount) msgCount.textContent = `${msgInput.value.length} / 1200`;
  });

  function validateStep(i, showError) {
    const el = steps[i];
    const key = el?.dataset.step;
    const rule = RULES[key];
    if (!rule) return true; // servicios y repaso no validan campo

    const input = fieldOf(el);
    if (!input) return true;
    const value = input.value;
    const empty = !value.trim();
    const ok = (rule.optional && empty) ? true : (!empty && rule.test(value));

    if (showError || touched.has(key)) {
      el.classList.toggle('is-valid', ok && !empty);
      el.classList.toggle('is-invalid', !ok);
      const err = el.querySelector('.qstep-err');
      if (err) err.textContent = ok ? '' : (empty ? 'Este campo es obligatorio.' : rule.msg);
      input.setAttribute('aria-invalid', String(!ok));
    }
    return ok;
  }

  /* Validación en vivo por campo */
  steps.forEach((el, i) => {
    const key = el.dataset.step;
    const input = fieldOf(el);
    if (!input || !RULES[key]) return;
    input.addEventListener('blur', () => { touched.add(key); validateStep(i, true); });
    input.addEventListener('input', () => { if (touched.has(key)) validateStep(i, false); });
  });

  function updateProgress() {
    const pct = ((current + 1) / total) * 100;
    if (bar) bar.style.width = `${pct}%`;
    if (countCur) countCur.textContent = String(current + 1).padStart(2, '0');
    if (countTot) countTot.textContent = String(total).padStart(2, '0');
    progress?.setAttribute('aria-valuenow', String(current + 1));
    progress?.setAttribute('aria-valuemax', String(total));
    if (backBtn) backBtn.hidden = current === 0;
  }

  function fillSummary() {
    const dl = form.querySelector('.qsummary');
    if (!dl) return;
    const val = (name) => (form.querySelector(`[name="${name}"]`)?.value || '').trim();
    const services = [...form.querySelectorAll('[name="services"]:checked')].map((c) => c.value);
    const rows = [
      ['Nombre', val('name')],
      ['Teléfono', val('phone')],
      ['Email', val('email')],
      ['Necesita', services.join(', ')],
      ['Proyecto', val('message')],
      ['Redes', val('social')],
    ];
    dl.innerHTML = rows.map(([k, v]) => {
      const empty = !v;
      const shown = empty ? 'Sin especificar' : v.replace(/[<>]/g, '');
      return `<div><dt>${k}</dt><dd class="${empty ? 'is-empty' : ''}">${shown}</dd></div>`;
    }).join('');
  }

  function goTo(index, back) {
    if (index < 0 || index >= total) return;
    steps[current].classList.remove('is-active', 'is-back');
    current = index;
    const el = steps[current];
    if (stepKey(current) === 'review') fillSummary();
    el.classList.add('is-active');
    el.classList.toggle('is-back', !!back);
    updateProgress();
    // Enfoca sin desplazar la página (el paso cambia en el mismo sitio)
    const focusEl = el.querySelector('input:not([type="hidden"]), textarea, .btn');
    focusEl?.focus?.({ preventScroll: true });
  }

  function next() {
    const key = stepKey(current);
    touched.add(key);
    if (!validateStep(current, true)) {
      fieldOf(steps[current])?.focus?.({ preventScroll: true });
      return;
    }
    if (current < total - 1) goTo(current + 1, false);
  }

  function back() {
    if (current > 0) goTo(current - 1, true);
  }

  /* Botones Continuar / Saltar / Atrás */
  form.addEventListener('click', (e) => {
    const skip = e.target.closest('.qstep-skip');
    if (skip) {
      const input = fieldOf(steps[current]);
      if (input) { input.value = ''; steps[current].classList.remove('is-valid', 'is-invalid'); }
      goTo(current + 1, false);
      return;
    }
    if (e.target.closest('[data-next]')) { next(); return; }
    if (e.target.closest('[data-back]')) back();
  });

  /* Enter avanza en los pasos con campo de texto (no en el textarea) */
  form.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const t = e.target;
    if (t.tagName === 'TEXTAREA' || t.tagName === 'BUTTON' || t.tagName === 'A') return;
    if (stepKey(current) === 'review') return; // deja que envíe de forma nativa
    e.preventDefault();
    next();
  });

  /* Envío final */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.querySelector('[name="_gotcha"]')?.value) return; // honeypot

    if (stepKey(current) !== 'review') { next(); return; }

    if (consent && !consent.checked) {
      const wrap = consent.closest('.consent');
      wrap.style.color = 'var(--err)';
      consent.addEventListener('change', () => { wrap.style.color = ''; }, { once: true });
      consent.focus({ preventScroll: true });
      return;
    }

    const val = (name) => sanitize(form.querySelector(`[name="${name}"]`)?.value || '');
    const services = [...form.querySelectorAll('[name="services"]:checked')].map((c) => c.value);
    const name = val('name');
    const payload = {
      Nombre: name,
      'Teléfono': val('phone'),
      Email: val('email') || 'Sin especificar',
      Servicios: services.join(', ') || 'Sin especificar',
      Mensaje: val('message'),
      Redes: val('social') || 'Sin especificar',
      _subject: `Nueva solicitud de presupuesto de ${name}`,
      _template: 'table',
      _captcha: 'false',
    };

    const btn = form.querySelector('.btn-submit');
    btn?.classList.add('is-busy');
    if (btn) btn.disabled = true;
    if (globalErr) globalErr.hidden = true;

    const action = form.getAttribute('action') || 'https://formsubmit.co/aaswebmarketing@gmail.com';
    const endpoint = action.replace('formsubmit.co/', 'formsubmit.co/ajax/');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.classList.add('is-sent');
      form.querySelector('.form-success')?.focus?.({ preventScroll: true });
    } catch {
      if (globalErr) globalErr.hidden = false;
    } finally {
      btn?.classList.remove('is-busy');
      if (btn) btn.disabled = false;
    }
  });

  /* Volver a empezar tras enviar */
  form.querySelector('[data-send-another]')?.addEventListener('click', () => {
    form.reset();
    steps.forEach((el) => {
      el.classList.remove('is-valid', 'is-invalid');
      el.querySelector('.qstep-err') && (el.querySelector('.qstep-err').textContent = '');
      fieldOf(el)?.removeAttribute('aria-invalid');
    });
    touched.clear();
    if (msgCount) msgCount.textContent = '0 / 1200';
    if (consent) consent.closest('.consent').style.color = '';
    if (globalErr) globalErr.hidden = true;
    form.classList.remove('is-sent');
    steps[current].classList.remove('is-active', 'is-back');
    current = 0;
    steps[0].classList.add('is-active');
    updateProgress();
    fieldOf(steps[0])?.focus?.({ preventScroll: true });
  });

  updateProgress();
}
