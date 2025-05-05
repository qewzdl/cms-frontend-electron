export class SocketService {
    constructor(url) {
      this.url = url;
      this.handlers = {};
      this.socket = null;
    }
  
    connect() {
      this.socket = io(this.url);
      this.socket.on('connect', () => this._emit('connect', this.socket.id));
      this.socket.on('connect_error', err => this._emit('connect_error', err));
      this.socket.on('new_message', data => this._emit('new_message', data));
      this.socket.on('new_chat', data => this._emit('new_chat', data));
    }
  
    on(event, handler) {
      if (!this.handlers[event]) this.handlers[event] = [];
      this.handlers[event].push(handler);
    }
  
    off(event, handler) {
      if (!this.handlers[event]) return;
      this.handlers[event] = this.handlers[event].filter(h => h !== handler);
    }
  
    _emit(event, payload) {
      const handlers = this.handlers[event] || [];
      handlers.forEach(h => h(payload));
    }
  
    disconnect() {
      this.socket?.disconnect();
    }
  }