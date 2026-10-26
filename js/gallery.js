/* Gestión de la galería de plantillas */
import { CONFIG } from './config.js';
import { $, escapeHtml } from './utils.js';

const ICON_MAP = {
  cap: 'graduation-cap',
  barber: 'scissors',
  washer: 'washing-machine',
  seedling: 'sprout',
  glasses: 'wine',
  paw: 'paw-print',
};

export class Gallery {
  constructor(onViewTemplate) {
    this.onViewTemplate = onViewTemplate;
    this.filtro = '';
    this.init();
  }

  init() {
    this.render();
    this.attachEvents();
  }

  render() {
    const q = (this.filtro || '').toLowerCase().trim();
    const lista = q
      ? CONFIG.TEMPLATES.filter(t => (t.nombre || '').toLowerCase().includes(q))
      : CONFIG.TEMPLATES;
    this.lista = lista;

    $('#grid').innerHTML = lista.map((t, i) => {
      const ok = !!t.url;
      const count = (t.plantillasCount != null) ? t.plantillasCount : '';
      const iconName = ICON_MAP[t.icon] || t.icon || 'circle';
      return `<div class="col-12 col-sm-6 col-lg-4 col-xl-3" data-nombre="${escapeHtml(t.nombre)}">
        <article class="neu h-100 d-flex flex-column pb-3">
          <div class="preview neu-in">
            ${ok
              ? `<iframe data-src="${escapeHtml(t.url)}" loading="lazy" tabindex="-1" title="Vista previa de ${escapeHtml(t.nombre)}"></iframe>`
              : `<div class="empty">Sin enlace disponible</div>`
            }
          </div>
           <div class="d-flex align-items-center gap-2 px-3 mt-3">
             <button class="neu-btn ${ok ? '' : 'disabled'} " data-ver="${i}" ${ok ? '' : 'disabled'} style="padding:.3rem .6rem;font-size:.8rem">Ver</button>
             <h3 class="h6 fw-bold m-0">${escapeHtml(t.nombre)} <i data-lucide="${escapeHtml(iconName)}" style="width:16px;height:16px;vertical-align:middle"></i></h3>
           </div>
           ${count !== '' ? `<p class="small text-center opacity-75 mb-2 mt-2">${count} plantillas</p>` : ''}
      </div>`;
    }).join('');

    // Carga diferida de iframes para evitar recargas constantes
    const iframes = $('#grid').querySelectorAll('iframe[data-src]');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const f = e.target;
            if (!f.src && f.dataset.src) {
              f.src = f.dataset.src;
            }
            io.unobserve(f);
          }
        });
      }, { rootMargin: '200px' });
      iframes.forEach(f => io.observe(f));
    } else {
      iframes.forEach(f => { if (f.dataset.src) f.src = f.dataset.src; });
    }

    const create = () => {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    };
    create();
    if (!window.lucide) {
      setTimeout(create, 200);
    }
  }

  attachEvents() {
    $('#grid').addEventListener('click', (e) => {
      const viewBtn = e.target.closest('[data-ver]');
      if (viewBtn) {
        this.onViewTemplate(this.lista[+viewBtn.dataset.ver]);
      }
    });
  }

  filtrar(q) {
    this.filtro = q || '';
    const term = this.filtro.toLowerCase().trim();
    document.querySelectorAll('#grid > div').forEach(card => {
      const nombre = (card.dataset.nombre || '').toLowerCase();
      const match = !term || nombre.includes(term);
      card.style.display = match ? '' : 'none';
    });
  }

  showContinueBox(templateName) {
    const box = $('#continuarBox');
    if (box) box.style.display = 'block';
    const nm = $('#continuarNombre');
    if (nm) nm.textContent = templateName;
  }

  hideContinueBox() {
    const box = $('#continuarBox');
    if (box) box.style.display = 'none';
  }

  show() {
    $('#galeria').style.display = 'block';
  }

  hide() {
    $('#galeria').style.display = 'none';
  }
}


