export class ContextMenu {
  /**
   * @param {string} menuSelector
   * @param {string} containerSelector 
   */
  constructor(menuSelector, containerSelector) {
    this.menu = document.querySelector(menuSelector);
    this.container = document.querySelector(containerSelector);

    if (!this.menu) 
      throw new Error(`ContextMenu: no element matches ${menuSelector}`);
    if (!this.container) 
      throw new Error(`ContextMenu: no element matches ${containerSelector}`);

    const cs = getComputedStyle(this.container);
    if (cs.position === 'static') {
      this.container.style.position = 'relative';
    }

    this.container.appendChild(this.menu);

    Object.assign(this.menu.style, {
      position: 'absolute',
      display:  'none'
    });

    this._bindGlobalHide();
  }

  _bindGlobalHide() {
    document.addEventListener('click', () => this.hide());
  }

  /**
   * @param {HTMLElement} element
   * @param {any} message
   */
  attachTo(element, message) {
    element.addEventListener('contextmenu', e => {
      e.preventDefault();
      this.show(e.clientX, e.clientY, message);
    });
  }

  /**
   * @param {number} pageX 
   * @param {number} pageY 
   */
  show(pageX, pageY, message) {
    this._setSelectedMessage(message);

    this.menu.style.display = 'block';

    const { left, top } = this._calculatePosition(pageX, pageY);

    this.menu.style.left = `${left}px`;
    this.menu.style.top  = `${top}px`;
  }

  hide() {
    this.menu.style.display = 'none';
  }

  _setSelectedMessage(msg) {
    window.selectedMessage = msg;
  }

  /**
   * @param {number} pageX 
   * @param {number} pageY 
   * @returns {{left: number, top: number}}
   */
  _calculatePosition(pageX, pageY) {
    const contRect = this.container.getBoundingClientRect();
    const menuRect = this.menu.getBoundingClientRect();

    let left = pageX - contRect.left;
    let top  = pageY - contRect.top;

    if (left + menuRect.width > contRect.width) {
      left = (pageX - contRect.left) - menuRect.width;
    }

    if (top + menuRect.height > contRect.height) {
      top = contRect.height - menuRect.height;
    }

    if (left < 0) left = 0;
    if (top  < 0) top  = 0;

    return { left, top };
  }
}
