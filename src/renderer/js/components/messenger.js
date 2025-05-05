// components/messenger.js

export class Messenger {
    /**
     * @param {object} config
     * @param {string} config.id          — уникальный идентификатор мессенджера
     * @param {string} config.name        — отображаемое имя
     * @param {string} config.icon        — URL иконки
     * @param {boolean} config.active     — отметить активным
     * @param {(id: string) => void} config.onSelect — колбэк при клике
     */
    constructor({ id, name, icon, active = false, onSelect = () => {} }) {
      this.id = id;
      this.name = name;
      this.icon = icon;
      this.active = active;
      this.onSelect = onSelect;
      this.element = this._createElement();
      this._bindEvents();
    }
  
    _createElement() {
      const li = document.createElement('li');
      li.dataset.id = this.id;
      li.classList.toggle('active', this.active);
  
      const img = document.createElement('img');
      img.className = 'messenger-icon';
      img.src = this.icon;
      img.height = 40;
  
      const span = document.createElement('span');
      span.className = 'messenger-name';
      span.textContent = this.name;
  
      const notif = document.createElement('div');
      notif.className = 'notification';
  
      li.append(img, span, notif);
      this.notificationElement = notif;
      return li;
    }
  
    _bindEvents() {
      this.element.addEventListener('click', () => {
        this.onSelect(this.id);
      });
    }
  
    setActive(isActive) {
      this.active = isActive;
      this.element.classList.toggle('active', isActive);
    }
  
    setNotification(count) {
      this.notificationElement.textContent = count > 0 ? String(count) : '';
    }
  
    getElement() {
      return this.element;
    }
  }
  