/** @module pages/StoryPage
 *  Full-screen story viewer with progress bar, tap navigation.
 */
import { router } from '../router/Router.js';
import { sleep }  from '../utils/helpers.js';

const MOCK_STORIES = {
  u1: { name: 'Alex', color: 'linear-gradient(135deg,#8B5CF6,#EC4899)',  items: [{ type: 'text', content: 'Living my best life! ✨', bg: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }, { type: 'text', content: 'New project dropping soon 🚀', bg: 'linear-gradient(135deg,#06B6D4,#8B5CF6)' }] },
  u2: { name: 'Maya', color: 'linear-gradient(135deg,#06B6D4,#8B5CF6)',  items: [{ type: 'text', content: 'Coffee + code = ❤️', bg: 'linear-gradient(135deg,#F97316,#EC4899)' }] },
  u3: { name: 'Jordan', color: 'linear-gradient(135deg,#F97316,#EC4899)', items: [{ type: 'text', content: 'Weekend vibes only 🎶', bg: 'linear-gradient(135deg,#84CC16,#06B6D4)' }] },
  u4: { name: 'Sam',  color: 'linear-gradient(135deg,#84CC16,#06B6D4)',  items: [{ type: 'text', content: 'Gym done ✅💪', bg: 'linear-gradient(135deg,#8B5CF6,#84CC16)' }] },
};

export class StoryPage {
  static #timer = null;
  static #current = 0;

  static render(container, userId) {
    const story = MOCK_STORIES[userId] ?? { name: 'Story', color: 'var(--gradient-brand)', items: [{ type: 'text', content: '...', bg: 'var(--gradient-brand)' }] };
    StoryPage.#current = 0;

    container.innerHTML = `
      <div class="story-viewer" data-testid="story-viewer">
        <!-- Progress bars -->
        <div class="story-progress" role="progressbar" aria-label="Story progress" data-testid="story-progress">
          ${story.items.map((_, i) => `
            <div class="story-progress__bar">
              <div class="story-progress__fill" id="prog-${i}" style="width:${i === 0 ? '0%' : '0%'}"></div>
            </div>
          `).join('')}
        </div>

        <!-- Header -->
        <header class="story-header" role="banner">
          <div class="story-header__user">
            <div class="avatar" style="--avatar-size:36px; background:${story.color}">
              <div class="avatar__fallback" style="font-size:14px">${story.name[0]}</div>
            </div>
            <div>
              <p class="story-header__name" data-testid="text-story-name">${story.name}</p>
              <p class="story-header__time">Just now</p>
            </div>
          </div>
          <button class="story-close-btn" id="btn-story-close" aria-label="Close story" data-testid="button-close-story">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </header>

        <!-- Story content -->
        <div class="story-content" id="story-content" data-testid="story-content" role="main">
          <!-- Populated by render -->
        </div>

        <!-- Tap zones -->
        <div class="story-tap-zones">
          <div class="story-tap-zone story-tap-zone--prev" id="tap-prev" role="button" aria-label="Previous story" data-testid="button-story-prev"></div>
          <div class="story-tap-zone story-tap-zone--next" id="tap-next" role="button" aria-label="Next story"     data-testid="button-story-next"></div>
        </div>

        <!-- Reply input -->
        <div class="story-reply safe-bottom" role="form" aria-label="Reply to story">
          <input
            type="text" class="story-reply__input"
            placeholder="Reply to ${story.name}…"
            aria-label="Reply to story"
            data-testid="input-story-reply"
          />
          <button class="story-reply__send" aria-label="Send reply" data-testid="button-story-reply">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    `;

    StoryPage.#showItem(container, story, StoryPage.#current);
    StoryPage.#bindEvents(container, story);
    StoryPage.#injectStyles();
  }

  static #showItem(container, story, idx) {
    const item    = story.items[idx];
    const content = container.querySelector('#story-content');
    if (!content || !item) return;

    // Reset all progress fills
    story.items.forEach((_, i) => {
      const fill = container.querySelector(`#prog-${i}`);
      if (fill) fill.style.width = i < idx ? '100%' : '0%';
    });

