/** @module pages/GroupPage
 *  Group chat room — extends ChatPage concepts with group-specific UI.
 */
import { ChatLayout }  from '../layouts/ChatLayout.js';
import { chatStore }   from '../store/ChatStore.js';
import { authStore }   from '../store/AuthStore.js';
import { router }      from '../router/Router.js';
import { ROUTES }      from '../constants/routes.js';
import { formatTime, getDateLabel, uid, escapeHtml } from '../utils/helpers.js';
import { showToast }   from '../utils/toast.js';

const MOCK_GROUPS = {
  g1: { name: 'Dev Squad 🚀', color: 'linear-gradient(135deg,#8B5CF6,#EC4899)', members: ['Sarah', 'Budi', 'Rina', 'You'], isAdmin: true },
  g2: { name: 'Fam 🏠',       color: 'linear-gradient(135deg,#F97316,#84CC16)', members: ['Ibu', 'Ayah', 'Kakak', 'You'], isAdmin: false },
};

export class GroupPage {
  static render(container, groupId) {
    const group = MOCK_GROUPS[groupId] ?? { name: 'Group', color: 'var(--gradient-brand)', members: [], isAdmin: false };
    const contact = {
      name: group.name,
      avatar: null,
      color: group.color,
      online: true,
      lastSeen: `${group.members.length} members`,
    };

    chatStore.setActiveRoom(`g_${groupId}`);
    if (!chatStore.getMessages(`g_${groupId}`).length) GroupPage.#seedMessages(groupId);

    const content = ChatLayout.render(container, contact, `g_${groupId}`);

    // Override status text to show member count
    const statusEl = container.querySelector('.chat-header__status');
    if (statusEl) {
      statusEl.textContent = `${group.members.length} members`;
      statusEl.classList.remove('chat-header__status--online');
    }

    // Add group-specific header button (member list)
    const actions = container.querySelector('.chat-header__actions');
    if (actions) {
      const membersBtn = document.createElement('button');
      membersBtn.className = 'icon-btn';
      membersBtn.setAttribute('aria-label', 'Group info');
      membersBtn.setAttribute('data-testid', 'button-group-info');
      membersBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
      membersBtn.addEventListener('click', () => GroupPage.#showGroupInfo(group));
      actions.prepend(membersBtn);
    }

    GroupPage.#renderMessages(content, groupId, group);
    GroupPage.#bindInput(content, groupId, group);
    GroupPage.#injectStyles();

    setTimeout(() => {
      const msgs = content.querySelector('.chat-messages');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    }, 50);
  }

  static #renderMessages(content, groupId, group) {
    const msgArea = content.querySelector('.chat-messages');
    if (!msgArea) return;

    const roomId  = `g_${groupId}`;
    const messages = chatStore.getMessages(roomId);
    const currentUser = authStore.getState().user;
    let lastDateLabel = null;

    msgArea.innerHTML = messages.map(msg => {
      const isSent = msg.senderId === currentUser?.id || msg.senderId === 'me';
      const label  = getDateLabel(msg.createdAt);
      const sep    = label !== lastDateLabel ? `<div class="date-sep"><span>${label}</span></div>` : '';
      lastDateLabel = label;
      return sep + GroupPage.#bubbleHtml(msg, isSent, group);
    }).join('') || `<div class="empty-state--small"><p>Welcome to ${group.name}! 👋</p></div>`;
  }

  static #bubbleHtml(msg, isSent, group) {
    const time = formatTime(msg.createdAt, 'time');
    const senderName = isSent ? 'You' : (msg.senderName ?? 'Member');
    return `
      <div class="bubble-wrap bubble-wrap--${isSent ? 'sent' : 'received'}" data-testid="bubble-group-${msg.id}">
        ${!isSent ? `<div class="avatar avatar--xs" style="--avatar-size:28px; background: var(--gradient-brand); align-self:flex-end; flex-shrink:0">
          <div class="avatar__fallback" style="font-size:11px">${senderName[0]}</div>
        </div>` : ''}
        <div class="bubble bubble--${isSent ? 'sent' : 'received'}" role="article">
          ${!isSent ? `<span class="bubble__sender" style="color: ${msg.senderColor ?? 'var(--brand-cyan)'}">${senderName}</span>` : ''}
          <p class="bubble__text">${escapeHtml(msg.content)}</p>
          <div class="bubble__meta">
            <span class="bubble__time">${time}</span>
            ${isSent ? `<span class="bubble__status bubble__status--delivered">✓✓</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  static #bindInput(content, groupId, group) {
    const roomId  = `g_${groupId}`;
    const input   = content.querySelector('#msg-input');
    const sendBtn = content.querySelector('#btn-send');
    const msgArea = content.querySelector('.chat-messages');
    const typingEl = content.querySelector('.typing-indicator');
    const currentUser = authStore.getState().user;

