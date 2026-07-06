'use strict';

const EYE_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" stroke-linejoin="round"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_CLOSED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3l18 18" stroke-linecap="round"/><path d="M10.6 5.2A9.8 9.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.4 4.3M6.7 6.7C3.9 8.6 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4-.85" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" stroke-linecap="round"/></svg>';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const THEME_KEY = 'auth-ui-theme';

// The inline script in <head> already set the initial theme (to avoid a
// flash of the wrong one); this just wires up the click to flip it.
document.querySelectorAll('.theme-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
  });
});

document.querySelectorAll('.field-toggle').forEach(btn => {
  btn.innerHTML = EYE_CLOSED;
  const input = btn.previousElementSibling;
  btn.addEventListener('click', () => {
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    btn.innerHTML = showing ? EYE_CLOSED : EYE_OPEN;
    btn.setAttribute('aria-pressed', String(!showing));
    btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  });
});

function setError(field, message) {
  field.classList.toggle('has-error', !!message);
  field.querySelector('.field-error').textContent = message || '';
}

document.querySelectorAll('.auth-form').forEach(form => {
  const fields = [...form.querySelectorAll('.field')];
  const successState = form.parentElement.querySelector('.success-state');

  form.addEventListener('submit', e => {
    e.preventDefault();
    let firstInvalid = null;

    fields.forEach(field => {
      const input = field.querySelector('input');
      const name = input.name;
      const value = input.value.trim();
      let message = '';

      if (!value) {
        message = 'This field is required.';
      } else if (name === 'email' && !EMAIL_RE.test(value)) {
        message = 'Enter a valid email address.';
      } else if ((name === 'password' || name === 'confirmPassword') && value.length < 6) {
        message = 'At least 6 characters.';
      } else if (name === 'confirmPassword') {
        const password = form.querySelector('input[name="password"]').value;
        if (value !== password) message = "Passwords don't match.";
      }

      setError(field, message);
      if (message && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    form.hidden = true;
    successState.hidden = false;
  });

  const resetBtn = successState && successState.querySelector('.js-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      successState.hidden = true;
      form.hidden = false;
      form.reset();
      fields.forEach(field => setError(field, ''));
    });
  }
});
