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
      li.classList.toggle('active', +li.dataset.id === +chatId);
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

export class ChatListItem {
  constructor({ chat, isActive = false }) {
    const li = document.createElement('li');
    li.dataset.id = chat.id;
    li.classList.toggle('active', isActive);
    li.innerHTML = `
      <div>
        <div class="chat-username">${chat.user_name}</div>
        <div class="account-name">Аккаунт: ${chat.account_name}</div>
      </div>
      <div class="notification inactive"></div>
    `;
    this.element = li;
  }
}
