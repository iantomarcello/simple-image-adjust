import { LitElement, PropertyValues, css, html } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import litLogo from './assets/lit.svg'
import viteLogo from '/vite.svg'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('simple-image-adjust')
export class SimpleImageAdjust extends LitElement {
  @property() src!: string;
  @property({type: Number}) posX: number = 0;
  @property({type: Number}) posY: number = 0;
  @property({type: Number}) zoom: number = 1;
  @query('#canvas') canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D | null;
  img = new Image();
  isCursorDown = false;
  cursorDownX = 0;
  cursorDownY = 0;

  static styles = css`
    :host {
      display: block;
    }

    #wrapper, #canvas {
      width: 100%;
      height: 100%;
    }

    #controls {

    }
  `

  render() {
    return html`
      <div id="wrapper">
        <canvas id="canvas"></canvas>
        <div id="controls">
          <!-- Zoom in out -->
        </div>
      </div>
    `
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.ctx = this.canvas.getContext('2d');
    this.initEventListeners();
  }

  protected updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('src')) {
      this.fetch(this.src);
    }
    if (['posX', 'posY', 'zoom'].some(prop => _changedProperties.has(prop))) {
      this.draw();
    }
  }

  initEventListeners() {
    this.addEventListener('pointerdown', this.cursorDown);
    this.addEventListener('pointermove', this.cursorMove);
    this.addEventListener('pointerup', this.cursorUp);
    this.addEventListener('wheel', this.scale);
    // TODO: touch and pinch
  }

  removeEventListeners() {
    this.removeEventListener('pointerdown', this.cursorDown);
    this.removeEventListener('pointermove', this.cursorMove);
    this.removeEventListener('pointerup', this.cursorUp);
    this.removeEventListener('wheel', this.scale);
    // TODO: touch and pinch
  }

  async fetch(src: string = this.src) {
    this.img = new Image();
    this.img.addEventListener('load', () => {
      this.draw();
    }, {once: true});
    this.img.src = src;
  }

  draw() {
    if (this.ctx) {
      const { width, height } = this.img;
      const ratio = width / height;
      
      this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
      this.ctx.drawImage(
        this.img,
        this.posX,
        this.posY,
        width * this.zoom,
        height * this.zoom,
      );
    }
  }

  cursorDown(event: PointerEvent) {
    this.cursorDownX = event.x - this.posX,
    this.cursorDownY = event.y - this.posY,
    this.isCursorDown = true;
  }

  cursorMove(event: PointerEvent) {
    if (this.isCursorDown) {
      this.posX = event.x - this.cursorDownX;
      this.posY = event.y - this.cursorDownY;
    }
  }

  cursorUp(event: PointerEvent) {
    this.cursorDownX = 0,
    this.cursorDownY = 0,
    this.isCursorDown = false;
  }

  scale(event: WheelEvent) {
    const isZoomIn = event.deltaY < 0;
    if (isZoomIn) {
      this.zoom += 0.2;
    } else {
      this.zoom -= 0.2;
    }
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'simple-image-adjust': SimpleImageAdjust
  }
}
