/** @module pages/LoginPage
 *  PIN-based login page with glassmorphism UI.
 */
import { AuthLayout } from '../layouts/AuthLayout.js';
import { authStore }  from '../store/AuthStore.js';
import { router }     from '../router/Router.js';
import { ROUTES }     from '../constants/routes.js';
import { showToast }  from '../utils/toast.js';
import { sleep }      from '../utils/helpers.js';

const PIN_LENGTH = 6;

export class LoginPage {
  static #cleanup = null;

  static render(container) {
    // If already logged in, go to dashboard
    if (authStore.getState().isLoggedIn) {
      router.replace(ROUTES.DASHBOARD);
      return;
    }

    AuthLayout.render(container, LoginPage.#html());
    LoginPage.#setup(container);
  }

  static #html() {
    return `
      <div class="login-page" data-testid="login-page">
        <!-- Logo -->
        <div class="login__logo-wrap" aria-hidden="true">
          <div class="login__logo-ring login__logo-ring--outer"></div>
          <div class="login__logo-ring login__logo-ring--inner"></div>
          <div class="login__logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
        </div>

        <!-- App name -->
        <div class="login__brand">
          <h1 class="login__title gradient-text">Chattify</h1>
          <p class="login__tagline">Connect. Chat. Create.</p>
        </div>

        <!-- Glass card -->
        <div class="login__card glass-card" role="region" aria-label="PIN login">
          <h2 class="login__card-title">Enter your PIN</h2>
          <p class="login__card-hint">Enter your 6-digit PIN to continue</p>

          <!-- PIN slots -->
          <div class="pin-input" role="group" aria-label="PIN input" data-testid="pin-input">
            ${Array.from({ length: PIN_LENGTH }, (_, i) => `
              <div class="pin-input__slot" data-index="${i}" aria-hidden="true">
                <div class="pin-input__dot"></div>
              </div>
            `).join('')}
          </div>

          <!-- Hidden real input -->
          <input
            type="password"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="${PIN_LENGTH}"
            id="pin-real-input"
            class="pin-input__real"
            autocomplete="one-time-code"
            aria-label="PIN code"
            data-testid="input-pin"
          />

          <!-- Error -->
          <p class="login__error" id="pin-error" role="alert" aria-live="polite" hidden></p>

          <!-- Numeric keypad -->
          <div class="login__keypad" role="group" aria-label="Numeric keypad">
            ${[1,2,3,4,5,6,7,8,9,'','0','⌫'].map(k => `
              <button
                class="keypad-btn${k === '' ? ' keypad-btn--empty' : ''}"
                data-key="${k}"
                ${k === '' ? 'aria-hidden="true" tabindex="-1"' : `aria-label="${k === '⌫' ? 'Delete' : k}"`}
                data-testid="button-key-${k}"
              >${k}</button>
            `).join('')}
          </div>

          <!-- Forgot PIN -->
          <button class="login__forgot" data-testid="button-forgot-pin" aria-label="Forgot PIN">
            Forgot PIN? <span class="badge badge--subtle">Coming soon</span>
          </button>
        </div>

        <!-- Version -->
        <p class="login__version" aria-label="App version">v${window.__app?.version ?? '1.0.0'}</p>
      </div>
    `;
  }

  static #setup(container) {
    const pinInput   = container.querySelector('#pin-real-input');
    const slots      = container.querySelectorAll('.pin-input__slot');
    const errorEl    = container.querySelector('#pin-error');
    const keypadBtns = container.querySelectorAll('.keypad-btn:not(.keypad-btn--empty)');
    let   pin        = '';
    let   isLoading  = false;

    const updateSlots = () => {
      slots.forEach((slot, i) => {
        const filled = i < pin.length;
        slot.classList.toggle('pin-input__slot--filled', filled);
        slot.classList.toggle('pin-input__slot--active', i === pin.length);
        slot.querySelector('.pin-input__dot').textContent = filled ? '●' : '';
      });
    };

    const showError = (msg) => {
      errorEl.textContent = msg;
      errorEl.hidden = false;
      container.querySelector('.pin-input').classList.add('pin-input--error');
      // Shake animation
      container.querySelector('.pin-input').animate(
        [{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }],
        { duration: 300, easing: 'ease-out' }
      );
      setTimeout(() => {
        errorEl.hidden = true;
        container.querySelector('.pin-input').classList.remove('pin-input--error');
      }, 2500);
    };

    const clearError = () => {
      errorEl.hidden = true;
      container.querySelector('.pin-input').classList.remove('pin-input--error');
    };

    const addDigit = (digit) => {
      if (isLoading || pin.length >= PIN_LENGTH) return;
      clearError();
      pin += digit;
      updateSlots();
      if (pin.length === PIN_LENGTH) attemptLogin();
    };

    const removeDigit = () => {
      if (isLoading || pin.length === 0) return;
      pin = pin.slice(0, -1);
      updateSlots();
    };