    if (!input || !sendBtn) return;

    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    const sendMessage = () => {
      const text = input.value.trim();
      if (!text) return;
      chatStore.sendLocalMessage(roomId, text, currentUser?.id ?? 'me');
      input.value = '';
      input.style.height = 'auto';
      GroupPage.#renderMessages(content, groupId, group);
      setTimeout(() => msgArea?.scrollTo({ top: msgArea.scrollHeight, behavior: 'smooth' }), 50);

      if (Math.random() > 0.4) {
        const replies = ['👍', 'Siap!', 'Ok!', '🔥', '💯', 'Mantap!'];
        const senders = group.members.filter(m => m !== 'You');
        const sender  = senders[Math.floor(Math.random() * senders.length)] ?? 'Member';
        setTimeout(() => {
          typingEl?.classList.add('typing-indicator--visible');
          const nameEl = typingEl?.querySelector('.typing-indicator__name');
          if (nameEl) nameEl.textContent = `${sender} is typing…`;
          setTimeout(() => {
            typingEl?.classList.remove('typing-indicator--visible');
            chatStore.addMessage(roomId, {
              id: uid('m'), roomId, senderId: 'them',
              senderName: sender, senderColor: `hsl(${Math.random()*360},70%,65%)`,
              content: replies[Math.floor(Math.random() * replies.length)],
              status: 'delivered', createdAt: new Date().toISOString()
            });
            GroupPage.#renderMessages(content, groupId, group);
            setTimeout(() => msgArea?.scrollTo({ top: msgArea.scrollHeight, behavior: 'smooth' }), 50);
          }, 1200 + Math.random() * 800);
        }, 600);
      }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    setTimeout(() => input.focus(), 100);
  }

  static #showGroupInfo(group) {
    showToast(`${group.name} — ${group.members.length} members`, 'info');
  }

  static #seedMessages(groupId) {
    const roomId = `g_${groupId}`;
    const msgs = groupId === 'g1' ? [
      { senderId: 'them', senderName: 'Sarah',  content: 'PR baru udah push nih guys! 🚀', senderColor: '#8B5CF6' },
      { senderId: 'them', senderName: 'Budi',   content: 'Oke siap review sekarang', senderColor: '#06B6D4' },
      { senderId: 'me',   senderName: 'You',    content: 'Mantap! Aku cek dulu ya 👀' },
      { senderId: 'them', senderName: 'Rina',   content: 'Jangan lupa update dokumentasi juga 📝', senderColor: '#F97316' },
      { senderId: 'me',   senderName: 'You',    content: 'Siap boss! 💪' },
    ] : [
      { senderId: 'them', senderName: 'Ibu',    content: 'Makan malam jam 7 ya sayang', senderColor: '#F97316' },
      { senderId: 'them', senderName: 'Ayah',   content: 'Ok Bu nanti pulang dulu', senderColor: '#8B5CF6' },
      { senderId: 'me',   senderName: 'You',    content: 'Siap! Bawa oleh-oleh ya Yah 😄' },
      { senderId: 'them', senderName: 'Kakak',  content: 'Hahaha request mulu deh 😂', senderColor: '#06B6D4' },
    ];

    const base = Date.now() - msgs.length * 300000;
    msgs.forEach((m, i) => {
      chatStore.addMessage(roomId, { ...m, id: uid('m'), roomId, status: 'read', createdAt: new Date(base + i * 300000).toISOString() });
    });
  }

  static #injectStyles() {
    if (document.getElementById('group-page-styles')) return;
    const s = document.createElement('style');
    s.id = 'group-page-styles';
    s.textContent = `
      .bubble__sender { font-size: 11px; font-weight: 700; display: block; margin-bottom: 2px; }
      .bubble-wrap--received { gap: var(--space-2); }
    `;
    document.head.appendChild(s);
  }
}
