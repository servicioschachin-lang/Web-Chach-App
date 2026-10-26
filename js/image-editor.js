export class ImageEditor {
  constructor(onChange) { this.onChange = onChange; }
  replace(img) {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = () => {
      const f = inp.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        const im = new Image();
        im.onload = () => {
          const M = 1600;
          const k = Math.min(1, M / Math.max(im.width, im.height));
          const c = document.createElement('canvas');
          c.width = Math.round(im.width * k);
          c.height = Math.round(im.height * k);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          const data = f.type === 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', .85);
          img.removeAttribute('srcset');
          img.removeAttribute('sizes');
          img.src = data;
          if (this.onChange) this.onChange();
        };
        im.src = rd.result;
      };
      rd.readAsDataURL(f);
    };
    inp.click();
  }
}
