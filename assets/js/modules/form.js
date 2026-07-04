/* Formulario de contacto: validación estricta en vivo, sanitizado y envío
   AJAX a FormSubmit hacia el correo definido en el action del formulario. */

const RULES = {
  name: {
    test: (v) => /^[\p{L}][\p{L}\s'’.-]{1,59}$/u.test(v.trim()),
    msg: 'Solo letras, espacios y guiones (2–60 caracteres).',
  },
  email: {
    test: (v) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/.test(v.trim()) && v.trim().length <= 254,
    msg: 'Introduce un correo válido (ej. nombre@dominio.com).',
  },
  phone: {
    optional: true,
    test: (v) => {
      const digits = v.replace(/[^\d]/g, '');
      return /^[+]?[\d\s()-]+$/.test(v.trim()) && digits.length >= 7 && digits.length <= 15;
    },
    msg: 'Solo números (7–15 dígitos, con prefijo opcional).',
  },
  message: {
    test: (v) => v.trim().length >= 20 && v.trim().length <= 1200 && !/[<>]/.test(v),
    msg: 'Mínimo 20 caracteres, máximo 1200. Sin caracteres < ni >.',
  },
};

const sanitize = (v) => v.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();

export function initForm() {
  const form = document.querySelector('form.form');
  if (!form) return;

  const fields = {};
  ['name', 'email', 'phone', 'message'].forEach((key) => {
    const input = form.querySelector(`[name="${key}"]`);
    if (!input) return;
    fields[key] = { input, wrap: input.closest('.field'), touched: false };
  });

  /* El teléfono solo admite caracteres telefónicos al teclear */
  fields.phone?.input.addEventListener('beforeinput', (e) => {
    if (e.data && !/^[\d\s+()-]+$/.test(e.data)) e.preventDefault();
  });

  /* Contador del mensaje */
  const msgCount = form.querySelector('.count');
  fields.message?.input.addEventListener('input', () => {
    if (msgCount) msgCount.textContent = `${fields.message.input.value.length} / 1200`;
  });

  function validate(key, showError) {
    const f = fields[key];
    if (!f) return true;
    const rule = RULES[key];
    const value = f.input.value;
    const empty = !value.trim();
    let ok;
    if (rule.optional && empty) ok = true;
    else ok = !empty && rule.test(value);

    if (showError || f.touched) {
      f.wrap.classList.toggle('is-valid', ok && !empty);
      f.wrap.classList.toggle('is-invalid', !ok);
      const err = f.wrap.querySelector('.field-err');
      if (err) err.textContent = ok ? '' : (empty ? 'Este campo es obligatorio.' : rule.msg);
      f.input.setAttribute('aria-invalid', String(!ok));
    }
    return ok;
  }

  Object.keys(fields).forEach((key) => {
    const f = fields[key];
    f.input.addEventListener('blur', () => { f.touched = true; validate(key, true); });
    f.input.addEventListener('input', () => { if (f.touched) validate(key, false); });
  });

  const consent = form.querySelector('[name="consent"]');
  const btn = form.querySelector('.btn-submit');
  const globalErr = form.querySelector('.form-global-err');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    /* Honeypot: los bots lo rellenan, las personas no lo ven */
    if (form.querySelector('[name="_gotcha"]')?.value) return;

    let allOk = true;
    Object.keys(fields).forEach((key) => {
      fields[key].touched = true;
      if (!validate(key, true)) allOk = false;
    });
    if (consent && !consent.checked) {
      allOk = false;
      consent.closest('.consent').style.color = 'var(--err)';
      consent.addEventListener('change', () => { consent.closest('.consent').style.color = ''; }, { once: true });
    }
    if (!allOk) {
      form.querySelector('.field.is-invalid input, .field.is-invalid textarea')?.focus();
      return;
    }

    const services = [...form.querySelectorAll('[name="services"]:checked')].map((c) => c.value);
    const payload = {
      Nombre: sanitize(fields.name.input.value),
      Email: sanitize(fields.email.input.value),
      'Teléfono': sanitize(fields.phone?.input.value || 'Sin especificar'),
      Servicios: services.join(', ') || 'Sin especificar',
      Mensaje: sanitize(fields.message.input.value),
      _subject: `Nueva solicitud de presupuesto de ${sanitize(fields.name.input.value)}`,
      _template: 'table',
      _captcha: 'false',
    };

    btn.classList.add('is-busy');
    btn.disabled = true;
    globalErr && (globalErr.hidden = true);

    // El destino se deriva del action del formulario (FormSubmit → variante AJAX)
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
      form.querySelector('.form-success')?.focus?.();
    } catch {
      if (globalErr) globalErr.hidden = false;
    } finally {
      btn.classList.remove('is-busy');
      btn.disabled = false;
    }
  });

  /* Tras enviar, permite volver a rellenar el formulario desde cero */
  form.querySelector('[data-send-another]')?.addEventListener('click', () => {
    form.reset();
    Object.values(fields).forEach((f) => {
      f.touched = false;
      f.wrap.classList.remove('is-valid', 'is-invalid');
      f.input.removeAttribute('aria-invalid');
      const err = f.wrap.querySelector('.field-err');
      if (err) err.textContent = '';
    });
    if (msgCount) msgCount.textContent = '0 / 1200';
    if (consent) consent.closest('.consent').style.color = '';
    globalErr && (globalErr.hidden = true);
    form.classList.remove('is-sent');
    fields.name?.input.focus();
  });
}
