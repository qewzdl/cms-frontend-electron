import { Messenger } from './messenger.js';

export class MessengerList {
  /**
   * @param {object} config
   * @param {string} config.containerId 
   * @param {Array<{id:string,name:string,icon:string,active?:boolean}>} config.messengers
   * @param {(messengerId:string)=>void} config.onSelect
   */
  constructor({ containerId, messengers, onSelect }) {
    this.container = document.getElementById(containerId);
    this.onSelect = onSelect;
    this.messengerConfigs = messengers;
    this.instances = new Map();
    this.activeId = null;
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    this.instances.clear();

    this.messengerConfigs.forEach(cfg => {
      const messenger = new Messenger({
        ...cfg,
        onSelect: id => this.select(id)
      });
      this.instances.set(cfg.id, messenger);
      this.container.appendChild(messenger.getElement());
      if (cfg.active) this.activeId = cfg.id;
    });
  }

  select(id) {
    if (this.activeId === id) return;
    if (this.activeId) {
      this.instances.get(this.activeId).setActive(false);
    }
    const instance = this.instances.get(id);
    if (instance) {
      instance.setActive(true);
      this.activeId = id;
      this.onSelect(id);
    }
  }

  setNotification(id, count) {
    const instance = this.instances.get(id);
    if (instance) instance.setNotification(count);
  }

  update(messengers) {
    this.messengerConfigs = messengers;
    this._render();
  }
}
