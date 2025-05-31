import { Config } from '../config.js';

export class MessageList {
    constructor({ containerId, renderer, authService, formatDate, scrollHelper }) {
      this.container   = document.getElementById(containerId);
      this.renderer    = renderer;
      this.authService = authService;
      this.formatDate  = formatDate;
      this.scrollToBottom = scrollHelper;
    }
  
    async load(chat_id, telegramAccountId, withAnimation = false, delay = 30) {
      try {
        const res = await this.authService.get(Config.endpoints.messages + `/${chat_id}`);
        const msgs = await res.json();
        this.container.innerHTML = '';
        msgs.sort((a, b) =>
          new Date(a.date || a.created_at) - new Date(b.date || b.created_at)
        );
    
        let lastDate = null, idx = 0;
        for (const msg of msgs) {
          const ds = this.formatDate(new Date(msg.date || msg.created_at));
          if (ds !== lastDate) {
            const sep = document.createElement('div');
            sep.className = 'date-separator';
            sep.textContent = ds;
            this.container.appendChild(sep);
            lastDate = ds;
            if (withAnimation) setTimeout(() => sep.classList.add('visible'), delay * idx++);
            else sep.classList.add('visible');
          }
          const el = this.renderer.render(msg);
          this.container.appendChild(el);
          if (withAnimation) setTimeout(() => el.classList.add('visible'), delay * idx++);
          else el.classList.add('visible');
        }
      } finally {
        this.scrollToBottom(this.container.id);
      }
    }
  }
  