    const attemptLogin = async () => {
      if (isLoading) return;
      isLoading = true;

      // Visual loading on all slots
      slots.forEach(s => s.classList.add('pin-input__slot--loading'));

      try {
        await sleep(500); // brief animation
        await authStore.login(pin);
        // Success
        slots.forEach(s => s.classList.remove('pin-input__slot--loading'));
        slots.forEach(s => s.classList.add('pin-input__slot--success'));
        await sleep(400);
        router.push(ROUTES.DASHBOARD);
      } catch (err) {
        slots.forEach(s => s.classList.remove('pin-input__slot--loading'));
        pin = '';
        updateSlots();
        showError(err.message || 'Invalid PIN. Please try again.');
        isLoading = false;
      }
    };

    // Keypad click handlers
    keypadBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        if (key === '⌫') removeDigit();
        else if (/^\d$/.test(key)) addDigit(key);
      });
    });

    // Physical keyboard
    const onKeydown = (e) => {
      if (/^\d$/.test(e.key)) addDigit(e.key);
      else if (e.key === 'Backspace') removeDigit();
      else if (e.key === 'Enter' && pin.length === PIN_LENGTH) attemptLogin();
    };
    document.addEventListener('keydown', onKeydown);

    // Focus hidden input for mobile
    container.querySelector('.pin-input').addEventListener('click', () => pinInput.focus());
    pinInput.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      pin = val.slice(0, PIN_LENGTH);
      e.target.value = '';
      updateSlots();
      if (pin.length === PIN_LENGTH) attemptLogin();
    });

    // Initial render
    updateSlots();
    setTimeout(() => pinInput.focus(), 100);

    // Cleanup
    LoginPage.#cleanup = () => document.removeEventListener('keydown', onKeydown);

    // Inject page styles
    LoginPage.#injectStyles();
  }

  static #injectStyles() {
    if (document.getElementById('login-page-styles')) return;
    const s = document.createElement('style');
    s.id = 'login-page-styles';
    s.textContent = `
      .login-page { display: flex; flex-direction: column; align-items: center; gap: var(--space-6); width: 100%; }

      /* Logo */
      .login__logo-wrap { position: relative; width: 96px; height: 96px; display: flex; align-items: center; justify-content: center; }
      .login__logo-ring {
        position: absolute; border-radius: 50%;
        border: 2px solid transparent;
        background: var(--gradient-brand) border-box;
        -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: destination-out; mask-composite: exclude;
        animation: spin 8s linear infinite;
      }
      .login__logo-ring--outer { width: 96px; height: 96px; animation-duration: 8s; }
      .login__logo-ring--inner { width: 76px; height: 76px; animation-direction: reverse; animation-duration: 5s; }
      .login__logo-icon {
        width: 56px; height: 56px; border-radius: 50%;
        background: var(--gradient-brand);
        display: flex; align-items: center; justify-content: center;
        color: #fff; box-shadow: var(--shadow-brand);
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* Brand */
      .login__brand { text-align: center; }
      .login__title { font-size: var(--fs-4xl); margin-bottom: var(--space-1); letter-spacing: var(--ls-tight); }
      .login__tagline { color: var(--text-tertiary); font-size: var(--fs-sm); letter-spacing: var(--ls-wider); text-transform: uppercase; }

      /* Card */
      .login__card { padding: var(--space-8); text-align: center; width: 100%; }
      .login__card-title { font-size: var(--fs-lg); font-weight: var(--fw-semibold); margin-bottom: var(--space-1); }
      .login__card-hint { color: var(--text-tertiary); font-size: var(--fs-sm); margin-bottom: var(--space-6); }

      /* Error */
      .login__error { color: var(--color-error); font-size: var(--fs-sm); margin-top: var(--space-3); }

      /* Keypad */
      .login__keypad { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); margin-top: var(--space-6); }
      .keypad-btn {
        height: 56px; border-radius: var(--radius-lg); font-size: var(--fs-xl);
        font-weight: var(--fw-semibold); color: var(--text-primary);
        background: var(--bg-surface); border: 1px solid var(--border-subtle);
        transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
        display: flex; align-items: center; justify-content: center;
      }
      .keypad-btn:active { background: var(--bg-elevated); transform: scale(0.95); }
      .keypad-btn--empty { background: transparent; border-color: transparent; pointer-events: none; }

      /* Forgot */
      .login__forgot { margin-top: var(--space-5); color: var(--text-tertiary); font-size: var(--fs-sm); display: flex; align-items: center; gap: var(--space-2); }

      /* Version */
      .login__version { color: var(--text-muted); font-size: var(--fs-xs); }

      /* Glass card */
      .glass-card {
        background: rgba(26,26,46,0.7); backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid var(--border-default); border-radius: var(--radius-2xl);
        box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.06);
      }

      /* Gradient text */
      .gradient-text {
        background: var(--gradient-brand-h);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      /* Offline banner */
      .offline-banner {
        position: fixed; top: calc(var(--sat) + var(--space-3)); left: 50%; transform: translateX(-50%);
        background: rgba(239,68,68,0.9); backdrop-filter: blur(8px);
        color: #fff; padding: var(--space-2) var(--space-4);
        border-radius: var(--radius-pill); font-size: var(--fs-sm);
        display: flex; align-items: center; gap: var(--space-2);
        z-index: var(--z-toast); box-shadow: var(--shadow-md);
      }
    `;
    document.head.appendChild(s);
  }
}
