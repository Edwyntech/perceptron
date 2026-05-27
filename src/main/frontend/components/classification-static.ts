import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {Classification, Label} from '../domain.ts';
import './classification-chart.ts';
import './classification-manual-config.ts';
import './classification-perceptron.ts';

@customElement('classification-static')
export class ClassificationStatic extends LitElement {

  // Disable Shadow DOM so Carbon Web Components and custom CSS apply correctly
  override createRenderRoot() {
    return this;
  }

  @state()
  private _w1 = 0.5;

  @state()
  private _w2 = -0.5;

  @state()
  private _bias = 0.1;

  private _staticPoints = Array.from({ length: 1000 }, () => ({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1
  }));

  private _onManualConfigChanged(e: CustomEvent<{ prop: 'w1' | 'w2' | 'bias'; value: number }>) {
    const { prop, value } = e.detail;
    if (prop === 'w1') this._w1 = value;
    else if (prop === 'w2') this._w2 = value;
    else if (prop === 'bias') this._bias = value;
  }

  get _classification(): Classification {
    const w2Adjusted = Math.abs(this._w2) < 1e-9 ? (this._w2 < 0 ? -1e-9 : 1e-9) : this._w2;
    const slope = -this._w1 / w2Adjusted;
    const intercept = -this._bias / w2Adjusted;

    // Fixed educational target: y = 0.5x - 0.1
    const targetSlope = 0.5;
    const targetIntercept = -0.1;

    // Classify all points dynamically based on manual weights:
    // w1 * x + w2 * y + bias > 0 => ABOVE, else BELOW
    const points = this._staticPoints.map(p => {
      const activation = this._w1 * p.x + this._w2 * p.y + this._bias;
      const label: Label = activation > 0 ? 'ABOVE' : 'BELOW';
      return { x: p.x, y: p.y, label };
    });

    return {
      boundary: { slope: targetSlope, intercept: targetIntercept },
      prediction: { slope, intercept },
      points
    };
  }

  override render() {
    return html`
      <div class="static-controls">
        <classification-manual-config
          class="scrollable-card"
          .w1=${this._w1}
          .w2=${this._w2}
          .bias=${this._bias}
          @manual-config-changed=${this._onManualConfigChanged}>
        </classification-manual-config>

        <classification-perceptron
          .weights=${[this._w1, this._w2, this._bias]}
          .prediction=${this._classification.prediction}>
        </classification-perceptron>
      </div>

      <div class="static-chart-container">
        <classification-chart .classification=${this._classification}></classification-chart>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'classification-static': ClassificationStatic;
  }
}
