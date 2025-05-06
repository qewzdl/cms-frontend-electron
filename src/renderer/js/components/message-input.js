export class MessageInput {
    /**
     * @param {object} config
     * @param {string} config.inputSelector  — селектор textarea/input
     * @param {string} config.sendBtnSelector — селектор кнопки «Отправить»
     * @param {() => object|null} config.getCurrentChat — функция, возвращающая текущий чат
     * @param {(msg: object) => HTMLElement} config.renderMessage — функция, рендерящая DOM-элемент сообщения
     * @param {(text: string, chat: object) => Promise<any>} config.onSend — функция, отправляющая текст на сервер
     * @param {() => void} config.scrollToBottom — прокрутка контейнера
     */
    constructor({ inputSelector, sendBtnSelector, getCurrentChat, renderMessage, onSend, scrollToBottom }) {
      this.input         = document.querySelector(inputSelector);
      this.sendBtn       = document.querySelector(sendBtnSelector);
      this.getCurrentChat = getCurrentChat;
      this.renderMessage = renderMessage;
      this.onSend        = onSend;
      this.scrollToBottom= scrollToBottom;
      this._bindEvents();
    }
  
    _bindEvents() {
      this.input.addEventListener('input', () => {
        const hasText = this.input.value.trim().length > 0;
        this.sendBtn.classList.toggle('active', hasText);
      });
  
      this.sendBtn.addEventListener('click', () => this._handleSend());
  
      this.input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this._handleSend();
        }
      });
    }
  
    async _handleSend() {
      const chat = this.getCurrentChat();
      const text = this.input.value.trim();
      if (!chat || !text) return;
  
      const msg = {
        user_id:        chat.id,
        message_text:   text,
        content_type:   'message',
        type:           'outgoing',
        date:           new Date().toISOString()
      };
      const el = this.renderMessage(msg);
      this.scrollToBottom();
  
      this.input.value = '';
      this.sendBtn.classList.remove('active');
  
      await this.onSend(text, chat);
    }
  }
  