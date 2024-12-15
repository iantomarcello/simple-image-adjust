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
  @property({ type: Number }) posX: number = 0;
  @property({ type: Number }) posY: number = 0;
  @property({ type: Number }) zoom: number = 1;
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
      overflow: hidden;
      touch-action: none;
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
    this.addEventListener('pointermove', this.onCursorMove);
    this.addEventListener('pointerup', this.onCursorUp);
    this.addEventListener('wheel', this.onWheel);

    // TODO: touch and pinch
  }

  removeEventListeners() {
    this.removeEventListener('pointerdown', this.cursorDown);
    this.removeEventListener('pointermove', this.onCursorMove);
    this.removeEventListener('pointerup', this.onCursorUp);
    this.removeEventListener('wheel', this.onWheel);
    // TODO: touch and pinch
  }

  async fetch(src: string = this.src) {
    this.img = new Image();
    this.img.addEventListener('load', () => {
      this.draw();
    }, { once: true });
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

  evCache: any[] = []
  prevDiff = 0;

  cursorDown(event: PointerEvent) {
    // NOTE: Translate
    this.cursorDownX = event.x - this.posX;
    this.cursorDownY = event.y - this.posY;
    this.isCursorDown = true;

    // NOTE: Scale
    this.evCache.push(event);
  }

  onCursorMove(event: PointerEvent) {
    if (this.isCursorDown) {
      // NOTE: Translate
      this.posX = event.x - this.cursorDownX;
      this.posY = event.y - this.cursorDownY;

      // NOTE: Scale
      // @see https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
      const index = this.evCache.findIndex(
        (cachedEv) => cachedEv.pointerId === event.pointerId,
      );
      this.evCache[index] = event;

      if (this.evCache.length === 2) {
        const curDiff = Math.abs(this.evCache[0].clientX - this.evCache[1].clientX);

        if (this.prevDiff > 0) {
          if (curDiff > this.prevDiff) {
            console.log("Pinch moving OUT -> Zoom in", event);
            this.scale(0.003);
          }
          if (curDiff < this.prevDiff) {
            console.log("Pinch moving IN -> Zoom out", event);
            this.scale(-0.003);
          }
        }

        this.prevDiff = curDiff;
      }
    }
  }

  onCursorUp(event: PointerEvent) {
    // NOTE: Translate
    this.cursorDownX = 0;
    this.cursorDownY = 0;
    this.isCursorDown = false;

    // NOTE: Scale
    const index = this.evCache.findIndex(
      (cachedEv) => cachedEv.pointerId === event.pointerId,
    );
    this.evCache.splice(index, 1);

    if (this.evCache.length < 2) {
      this.prevDiff = -1;
    }
  }

  onWheel(event: WheelEvent) {
    const isZoomIn = event.deltaY < 0;
    if (isZoomIn) {
      this.scale(0.05);
    } else {
      this.scale(-0.05);
    }
  }

  scale(amount = 0) {
    this.zoom += amount;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'simple-image-adjust': SimpleImageAdjust
  }
}
