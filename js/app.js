/* Aplicación principal - Orquestador */
import { CONFIG } from './config.js';
import { $ } from './utils.js';
import { Gallery } from './gallery.js';
import { FormHandler } from './form-handler.js';

class App {
  constructor() {
    this.gallery = null;
    this.editor = null;
    this.formHandler = null;
    this.toast = null;
    this.modalPublish = null;
    this.modalPreview = null;
  }

  init() {
    this.setupUI();
    this.setupComponents();
    this.setupEventListeners();
    this.loadSavedState();
    // Desregistrar Service Worker existente
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
  }

  setupUI() {
    console.log('setupUI: Iniciando configuración de UI');
    console.log('setupUI: Elementos en DOM:', document.querySelectorAll('*').length);
    const btnRegresar = document.getElementById('btnRegresar');
    console.log('setupUI: btnRegresar encontrado:', !!btnRegresar);
    if (btnRegresar) {
      btnRegresar.href = CONFIG.CREAWEB_URL;
      console.log('setupUI: href actualizado a:', CONFIG.CREAWEB_URL);
    } else {
      console.warn('setupUI: elemento #btnRegresar no encontrado en el DOM');
    }
  }

  setupComponents() {
    this.toast = new bootstrap.Toast($('#toast'), { delay: 3500 });
    this.modalPublish = new bootstrap.Modal($('#modalPublicar'));
    this.modalPreview = new bootstrap.Modal($('#modalVista'));

    this.formHandler = new FormHandler(null);
    this.formHandler.setModal(this.modalPublish);

    this.gallery = new Gallery(
      (template) => this.previewTemplate(template)
    );
  }

  setupEventListeners() {
    const buscador = $('#buscadorRubros');
    if (buscador) {
      buscador.addEventListener('input', (e) => {
        this.gallery.filtrar(e.target.value);
      });
    }
  }

  async previewTemplate(template) {
    try {
      const vistaFrame = $('#vistaFrame');
      const vistaLoader = $('#vistaLoader');
      if (!vistaFrame) throw new Error('Iframe de vista previa no encontrado');

      // Mostrar loader
      if (vistaLoader) vistaLoader.style.display = 'flex';

      // Mostrar modal
      this.modalPreview.show();

      // Cargar el iframe directamente evita problemas de CORS con dominios externos
      vistaFrame.src = template.url;

      // Ocultar loader cuando el iframe cargue
      vistaFrame.onload = () => {
        if (vistaLoader) vistaLoader.style.display = 'none';
      };

      // Timeout para ocultar loader si tarda mucho
      setTimeout(() => {
        if (vistaLoader) vistaLoader.style.display = 'none';
      }, 5000);
    } catch (err) {
      this.showNotification('No se pudo cargar la plantilla. Revisa tu conexión.');
      console.error(err);
      const vistaLoader = $('#vistaLoader');
      if (vistaLoader) vistaLoader.style.display = 'none';
    }
  }

  addBaseToHtml(html, base) {
    const tag = `<base href="${base}" data-cw="1">`;
    return /<head[^>]*>/i.test(html)
      ? html.replace(/<head[^>]*>/i, m => m + tag)
      : tag + html;
  }

  loadSavedState() {
    // Continuar edición deshabilitado: no se muestra progreso guardado
  }

  continueEditing() {
    try {
      const g = JSON.parse(localStorage.getItem(CONFIG.STORE_KEY) || 'null');
      if (g && g.html) {
        this.editor.loadFromStorage(g);
        $('#edEstado').textContent = 'Cambios restaurados';
        this.gallery.hideContinueBox();
      }
    } catch (e) {}
  }

  updateContinueBox() {}

  showNotification(message) {
    $('#toastMsg').textContent = message;
    this.toast.show();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
