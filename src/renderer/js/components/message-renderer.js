import { Config } from '../config.js';

class BaseRenderer {
  constructor(baseUrl = Config.baseUrl, contextMenu) {
    this.baseUrl = baseUrl;
    this.contextMenu = contextMenu;
  }

  resolvePath(path) {
    if (!path) return '';
    if (path.startsWith('/tmp/')) return this.baseUrl + path;
    return path.startsWith('http') ? path : `${this.baseUrl}/${path}`;
  }

  appendTime(div, msg) {
    const timeEl = document.createElement('div');
    timeEl.className = 'message-time';
    timeEl.textContent = new Date(msg.date || msg.created_at)
      .toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    div.appendChild(timeEl);
  }

  attachContextMenu(div, msg) {
    if (msg.type !== 'incoming') {
      this.contextMenu.attachTo(div, msg);
    }
  }
}

export class TextRenderer extends BaseRenderer {
  render(msg) {
    const div = document.createElement('div');
    div.classList.add('message', msg.type || '', msg.content_type || '');
    div.textContent = msg.message_text || '';
    this.attachContextMenu(div, msg);
    this.appendTime(div, msg);
    return div;
  }
}

export class ImageRenderer extends BaseRenderer {
  constructor(imageViewer, baseUrl, contextMenu) {
    super(baseUrl, contextMenu);
    this.imageViewer = imageViewer;
  }

  render(msg) {
    const div = document.createElement('div');
    div.classList.add('message', msg.type || '', msg.content_type || '');
    const img = document.createElement('img');
    const src = this.resolvePath(msg.file_path);
    img.src = src;
    img.alt = msg.file_name || '';
    img.addEventListener('click', () => this.imageViewer.open(src));
    div.appendChild(img);
    this.attachContextMenu(div, msg);
    this.appendTime(div, msg);
    return div;
  }
}

export class FileRenderer extends BaseRenderer {
  render(msg) {
    const div = document.createElement('div');
    div.classList.add('message', msg.type || '', msg.content_type || '');
    const a = document.createElement('a');
    a.href = this.resolvePath(msg.file_path);
    a.textContent = msg.file_name || 'Download';
    a.download = msg.file_name || '';
    a.target = '_blank';
    div.appendChild(a);
    this.attachContextMenu(div, msg);
    this.appendTime(div, msg);
    return div;
  }
}

export class AudioRenderer extends BaseRenderer {
  render(msg) {
    const div = document.createElement('div');
    div.classList.add('message', msg.type || '', msg.content_type || '');
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = this.resolvePath(msg.file_path);
    div.appendChild(audio);
    this.attachContextMenu(div, msg);
    this.appendTime(div, msg);
    return div;
  }
}

export class VideoRenderer extends BaseRenderer {
  render(msg) {
    const div = document.createElement('div');
    div.classList.add('message', msg.type || '', msg.content_type || '');
    const video = document.createElement('video');
    video.controls = true;
    video.src = this.resolvePath(msg.file_path);
    video.style.maxWidth = '100%';
    div.appendChild(video);
    this.attachContextMenu(div, msg);
    this.appendTime(div, msg);
    return div;
  }
}

export class MessageRenderer {
  constructor(imageViewer, baseUrl = Config.baseUrl, contextMenu) {
    this.handlers = {
      message: new TextRenderer(baseUrl, contextMenu),
      text: new TextRenderer(baseUrl, contextMenu),
      image: new ImageRenderer(imageViewer, baseUrl, contextMenu),
      file: new FileRenderer(baseUrl, contextMenu),
      document: new FileRenderer(baseUrl, contextMenu),
      audio: new AudioRenderer(baseUrl, contextMenu),
      voice: new AudioRenderer(baseUrl, contextMenu),
      video: new VideoRenderer(baseUrl, contextMenu)
    };
    this.defaultHandler = new TextRenderer(baseUrl, contextMenu);
  }

  render(msg) {
    const ct = msg.content_type || msg.file_type || 'message';
    const handler = this.handlers[ct] || this.defaultHandler;
    return handler.render(msg);
  }
}