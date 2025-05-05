export class LoadingPanel {
  constructor(elementId, parent = document.body) {
    this.parent = typeof parent === 'string' ? document.querySelector(parent) : parent;
    let panel = document.getElementById(elementId);
    if (!panel) {
      panel = document.createElement('div');
      panel.id = elementId;
      this.parent.appendChild(panel);
    } else if (panel.parentElement !== this.parent) {
      this.parent.appendChild(panel);
    }
    this.panel = panel;
  }

  show() {
    this.panel.classList.remove('inactive');
  }

  hide() {
    this.panel.classList.add('inactive');
  }
}
