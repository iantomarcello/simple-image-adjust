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
  @property({type: Number}) zoom: number = 0;
  @query('#canvas') canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D | null;

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
  }

  protected updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('src')) {
      this.fetch(this.src);
    }
  }

  async fetch(src: string = this.src) {
    const img = new Image();
    img.addEventListener('load', () => {
      if (this.ctx) {
        this.ctx.drawImage(img, 0, 0);
      }
    })
    img.src = src;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'simple-image-adjust': SimpleImageAdjust
  }
}
