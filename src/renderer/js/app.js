import { Config } from './config.js';

import { formatDateSeparator } from './utils/date-formatter.js';
import { scrollToBottom }      from './utils/scroll-helper.js';

import { ChatList }        from './components/chat-list.js';
import { LoadingPanel }    from './components/loading-panel.js';
import { ImageViewer }     from './components/image-viewer.js';
import { FileUploader }    from './components/file-uploader.js';
import { MessageRenderer } from './components/message-renderer.js';
import { MessageList }     from './components/message-list.js';
import { MessengerList }   from './components/messenger-list.js';
import { MessageInput } from './components/message-input.js';
import { LogoutButton } from './components/logout-button.js';
import { ContextMenu } from './components/context-menu.js';

import { AuthService }     from './services/auth-service.js';
import { SocketService }   from './services/socket-service.js';

const contextMenu = new ContextMenu('#context-menu', '#chat-view');

new LogoutButton({
  selector: '#logout-btn',
  redirectUrl: 'login.html'
});

let currentChat = null;

function setOnline(isOnline) {
  document.getElementById('status-online').style.display  = isOnline ? 'flex' : 'none';
  document.getElementById('status-offline').style.display = isOnline ? 'none' : 'flex';
}

// Конфигурация мессенджеров
const messengerConfigs = [
  { id: 'telegram', name: 'Telegram', icon: './assets/images/telegram-logo.png' },
  { id: 'whatsapp', name: 'WhatsApp', icon: './assets/images/whatsapp-logo.png' },
  { id: 'vk',       name: 'VK',       icon: './assets/images/vk-logo.png'       }
];

// SocketService
const socketService = new SocketService();
socketService.on('connect',       () => { setOnline(true); loadChats(); });
socketService.on('connect_error', () => { setOnline(false); });
socketService.on('new_message', data => {
  const msg = data.message;

  if (+msg.user_id === +currentChat.user_id) {
    messageList.load(currentChat.id, currentChat.telegram_account_id, false);
    const chatItem = document.querySelector(
      `#chat-list li[data-id="${currentChat.id}"]`
    );
    if (chatItem) {
      const badge = chatItem.querySelector('.notification');
      badge.classList.remove('active');
      badge.classList.add('inactive');

      authService.patch(Config.endpoints.chats + `?chat_id=${chat.id}&telegram_account_id=${chat.telegram_account_id}`);
    }
  }

  loadChats(false); 
});

socketService.on('new_chat', loadChats);
socketService.connect();

// UI-компоненты
const chatList = new ChatList({
  containerId: 'chat-list',
  onSelect: chat => {
    currentChat = chat;
    document.getElementById('message-input').style.display = 'flex';
    messageList.load(chat.id, chat.telegram_account_id, true);
    scrollToBottom('message-list');

    const chatItem = document.querySelector(
      `#chat-list li[data-id="${chat.id}"]`
    );
    if (chatItem) {
      const badge = chatItem.querySelector('.notification');
      badge.classList.remove('active');
      badge.classList.add('inactive');

      authService.patch(Config.endpoints.chats + `?chat_id=${chat.id}&telegram_account_id=${chat.telegram_account_id}`);
    }
  }
});

const loadingPanel = new LoadingPanel('loading-panel');
const imageViewer  = new ImageViewer();
const renderer = new MessageRenderer(imageViewer, Config.baseUrl, contextMenu);
const authService  = new AuthService();
const messageList  = new MessageList({
  containerId: 'message-list',
  renderer,
  authService,
  formatDate: formatDateSeparator,
  scrollHelper: scrollToBottom
});
const fileUploader = new FileUploader({
  imageBtnId: 'image-btn',
  fileBtnId: 'file-btn',
  authService,
  appendMessage: msg => renderer.render(msg),
  messageListId: 'message-list',
  getCurrentChat: () => currentChat
});

async function loadChats(enableLoading = true) {
  if (enableLoading) loadingPanel.show();
  try {
    const res = await authService.get(Config.endpoints.chats);
    let chats = await res.json();

    const chatsWithLastMsgTime = await Promise.all(
      chats.map(async (chat) => {
        const resp = await authService.get(Config.endpoints.messages + `/${chat.id}?limit=1`);
        const msgs = await resp.json();
        chat._lastMsgDate = msgs[0]?.date || msgs[0]?.created_at || '1970-01-01';
        return chat;
      })
    );

    chatsWithLastMsgTime.sort(
      (a, b) => new Date(b._lastMsgDate) - new Date(a._lastMsgDate)
    );

    chatList.update(chatsWithLastMsgTime);
  } finally {
    if (enableLoading) loadingPanel.hide();
  }
}


const messageInput = new MessageInput({
  inputSelector: '#msg-text',
  sendBtnSelector: '#send-btn',
  getCurrentChat: () => currentChat,
  renderMessage: msg => {
    const el = renderer.render(msg);
    document.getElementById('message-list').appendChild(el);
    setTimeout(() => el.classList.add('visible'), 10);
    return el;
  },
  onSend: async (text, chat) => {
    await authService.post(Config.endpoints.send, {
      user_id: chat.user_id,
      message_text: text,
      telegram_account_id: chat.telegram_account_id
    });
  },
  scrollToBottom: () => scrollToBottom('message-list')
});

document.getElementById('context-menu__delete-btn').addEventListener('click', async () => {
  const msg = window.selectedMessage;
  if (!msg) return;

  try {
    console.log('Deleting message:', msg);
    await authService.delete(Config.endpoints.messages + `?message_id=${msg.id}`);
    messageList.load(currentChat.id, currentChat.telegram_account_id, false);
  } catch (error) {
    console.error('Error deleting message:', error);
  }

  contextMenu.hide();
});

// Инициализация после загрузки DOM
window.addEventListener('DOMContentLoaded', () => {
  new MessengerList({
    containerId: 'messenger-list',
    messengers: messengerConfigs,
    onSelect: id => {
      currentChat = null;
      document.getElementById('message-input').style.display = 'none';
      chatList.update([]);
      loadChats();
    }
  });

  if (!localStorage.getItem('access_token')) {
    window.location.href = 'login.html';
    return;
  }
  const ln = localStorage.getItem('login');
  if (ln) document.getElementById('login-text').innerText = ln;
});