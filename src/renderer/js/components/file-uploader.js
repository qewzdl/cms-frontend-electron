import { Config } from '../config.js';

export class FileUploader {
    constructor({ imageBtnId, fileBtnId, authService, appendMessage, messageListId, getCurrentChat }) {
      this.authService = authService;
      this.appendMessage = appendMessage;
      this.getCurrentChat = getCurrentChat;
      this.messageList = document.getElementById(messageListId);
  
      this._createInputs();
  
      document.getElementById(imageBtnId)
        .addEventListener('click', () => this._trigger('image'));
      document.getElementById(fileBtnId)
        .addEventListener('click', () => this._trigger('file'));
    }
  
    _createInputs() {
      this.imageInput = document.createElement('input');
      this.imageInput.type = 'file';
      this.imageInput.accept = 'image/*';
      this.imageInput.style.display = 'none';
  
      this.fileInput = document.createElement('input');
      this.fileInput.type = 'file';
      this.fileInput.style.display = 'none';
  
      document.body.appendChild(this.imageInput);
      document.body.appendChild(this.fileInput);
  
      this.imageInput.addEventListener('change', () => {
        if (this.imageInput.files.length) {
          this._handle(this.imageInput.files[0], 'image');
          this.imageInput.value = '';
        }
      });
  
      this.fileInput.addEventListener('change', () => {
        if (this.fileInput.files.length) {
          this._handle(this.fileInput.files[0], 'file');
          this.fileInput.value = '';
        }
      });
    }
  
    _trigger(type) {
      const chat = this.getCurrentChat();
      if (!chat) return alert('Select a chat first');
      if (type === 'image') this.imageInput.click();
      else this.fileInput.click();
    }
  
    async _handle(file, contentType) {
      const chat = this.getCurrentChat();
      const tempMsg = {
        user_id: chat.id,
        file_path: URL.createObjectURL(file),
        file_name: file.name,
        content_type: contentType,
        type: 'outgoing',
        date: new Date().toISOString()
      };
  
      const el = this.appendMessage(tempMsg);
      this.messageList.appendChild(el);
      setTimeout(() => el.classList.add('visible'), 10);
      this.messageList.scrollTop = this.messageList.scrollHeight;
  
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', chat.id);
      formData.append('telegram_account_id', chat.telegram_account_id);
  
      try {
        await this.authService.postForm(Config.endpoints.send, formData);
      } catch (err) {
        console.error('File upload error', err);
      }
    }
  }
  