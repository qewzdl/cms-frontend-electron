import { ChatListItem } from './chat-list-item.js';

export class ChatList {
  constructor({ containerId, onSelect }) {
    this.container = document.getElementById(containerId);
    this.onSelect = onSelect; 
    this.currentChatId = null;
  }

  clear() {
    this.container.innerHTML = '';
  }

  setChats(chats) {
    this.clear();
    chats.forEach(chat => {
      const item = new ChatListItem({ chat, isActive: chat.id === this.currentChatId });
      item.element.addEventListener('click', () => {
        this.select(chat.id);
      });
      this.container.appendChild(item.element);
    });
  }

  select(chatId) {
    this.currentChatId = chatId;
    Array.from(this.container.children).forEach(li => {
      if (li.dataset.id === chatId) {
        li.classList.add('active');
      } else {
        li.classList.remove('active');
      }
    });
    if (this.onSelect) {
      const chat = this.lastChats.find(c => c.id === chatId);
      this.onSelect(chat);
    }
  }

  update(chats) {
    this.lastChats = chats;
    this.setChats(chats);
  }
}


