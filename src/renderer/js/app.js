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

let currentChat = null;

function setOnline(isOnline) {
  document.getElementById('status-online').style.display  = isOnline ? 'flex' : 'none';
  document.getElementById('status-offline').style.display = isOnline ? 'none'  : 'flex';
}

const socketService = new SocketService('http://109.172.115.156:5000');
socketService.on('connect',       () => { setOnline(true);  setTimeout(loadChats, 1000); });
socketService.on('connect_error', () => { setOnline(false); });
socketService.on('new_message',   () => { if (currentChat) messageList.load(currentChat.id, currentChat.telegram_account_id, false); });
socketService.on('new_chat',      loadChats);
socketService.connect();

const chatList = new ChatList({
  containerId: 'chat-list',
  onSelect: chat => {
    currentChat = chat;
    document.getElementById('message-input').style.display = 'flex';
    loadMessages(chat.id, chat.telegram_account_id, true);
    scrollToBottom('message-list');
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
  imageBtnId: 'image-btn',
  fileBtnId:  'file-btn',
  authService,
  appendMessage: msg => renderer.render(msg),
  messageListId: 'message-list',
  getCurrentChat: () => currentChat
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'login.html';
});

async function loadChats() {
  loadingPanel.show();
  try {
    const res = await authService.get('/chats');
    const chats = await res.json();
    if (!currentChat) {
      document.getElementById('message-input').style.display = 'none';
    }
    chatList.update(chats);
  } finally {
    loadingPanel.hide();
  }
}

function loadMessages(userId, telegramAccountId, withAnimation = false) {
  return messageList.load(userId, telegramAccountId, withAnimation);
}

window.onload = () => {
  if (!localStorage.getItem('access_token')) {
    window.location.href = 'login.html';
    return;
  }
  const ln = localStorage.getItem('login');
  if (ln) document.getElementById('login-text').innerText = ln;
};
