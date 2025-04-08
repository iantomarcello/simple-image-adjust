import { LitElement, PropertyValues, css, html } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'

/**
 * An image loader that can be reposition and rescaled.
 *
 * @property {string} src - The image source URL.
 * @property {number} offsetX - The horizontal offset.
 * @property {number} offsetY - The vertical offset.
 * @property {number} zoom - The zoom level.
 * @property {boolean} editMode - Enable edit mode.
 */

@customElement('simple-image-adjust')
export class SimpleImageAdjust extends LitElement {
  @property() src!: string;
  @property({ type: Number }) offsetX: number = 0;
  @property({ type: Number }) offsetY: number = 0;
  @property({ type: Number }) zoom: number = 1;
  @property({ type: Boolean, attribute: "edit-mode" }) editMode: boolean = false;
  @query('#canvas') canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D | null;
  img = new Image();
  isCursorDown = false;
  cursorDownX = 0;
  cursorDownY = 0;
  eventCache: PointerEvent[] = [];
  cursorPrevDiff = 0;

  static styles = css`
    :host {
      display: block;
      position: relative;
    }

    #wrapper, #canvas {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    #wrapper:not(:has([hidden])) #canvas {
      touch-action: none;
    }

    #controls {
      position: absolute;
      left: 50%;
      bottom: 1rem;
      translate: -50% 0;
      display: flex;
      gap: 1rem;
    }

    button {
      margin: 0;
      padding: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #56565656;
      border: 1px solid #56565656;
      border-radius: 50%;
      cursor: pointer;

      &:hover, &:focus {
        background-color: #56565669;
      }
    }

    [hidden] {
      display: none !important;
    }
  `

  render() {
    return html`
      <div id="wrapper">
        <canvas id="canvas"></canvas>
        <div id="controls" .hidden=${!this.editMode}>
          <button type="button" title="zoom in" @click=${() => this.scale(0.05)}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Zm-40-60v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z"/></svg>
          </button>
          <button type="button" title="zoom out" @click=${() => this.scale(-0.05)}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400ZM280-540v-80h200v80H280Z"/></svg>
          </button>
          <button type="button" title="reset" @click=${this.resetAdjusments}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M440-122q-121-15-200.5-105.5T160-440q0-66 26-126.5T260-672l57 57q-38 34-57.5 79T240-440q0 88 56 155.5T440-202v80Zm80 0v-80q87-16 143.5-83T720-440q0-100-70-170t-170-70h-3l44 44-56 56-140-140 140-140 56 56-44 44h3q134 0 227 93t93 227q0 121-79.5 211.5T520-122Z"/></svg>
          </button>
        </div>
      </div>
    `
  }

  protected firstUpdated(): void {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.ctx = this.canvas.getContext('2d');

    if (this.editMode) {
      this.addEventListeners();
    }
  }

  protected updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('src')) {
      this.fetch(this.src);
    }
    if (_changedProperties.has('editMode')) {
      if (this.editMode) {
        this.addEventListeners();
      } else {
        this.removeEventListeners();
      }
    }
    if (['offsetX', 'offsetY', 'zoom'].some(prop => _changedProperties.has(prop))) {
      this.draw();
    }
  }

  addEventListeners() {
    this.addEventListener('pointerdown', this.cursorDown);
    window.addEventListener('pointermove', this.onCursorMove);
    window.addEventListener('pointerup', this.onCursorUp);
    this.addEventListener('wheel', this.onWheel);
  }

  removeEventListeners() {
    this.removeEventListener('pointerdown', this.cursorDown);
    window.removeEventListener('pointermove', this.onCursorMove);
    window.removeEventListener('pointerup', this.onCursorUp);
    this.removeEventListener('wheel', this.onWheel);
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
      const centreX = this.clientWidth / 2 - this.img.width / 2 * this.zoom;
      const centreY = this.clientHeight / 2 - this.img.height / 2 * this.zoom;

      this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
      this.ctx.drawImage(
        this.img,
        centreX + this.offsetX,
        centreY + this.offsetY,
        width * this.zoom,
        height * this.zoom,
      );
    }
  }

  cursorDown(event: PointerEvent) {
    // NOTE: Translate
    this.cursorDownX = event.x - this.offsetX;
    this.cursorDownY = event.y - this.offsetY;
    this.isCursorDown = true;

    // NOTE: Scale
    this.eventCache.push(event);
  }

  onCursorMove = (event: PointerEvent) => {
    if (this.isCursorDown) {
      // NOTE: Translate
      this.offsetX = event.x - this.cursorDownX;
      this.offsetY = event.y - this.cursorDownY;

      // NOTE: Scale
      // @see https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
      const index = this.eventCache.findIndex(
        (cachedEv) => cachedEv.pointerId === event.pointerId,

      );
      this.eventCache[index] = event;

      if (this.eventCache.length === 2) {
        const curDiff = Math.abs(this.eventCache[0].clientX - this.eventCache[1].clientX);

        if (this.cursorPrevDiff > 0) {
          if (curDiff > this.cursorPrevDiff) {
            this.scale(0.003);
          }
          if (curDiff < this.cursorPrevDiff) {
            this.scale(-0.003);
          }
        }

        this.cursorPrevDiff = curDiff;
      }
    }
  }

  onCursorUp = (event: PointerEvent) => {
    // NOTE: Translate
    this.cursorDownX = 0;
    this.cursorDownY = 0;
    this.isCursorDown = false;

    // NOTE: Scale
    const index = this.eventCache.findIndex(
      (cachedEv) => cachedEv.pointerId === event.pointerId,
    );
    this.eventCache.splice(index, 1);

    if (this.eventCache.length < 2) {
      this.cursorPrevDiff = -1;
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

  resetAdjusments() {
    this.offsetX = 0;
    this.offsetY = 0;
    this.zoom = 1;
  }

  disconnectedCallback(): void {
    this.removeEventListeners();
    super.disconnectedCallback();
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'simple-image-adjust': SimpleImageAdjust
  }
}
