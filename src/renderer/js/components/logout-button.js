export class LogoutButton {
    /**
     * @param {object} config
     * @param {string} config.selector     — селектор кнопки выхода
     * @param {string} config.redirectUrl  — URL для редиректа после выхода
     */
    constructor({ selector = '#logout-btn', redirectUrl = 'login.html' } = {}) {
      this.button = document.querySelector(selector);
      this.redirectUrl = redirectUrl;
      if (this.button) this._bindEvents();
    }
  
    _bindEvents() {
      this.button.addEventListener('click', () => this._handleLogout());
    }
  
    _handleLogout() {
      localStorage.clear();
      window.location.href = this.redirectUrl;
    }
  }
  