    // Render item
    content.style.background = item.bg;
    content.innerHTML = item.type === 'text'
      ? `<div class="story-text-card"><p class="story-text">${item.content}</p></div>`
      : `<img src="${item.src}" alt="Story image" class="story-image" />`;

    // Animate progress bar
    const fill = container.querySelector(`#prog-${idx}`);
    if (fill) {
      fill.style.transition = 'none';
      fill.style.width = '0%';
      requestAnimationFrame(() => {
        fill.style.transition = 'width 5s linear';
        fill.style.width = '100%';
      });
    }

    // Auto advance
    clearTimeout(StoryPage.#timer);
    StoryPage.#timer = setTimeout(() => StoryPage.#next(container, story), 5000);
  }

  static #next(container, story) {
    if (StoryPage.#current < story.items.length - 1) {
      StoryPage.#current++;
      StoryPage.#showItem(container, story, StoryPage.#current);
    } else {
      clearTimeout(StoryPage.#timer);
      router.back();
    }
  }

  static #prev(container, story) {
    if (StoryPage.#current > 0) {
      StoryPage.#current--;
      StoryPage.#showItem(container, story, StoryPage.#current);
    }
  }

  static #bindEvents(container, story) {
    container.querySelector('#btn-story-close')?.addEventListener('click', () => {
      clearTimeout(StoryPage.#timer);
      router.back();
    });
    container.querySelector('#tap-prev')?.addEventListener('click', () => StoryPage.#prev(container, story));
    container.querySelector('#tap-next')?.addEventListener('click', () => StoryPage.#next(container, story));

    container.querySelector('.story-reply__send')?.addEventListener('click', () => {
      const input = container.querySelector('.story-reply__input');
      if (input?.value.trim()) {
        import('../utils/toast.js').then(({ showToast }) => showToast('Reply sent! ✓', 'success'));
        input.value = '';
      }
    });
  }

  static #injectStyles() {
    if (document.getElementById('story-viewer-styles')) return;
    const s = document.createElement('style');
    s.id = 'story-viewer-styles';
    s.textContent = `
      .story-viewer { position: fixed; inset: 0; background: #000; z-index: var(--z-modal); display: flex; flex-direction: column; }
      .story-progress { display: flex; gap: 4px; padding: calc(var(--sat) + var(--space-3)) var(--space-3) var(--space-2); z-index: 2; }
      .story-progress__bar { flex: 1; height: 3px; background: rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden; }
      .story-progress__fill { height: 100%; background: #fff; border-radius: 2px; width: 0%; }
      .story-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) var(--space-4); z-index: 2; }
      .story-header__user { display: flex; align-items: center; gap: var(--space-3); }
      .story-header__name { font-size: var(--fs-sm); font-weight: var(--fw-semibold); color: #fff; }
      .story-header__time { font-size: var(--fs-xs); color: rgba(255,255,255,0.7); }
      .story-close-btn { color: #fff; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }
      .story-content { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; }
      .story-text-card { padding: var(--space-8); text-align: center; }
      .story-text { font-family: var(--font-heading); font-size: var(--fs-2xl); font-weight: var(--fw-bold); color: #fff; text-shadow: 0 2px 12px rgba(0,0,0,0.4); line-height: var(--lh-snug); }
      .story-image { width: 100%; height: 100%; object-fit: cover; }
      .story-tap-zones { position: absolute; inset: 0; top: 120px; bottom: 80px; display: flex; z-index: 3; }
      .story-tap-zone { flex: 1; }
      .story-reply { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); padding-bottom: calc(var(--sab) + var(--space-3)); background: rgba(0,0,0,0.5); z-index: 2; }
      .story-reply__input { flex: 1; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: var(--radius-pill); padding: var(--space-3) var(--space-4); color: #fff; font-size: var(--fs-sm); }
      .story-reply__input::placeholder { color: rgba(255,255,255,0.5); }
      .story-reply__send { color: #fff; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--gradient-brand); flex-shrink: 0; }
      .avatar { position: relative; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
      .avatar[style] { width: var(--avatar-size); height: var(--avatar-size); }
      .avatar__fallback { width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; }
    `;
    document.head.appendChild(s);
  }
}
