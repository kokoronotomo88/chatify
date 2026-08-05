/** @module pages/ChatPage
 *  Individual chat room with message bubbles, input, typing indicator.
 */
import { ChatLayout }    from '../layouts/ChatLayout.js';
import { chatStore }     from '../store/ChatStore.js';
import { authStore }     from '../store/AuthStore.js';
import { router }        from '../router/Router.js';
import { ROUTES }        from '../constants/routes.js';
import { formatTime, getDateLabel, uid, debounce } from '../utils/helpers.js';
import { escapeHtml }    from '../utils/helpers.js';

const MOCK_CONTACT = {
  r1: { name: 'Sarah Amelia', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c3d9?w=60&h=60&fit=crop&crop=face', online: true, lastSeen: null },
  r2: { name: 'Budi Santoso', avatar: null, color: 'linear-gradient(135deg,#06B6D4,#8B5CF6)', online: false, lastSeen: '5 min ago' },
  r3: { name: 'Rina Putri',   avatar: null, color: 'linear-gradient(135deg,#F97316,#EC4899)', online: true, lastSeen: null },
  r4: { name: 'Dimas Hendra', avatar: null, color: 'linear-gradient(135deg,#84CC16,#06B6D4)', online: false, lastSeen: '1 hr ago' },
  r5: { name: 'Citra Dewi',   avatar: null, color: 'linear-gradient(135deg,#8B5CF6,#84CC16)', online: true, lastSeen: null },
};

export class ChatPage {
  static #typingTimer = null;

  static render(container, roomId) {
    const contact = MOCK_CONTACT[roomId] ?? { name: 'Unknown', avatar: null, color: '#444', online: false, lastSeen: null };
    chatStore.setActiveRoom(roomId);

    // Seed mock messages if empty
    if (!chatStore.getMessages(roomId).length) ChatPage.#seedMessages(roomId);

    const content = ChatLayout.render(container, contact, roomId);
    ChatPage.#renderMessages(content, roomId);
    ChatPage.#bindInput(content, roomId, contact);
    ChatPage.#injectStyles();

    // Scroll to bottom
    setTimeout(() => {
      const msgs = content.querySelector('.chat-messages');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    }, 50);
  }

  static #renderMessages(content, roomId) {
    const msgArea = content.querySelector('.chat-messages');
    if (!msgArea) return;

    const messages = chatStore.getMessages(roomId);
    const currentUser = authStore.getState().user;
    let lastDateLabel = null;

    msgArea.innerHTML = messages.length ? messages.map(msg => {
      const isSent = msg.senderId === currentUser?.id || msg.senderId === 'me';
      const label  = getDateLabel(msg.createdAt);
      const sep    = label !== lastDateLabel ? `<div class="date-sep"><span>${label}</span></div>` : '';
      lastDateLabel = label;
      return sep + ChatPage.#bubbleHtml(msg, isSent);
    }).join('') : `<div class="empty-state empty-state--small"><p>Start the conversation! 👋</p></div>`;

    // Scroll to bottom button
    const scrollBtn = content.querySelector('#btn-scroll-bottom');
    if (msgArea && scrollBtn) {
      msgArea.addEventListener('scroll', () => {
        const atBottom = msgArea.scrollHeight - msgArea.scrollTop - msgArea.clientHeight < 100;
        scrollBtn.classList.toggle('scroll-btn--visible', !atBottom);
      });
      scrollBtn.addEventListener('click', () => msgArea.scrollTo({ top: msgArea.scrollHeight, behavior: 'smooth' }));
    }
  }

  static #bubbleHtml(msg, isSent) {
    const time = formatTime(msg.createdAt, 'time');
    const statusIcon = isSent ? ChatPage.#statusIcon(msg.status) : '';
    return `
      <div class="bubble-wrap bubble-wrap--${isSent ? 'sent' : 'received'}" data-testid="bubble-${msg.id}">
        <div class="bubble bubble--${isSent ? 'sent' : 'received'}" role="article" aria-label="${isSent ? 'Sent' : 'Received'} message">
          ${msg.replyTo ? `<div class="bubble__reply" aria-label="Reply to message"><p>${escapeHtml(msg.replyTo)}</p></div>` : ''}
          <p class="bubble__text">${escapeHtml(msg.content)}</p>
          <div class="bubble__meta">
            <span class="bubble__time" aria-label="Sent at ${time}">${time}</span>
            ${statusIcon}
          </div>
        </div>
      </div>
    `;
  }

  static #statusIcon(status) {
    if (status === 'read')      return `<span class="bubble__status bubble__status--read" aria-label="Read">✓✓</span>`;
    if (status === 'delivered') return `<span class="bubble__status bubble__status--delivered" aria-label="Delivered">✓✓</span>`;
    return `<span class="bubble__status bubble__status--sent" aria-label="Sent">✓</span>`;
  }

  static #bindInput(content, roomId, contact) {
    const input     = content.querySelector('#msg-input');
    const sendBtn   = content.querySelector('#btn-send');
    const msgArea   = content.querySelector('.chat-messages');
    const typingEl  = content.querySelector('.typing-indicator');
    const currentUser = authStore.getState().user;

    if (!input || !sendBtn) return;

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      sendBtn.querySelector('.btn-send__mic')?.classList.toggle('hidden', input.value.trim().length > 0);
      sendBtn.querySelector('.btn-send__plane')?.classList.toggle('hidden', input.value.trim().length === 0);
    });

    const sendMessage = () => {
      const text = input.value.trim();
      if (!text) return;

      const msg = chatStore.sendLocalMessage(roomId, text, currentUser?.id ?? 'me');
      input.value = '';
      input.style.height = 'auto';

      // Re-render messages
      ChatPage.#renderMessages(content, roomId);
      setTimeout(() => msgArea?.scrollTo({ top: msgArea.scrollHeight, behavior: 'smooth' }), 50);

      // Simulate received message after delay
      if (Math.random() > 0.3) {
        const replies = ['👍', 'Ok!', 'Noted!', 'Interesting...', '😂', 'Sure thing!', 'Got it!'];
        setTimeout(() => {
          // Show typing
          typingEl?.classList.add('typing-indicator--visible');
          setTimeout(() => {
            typingEl?.classList.remove('typing-indicator--visible');
            chatStore.addMessage(roomId, {
              id: uid('m'),
              roomId, senderId: 'them',
              content: replies[Math.floor(Math.random() * replies.length)],
              status: 'delivered', createdAt: new Date().toISOString()
            });
            ChatPage.#renderMessages(content, roomId);
            setTimeout(() => msgArea?.scrollTo({ top: msgArea.scrollHeight, behavior: 'smooth' }), 50);
          }, 1500 + Math.random() * 1000);
        }, 500);
      }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    // Emoji button placeholder
    content.querySelector('#btn-emoji')?.addEventListener('click', () => {
      import('../utils/toast.js').then(({ showToast }) => showToast('Emoji picker coming soon!', 'info'));
    });

    // Attachment button placeholder
    content.querySelector('#btn-attach')?.addEventListener('click', () => {
      import('../utils/toast.js').then(({ showToast }) => showToast('Attachments coming soon!', 'info'));
    });

    // Voice record button
    const voiceBtn = content.querySelector('#btn-voice');
    voiceBtn?.addEventListener('click', () => {
      import('../utils/toast.js').then(({ showToast }) => showToast('Hold to record a voice note', 'info'));
    });

    // Focus input
    setTimeout(() => input.focus(), 100);
  }

  static #seedMessages(roomId) {
    const messages = [
      { id: uid('m'), roomId, senderId: 'them', content: 'Heyy! Apa kabar? 😊',              status: 'read',      createdAt: new Date(Date.now() - 2*3600000).toISOString() },
      { id: uid('m'), roomId, senderId: 'me',   content: 'Baik banget! Lagi ngoding nih 💻',  status: 'read',      createdAt: new Date(Date.now() - 2*3600000 + 30000).toISOString() },
      { id: uid('m'), roomId, senderId: 'them', content: 'Wah asik! Project apa?',            status: 'read',      createdAt: new Date(Date.now() - 1*3600000).toISOString() },
      { id: uid('m'), roomId, senderId: 'me',   content: 'Chattify — chat app keren abis! 🚀', status: 'delivered', createdAt: new Date(Date.now() - 45*60000).toISOString() },
      { id: uid('m'), roomId, senderId: 'them', content: 'Keren banget! Kapan bisa dicoba? ✨', status: 'read',      createdAt: new Date(Date.now() - 10*60000).toISOString() },
    ];
    messages.forEach(m => chatStore.addMessage(roomId, m));
  }

  static #injectStyles() {
    if (document.getElementById('chat-page-styles')) return;
    const s = document.createElement('style');
    s.id = 'chat-page-styles';
    s.textContent = `
      /* Bubbles */
      .bubble-wrap { display: flex; margin-bottom: var(--space-2); }
      .bubble-wrap--sent     { justify-content: flex-end; }
      .bubble-wrap--received { justify-content: flex-start; }

      .bubble {
        max-width: 72%; padding: var(--space-3) var(--space-4);
        word-break: break-word; animation: fadeIn 0.2s ease-out both;
      }
      .bubble--sent {
        background: var(--msg-sent-bg); color: #fff;
        border-radius: 20px 20px 4px 20px;
        box-shadow: 0 4px 12px rgba(139,92,246,0.3);
      }
      .bubble--received {
        background: var(--msg-received-bg); color: var(--text-primary);
        border-radius: 20px 20px 20px 4px;
        border: 1px solid var(--border-subtle);
      }
      .bubble__reply {
        font-size: var(--fs-xs); color: rgba(255,255,255,0.7); padding: var(--space-2);
        border-left: 2px solid rgba(255,255,255,0.5); margin-bottom: var(--space-2); border-radius: 4px;
        background: rgba(0,0,0,0.15);
      }
      .bubble__text { font-size: var(--fs-base); line-height: var(--lh-relaxed); }
      .bubble__meta { display: flex; align-items: center; justify-content: flex-end; gap: var(--space-1); margin-top: 4px; }
      .bubble__time { font-size: 10px; opacity: 0.7; }
      .bubble__status { font-size: 10px; }
      .bubble__status--read      { color: var(--brand-cyan); }
      .bubble__status--delivered { color: rgba(255,255,255,0.6); }
      .bubble__status--sent      { color: rgba(255,255,255,0.4); }

      /* Date separator */
      .date-sep { display: flex; align-items: center; margin: var(--space-4) var(--space-4); gap: var(--space-3); }
      .date-sep::before, .date-sep::after { content: ''; flex: 1; height: 1px; background: var(--border-subtle); }
      .date-sep span { font-size: var(--fs-xs); color: var(--text-tertiary); white-space: nowrap; padding: var(--space-1) var(--space-3); background: var(--bg-secondary); border-radius: var(--radius-pill); border: 1px solid var(--border-subtle); }

      /* Scroll button */
      .scroll-btn { position: absolute; bottom: var(--space-4); right: var(--space-4); width: 36px; height: 36px; border-radius: 50%; background: var(--bg-elevated); border: 1px solid var(--border-default); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transform: translateY(8px); transition: opacity 0.2s, transform 0.2s; }
      .scroll-btn--visible { opacity: 1; pointer-events: auto; transform: translateY(0); }

      /* Typing indicator (used globally) */
      .typing-indicator { display: none; align-items: center; gap: var(--space-2); padding: var(--space-3) var(--space-4); }
      .typing-indicator--visible { display: flex; }
      .typing-indicator__dots { display: flex; gap: 4px; }
      .typing-indicator__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--text-tertiary); animation: bounce 1.4s ease-in-out infinite; }
      .typing-indicator__dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-indicator__dot:nth-child(3) { animation-delay: 0.4s; }
      .typing-indicator__name { font-size: var(--fs-xs); color: var(--text-tertiary); }
      @keyframes bounce { 0%,80%,100% { transform:translateY(0); opacity:0.4; } 40% { transform:translateY(-5px); opacity:1; } }
      @keyframes fadeIn  { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }

      .hidden { display: none !important; }

      /* Empty state */
      .empty-state--small { text-align:center; padding: var(--space-8); color: var(--text-tertiary); font-size: var(--fs-sm); }
    `;
    document.head.appendChild(s);
  }
}
