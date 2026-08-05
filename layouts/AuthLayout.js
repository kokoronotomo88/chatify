/** @module layouts/AuthLayout */

export class AuthLayout {
  /**
   * @param {HTMLElement} container
   * @param {string} html  — inner content
   */
  static render(container, html) {
    container.innerHTML = `
      <div class="auth-layout" role="main">
        <div class="auth-layout__bg">
          <div class="auth-layout__blob auth-layout__blob--1" aria-hidden="true"></div>
          <div class="auth-layout__blob auth-layout__blob--2" aria-hidden="true"></div>
          <div class="auth-layout__blob auth-layout__blob--3" aria-hidden="true"></div>
        </div>
        <div class="auth-layout__content">
          ${html}
        </div>
      </div>`;

    injectStyles();
    return container.querySelector('.auth-layout');
  }
}

function injectStyles() {
  if (document.getElementById('auth-layout-styles')) return;
  const style = document.createElement('style');
  style.id = 'auth-layout-styles';
  style.textContent = `
    .auth-layout {
      position: relative; min-height: 100dvh; min-height: 100vh;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      overflow: hidden; background: var(--bg-primary);
      padding: var(--space-6) var(--space-4);
      padding-top: calc(var(--sat) + var(--space-6));
      padding-bottom: calc(var(--sab) + var(--space-6));
    }
    .auth-layout__bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
    .auth-layout__blob {
      position: absolute; border-radius: 50%;
      filter: blur(80px); opacity: 0.18;
      animation: glowPulse 6s ease-in-out infinite;
    }
    .auth-layout__blob--1 {
      width: 320px; height: 320px; top: -80px; right: -60px;
      background: radial-gradient(circle, #8B5CF6 0%, transparent 70%);
      animation-delay: 0s;
    }
    .auth-layout__blob--2 {
      width: 280px; height: 280px; bottom: -60px; left: -40px;
      background: radial-gradient(circle, #EC4899 0%, transparent 70%);
      animation-delay: 2s;
    }
    .auth-layout__blob--3 {
      width: 200px; height: 200px; top: 50%; left: 50%; transform: translate(-50%,-50%);
      background: radial-gradient(circle, #06B6D4 0%, transparent 70%);
      animation-delay: 4s;
    }
    .auth-layout__content { position: relative; z-index: 1; width: 100%; max-width: 360px; }
  `;
  document.head.appendChild(style);
}
