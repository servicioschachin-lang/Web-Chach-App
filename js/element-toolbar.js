const I = {
  edit: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
  image: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  replace: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3l4 4-4 4"/><path d="M3 7h18"/><path d="M7 21l-4-4 4-4"/><path d="M21 17H3"/></svg>',
  color: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
};
export class ElementToolbar {
  constructor(doc, handlers) {
    this.doc = doc;
    this.handlers = handlers || {};
    this.el = null;
    this.node = null;
    this.colorOpen = false;
    this.colorInputs = null;
  }
  show(target) {
    this.hide();
    this.el = target;
    this.colorOpen = false;
    const isImg = target.tagName === 'IMG';
    const bar = this.doc.createElement('div');
    bar.className = 'cw-toolbar';
    bar.setAttribute('data-cw', '1');
    const makeBtn = (icon, title, onClick) => {
      const b = this.doc.createElement('button');
      b.type = 'button';
      b.className = 'cw-toolbar-btn';
      b.title = title;
      b.innerHTML = icon;
      b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onClick(); });
      return b;
    };
    bar.appendChild(makeBtn(I.edit, 'Editar', () => this.handlers.onEdit && this.handlers.onEdit(this.el)));
    if (isImg) bar.appendChild(makeBtn(I.image, 'Cambiar imagen', () => this.handlers.onChangeImage && this.handlers.onChangeImage(this.el)));
    else bar.appendChild(makeBtn(I.replace, 'Reemplazar por imagen', () => this.handlers.onReplaceImage && this.handlers.onReplaceImage(this.el)));
    bar.appendChild(makeBtn(I.color, 'Colores', () => this.toggleColors()));
    bar.appendChild(makeBtn(I.trash, 'Borrar', () => this.handlers.onDelete && this.handlers.onDelete(this.el)));
    const pop = this.doc.createElement('div');
    pop.className = 'cw-color-pop';
    pop.setAttribute('data-cw', '1');
    pop.style.display = 'none';
    const bgLabel = this.doc.createElement('label'); bgLabel.textContent = 'Fondo';
    const bgInput = this.doc.createElement('input'); bgInput.type = 'color';
    const txtLabel = this.doc.createElement('label'); txtLabel.textContent = 'Texto';
    const txtInput = this.doc.createElement('input'); txtInput.type = 'color';
    bgInput.addEventListener('input', () => { if (this.handlers.onColor) this.handlers.onColor(this.el, 'bg', bgInput.value); });
    txtInput.addEventListener('input', () => { if (this.handlers.onColor) this.handlers.onColor(this.el, 'text', txtInput.value); });
    pop.appendChild(bgLabel); pop.appendChild(bgInput); pop.appendChild(txtLabel); pop.appendChild(txtInput);
    bar.appendChild(pop);
    this.doc.body.appendChild(bar);
    this.node = bar;
    this.colorInputs = { bg: bgInput, text: txtInput };
    const bg = this.effectiveBackground(target);
    bgInput.value = rgbToHexSafe(bg) || '#ffffff';
    try { txtInput.value = rgbToHexSafe(this.doc.defaultView.getComputedStyle(target).color) || '#000000'; } catch (e) {}
    this.position();
  }
  toggleColors() {
    this.colorOpen = !this.colorOpen;
    const pop = this.node && this.node.querySelector('.cw-color-pop');
    if (pop) pop.style.display = this.colorOpen ? 'flex' : 'none';
  }
  position() {
    if (!this.node || !this.el) return;
    const r = this.el.getBoundingClientRect();
    const scrollX = this.doc.defaultView.scrollX || 0;
    const scrollY = this.doc.defaultView.scrollY || 0;
    let top = r.top + scrollY - 46;
    let left = r.left + scrollX;
    if (top < scrollY + 4) top = r.bottom + scrollY + 6;
    this.node.style.top = top + 'px';
    this.node.style.left = left + 'px';
  }
  hide() {
    if (this.node && this.node.parentNode) this.node.parentNode.removeChild(this.node);
    this.node = null;
    this.el = null;
  }
  effectiveBackground(el) {
    let cur = el;
    while (cur && cur !== this.doc.body) {
      const bg = this.doc.defaultView.getComputedStyle(cur).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
      cur = cur.parentElement;
    }
    return this.doc.defaultView.getComputedStyle(this.doc.body).backgroundColor || '#ffffff';
  }
}
function rgbToHexSafe(rgb) {
  if (!rgb || rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') return null;
  const m = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return '#' + [m[1], m[2], m[3]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
}
