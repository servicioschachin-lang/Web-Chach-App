/* Gestion del formulario de contacto */
import { $ } from './utils.js';

export class FormHandler {
  constructor(editor) {
    this.editor = editor;
    this.init();
  }

  init() {
    this.attachEvents();
    this.setupFormspree();
  }

  attachEvents() {
    $('#btnPublicar').addEventListener('click', () => {
      $('#pubErr').style.display = 'none';
      $('#pubOk').style.display = 'none';
      $('#pubCampos').style.display = 'block';
      $('#btnEnviar').style.display = '';
      this.modal.show();
    });

    $('#formPublicar').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(e);
    });
  }

  async handleSubmit(e) {
    const form = e.target;
    const btn = $('#btnEnviar');
    const err = $('#pubErr');
    btn.disabled = true;
    btn.textContent = 'Enviando...';
    err.style.display = 'none';

    try {
      const resp = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (!resp.ok) throw new Error('Error al enviar');
      $('#pubCampos').style.display = 'none';
      $('#pubOk').style.display = 'block';
      form.reset();
    } catch (x) {
      err.textContent = 'No se pudo enviar. Intenta de nuevo.';
      err.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Enviar';
    }
  }

  setupFormspree() {
    if (typeof formspree !== 'undefined') {
      formspree('initForm', { formElement: '#formPublicar', formId: 'xrengvqb' });
      formspree('onSubmit', () => {
        $('#pubOkTxt').textContent = 'Recibimos tu informacion. Te contactaremos pronto.';
        $('#pubCampos').style.display = 'none';
        $('#pubOk').style.display = 'block';
        $('#btnEnviar').style.display = 'none';
        $('#formPublicar').reset();
      });

      formspree('onError', (event) => {
        const err = $('#pubErr');
        const messages = event.errors ? event.errors.map(e => e.message).join(', ') : 'No se pudo enviar. Intenta de nuevo.';
        err.textContent = messages;
        err.style.display = 'block';
        $('#btnEnviar').disabled = false;
        $('#btnEnviar').textContent = 'Enviar';
      });
    }
  }

  setModal(modal) {
    this.modal = modal;
  }
}
