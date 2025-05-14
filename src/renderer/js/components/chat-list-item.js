export class ChatListItem {
  constructor({ chat, isActive = false }) {
    const li = document.createElement('li');
    li.dataset.id = chat.id;
    li.classList.toggle('active', isActive);
    li.innerHTML = `
    <div class="chat-info">
      <div class="chat-username">${chat.user_name}</div>
      <div class="account-name">Аккаунт: ${chat.account_name}</div>
    </div>
    <div class="notification ${chat.unread ? 'active' : 'inactive'}"></div>
    `;
    this.element = li;
  }
}