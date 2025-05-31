import { Config } from '../config.js';
import { MessageFilter } from '../utils/message-filter.js';

export class MessageInput {
  /**
   * @param {object} config
   * @param {string} config.inputSelector
   * @param {string} config.sendBtnSelector
   * @param {() => object|null} config.getCurrentChat
   * @param {(msg: object) => HTMLElement} config.renderMessage
   * @param {(text: string, chat: object) => Promise<any>} config.onSend
   * @param {() => void} config.scrollToBottom
   */
  constructor({ inputSelector, sendBtnSelector, getCurrentChat, renderMessage, onSend, scrollToBottom }) {
    this.input = document.querySelector(inputSelector);
    this.sendBtn = document.querySelector(sendBtnSelector);
    this.getCurrentChat = getCurrentChat;
    this.renderMessage = renderMessage;
    this.onSend = onSend;
    this.scrollToBottom = scrollToBottom;
    this._bindEvents();
  }

  _bindEvents() {
    this.input.addEventListener('input', () => {
      const text = this.input.value.trim();
      const hasText = text.length > 0;
      const hasStopWords = MessageFilter.hasStopWords(text);

      this.sendBtn.classList.toggle('active', hasText && !hasStopWords);
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

    if (MessageFilter.hasStopWords(text)) return;

    const msg = {
      user_id: chat.id,
      message_text: text,
      content_type: 'message',
      type: 'outgoing',
      date: new Date().toISOString()
    };

    const el = this.renderMessage(msg);
    this.scrollToBottom();

    this.input.value = '';
    this.sendBtn.classList.remove('active');

    await this.onSend(text, chat);
  }
}
