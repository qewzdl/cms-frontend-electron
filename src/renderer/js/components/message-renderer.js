class BaseRenderer {
    constructor(baseUrl = 'https://savychk1.fvds.ru') {
      this.baseUrl = baseUrl;
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
  }
  
  export class TextRenderer extends BaseRenderer {
    render(msg) {
      const div = document.createElement('div');
      div.classList.add('message', msg.type || '');
      div.textContent = msg.message_text || '';
      this.appendTime(div, msg);
      return div;
    }
  }
  
  export class ImageRenderer extends BaseRenderer {
    constructor(imageViewer, baseUrl) {
      super(baseUrl);
      this.imageViewer = imageViewer;
    }
  
    render(msg) {
      const div = document.createElement('div');
      div.classList.add('message', msg.type || '');
      const img = document.createElement('img');
      const src = this.resolvePath(msg.file_path);
      img.src = src;
      img.alt = msg.file_name || '';
      img.addEventListener('click', () => this.imageViewer.open(src));
      div.appendChild(img);
      this.appendTime(div, msg);
      return div;
    }
  }
  
  export class FileRenderer extends BaseRenderer {
    render(msg) {
      const div = document.createElement('div');
      div.classList.add('message', msg.type || '');
      const a = document.createElement('a');
      a.href = this.resolvePath(msg.file_path);
      a.textContent = msg.file_name || 'Download';
      a.target = '_blank';
      div.appendChild(a);
      this.appendTime(div, msg);
      return div;
    }
  }
  
  export class AudioRenderer extends BaseRenderer {
    render(msg) {
      const div = document.createElement('div');
      div.classList.add('message', msg.type || '');
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.src = this.resolvePath(msg.file_path);
      div.appendChild(audio);
      this.appendTime(div, msg);
      return div;
    }
  }
  
  export class VideoRenderer extends BaseRenderer {
    render(msg) {
      const div = document.createElement('div');
      div.classList.add('message', msg.type || '');
      const video = document.createElement('video');
      video.controls = true;
      video.src = this.resolvePath(msg.file_path);
      video.style.maxWidth = '100%';
      div.appendChild(video);
      this.appendTime(div, msg);
      return div;
    }
  }
  
  export class MessageRenderer {
    constructor(imageViewer, baseUrl) {
      this.handlers = {
        message: new TextRenderer(baseUrl),
        text:    new TextRenderer(baseUrl),
        image:   new ImageRenderer(imageViewer, baseUrl),
        file:    new FileRenderer(baseUrl),
        document:new FileRenderer(baseUrl),
        audio:   new AudioRenderer(baseUrl),
        voice:   new AudioRenderer(baseUrl),
        video:   new VideoRenderer(baseUrl)
      };
      this.defaultHandler = new TextRenderer(baseUrl);
    }
  
    render(msg) {
      const ct = msg.content_type || msg.file_type || 'message';
      const handler = this.handlers[ct] || this.defaultHandler;
      return handler.render(msg);
    }
  }
  