export class ImageViewer {
    constructor() {
      this.overlay = null;

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') this.close();
      });
    }
  
    _createOverlay() {
      if (this.overlay) return this.overlay;
  
      const ov = document.createElement('div');
      ov.className = 'image-viewer-overlay';
      ov.addEventListener('click', () => this.close());
  
      const img = document.createElement('img');
      img.className = 'image-viewer-content';
      ov.appendChild(img);
  
      const closeBtn = document.createElement('div');
      closeBtn.className = 'close-button';
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.close();
      });
      ov.appendChild(closeBtn);
  
      document.body.appendChild(ov);
      this.overlay = ov;
      return ov;
    }
  
    open(src) {
      const ov = this._createOverlay();
      ov.querySelector('img').src = src;
      requestAnimationFrame(() => ov.classList.add('visible'));
    }
  
    close() {
      if (!this.overlay) return;
      this.overlay.classList.remove('visible');
      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
          this.overlay = null;
        }
      }, 300);
    }
  }
  