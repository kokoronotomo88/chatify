/** @module utils/modal */

class ModalManager {
  #stack = [];
  #activeBackdrop = null;

  open({ id, html, onClose, center = false }) {
    const backdrop = document.createElement('div');
    backdrop.className = `modal-backdrop${center ? ' modal-backdrop--center' : ''}`;
    backdrop.dataset.modalId = id;

    const modal = document.createElement('div');
    modal.className = `modal${center ? ' modal--center' : ''}`;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `<div class="modal__handle"></div>${html}`;
    backdrop.appendChild(modal);

    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) this.close(id);
    });

    document.body.appendChild(backdrop);
    this.#stack.push({ id, backdrop, onClose });
    this.#activeBackdrop = backdrop;
    document.addEventListener('keydown', this.#onKey);
    return backdrop;
  }

  close(id) {
    const idx = this.#stack.findIndex(m => m.id === id);
    if (idx === -1) return;
    const { backdrop, onClose } = this.#stack[idx];
    backdrop.classList.add('modal-backdrop--exit');
    backdrop.querySelector('.modal')?.classList.add('modal--exit');
    backdrop.addEventListener('animationend', () => {
      backdrop.remove();
      onClose?.();
    }, { once: true });
    setTimeout(() => backdrop.remove(), 600); // fallback
    this.#stack.splice(idx, 1);
  }

  closeTop() {
    const last = this.#stack.at(-1);
    if (last) this.close(last.id);
  }

  #onKey = (e) => {
    if (e.key === 'Escape') this.closeTop();
  };
}

export const modal = new ModalManager();
