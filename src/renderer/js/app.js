import { formatDateSeparator } from './utils/date-formatter.js';
import { scrollToBottom }      from './utils/scroll-helper.js';

import { ChatList }        from './components/chat-list.js';
import { LoadingPanel }    from './components/loading-panel.js';
import { ImageViewer }     from './components/image-viewer.js';
import { AuthService }     from './services/auth-service.js';
import { FileUploader }    from './components/file-uploader.js';
import { SocketService }   from './services/socket-service.js';
import { MessageRenderer } from './components/message-renderer.js';
import { MessageList }     from './components/message-list.js';
import { MessengerList }   from './components/messenger-list.js';
import { MessageInput } from './components/message-input.js';
import { LogoutButton } from './components/logout-button.js';

new LogoutButton({
  selector: '#logout-btn',
  redirectUrl: 'login.html'
});

let currentChat = null;

function setOnline(isOnline) {
  document.getElementById('status-online').style.display  = isOnline ? 'flex' : 'none';
  document.getElementById('status-offline').style.display = isOnline ? 'none'  : 'flex';
}

// Конфигурация мессенджеров
const messengerConfigs = [
  { id: 'telegram', name: 'Telegram', icon: './assets/images/telegram-logo.png' },
  { id: 'whatsapp', name: 'WhatsApp', icon: './assets/images/whatsapp-logo.png' },
  { id: 'vk',       name: 'VK',       icon: './assets/images/vk-logo.png'       }
];

// SocketService
const socketService = new SocketService('http://109.172.115.156:5000');
socketService.on('connect',       () => { setOnline(true);  setTimeout(loadChats, 1000); });
socketService.on('connect_error', () => { setOnline(false); });
socketService.on('new_message', data => {
  const msg = data.message;

  if (currentChat && +msg.user_id === +currentChat.id) {
    messageList.load(currentChat.id, currentChat.telegram_account_id, false);
  } else {
    loadChats(false); 
  }
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

      authService.request(`/chats?chat_id=${chat.id}&telegram_account_id=${chat.telegram_account_id}`, {
        method: 'PATCH'
      });
    }
  }
});

const loadingPanel = new LoadingPanel('loading-panel');
const imageViewer  = new ImageViewer();
const authService  = new AuthService();
const renderer     = new MessageRenderer(imageViewer);
const messageList  = new MessageList({
  containerId:  'message-list',
  renderer,
  authService,
  formatDate:   formatDateSeparator,
  scrollHelper: scrollToBottom
});
const fileUploader = new FileUploader({
  imageBtnId:    'image-btn',
  fileBtnId:     'file-btn',
  authService,
  appendMessage: msg => renderer.render(msg),
  messageListId: 'message-list',
  getCurrentChat: () => currentChat
});

// Функции загрузки данных
async function loadChats(enableLoading = true) {
  if (enableLoading) loadingPanel.show();
  try {
    const res = await authService.get('/chats');
    const chats = await res.json();
    if (!currentChat) {
      document.getElementById('message-input').style.display = 'none';
    }
    chatList.update(chats);
  } finally {
    if (enableLoading) loadingPanel.hide();
  }
}

const messageInput = new MessageInput({
  inputSelector:    '#msg-text',
  sendBtnSelector:  '#send-btn',
  getCurrentChat:   () => currentChat,
  renderMessage:    msg => {
    const el = renderer.render(msg);
    document.getElementById('message-list').appendChild(el);
    setTimeout(() => el.classList.add('visible'), 10);
    return el;
  },
  onSend: async (text, chat) => {
    await authService.post('/chats/messages/send', {
      user_id: chat.id,
      message_text: text,
      telegram_account_id: chat.telegram_account_id
    });
  },
  scrollToBottom: () => scrollToBottom('message-list')
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
  loadChats();
});