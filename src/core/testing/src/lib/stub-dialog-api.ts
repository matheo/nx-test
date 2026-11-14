/**
 * Installs minimal `showModal`/`close` polyfills on HTMLDialogElement when the
 * environment (e.g. jsdom) does not implement them.
 */
export function stubDialogApi(): void {
  const proto = HTMLDialogElement.prototype;
  if (!proto.showModal) {
    proto.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
  }
  if (!proto.close) {
    proto.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
  }
}
