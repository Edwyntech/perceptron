import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('classification-manual-config')
export class ClassificationManualConfig extends LitElement {

  // Disable Shadow DOM so Carbon Web Components and custom CSS apply correctly
  override createRenderRoot() {
    return this;
  }

  @property({type: Number})
  w1 = 0.5;

  @property({type: Number})
  w2 = -0.5;

  @property({type: Number})
  bias = 0.1;

  private _onSliderChange(prop: 'w1' | 'w2' | 'bias', e: CustomEvent) {
    const target = e.target as any;
    const value = Number.parseFloat(target.value);
    if (Number.isNaN(value)) return;

    this.dispatchEvent(new CustomEvent('manual-config-changed', {
      detail: {
        prop,
        value,
      },
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    return html`
      <div class="control-card" style="height: 100%; display: flex; flex-direction: column; min-height: 0;">
        <h3 style="flex-shrink: 0; margin-top: 0; margin-bottom: 8px;">Configuration manuelle</h3>
        <p class="description" style="flex-shrink: 0; margin-bottom: 16px;">
          Ajustez manuellement les poids et le biais du perceptron pour observer la droite résultante et la classification des points.
        </p>

        <div class="slider-group" style="flex: 1; overflow-y: auto; padding-right: 8px;">
          <cds-slider
            label-text="Poids w₁ (x₁)"
            min="-2" max="2" step="0.05"
            .value=${this.w1}
            @cds-slider-changed=${(e: CustomEvent) => this._onSliderChange('w1', e)}>
          </cds-slider>

          <cds-slider
            label-text="Poids w₂ (x₂)"
            min="-2" max="2" step="0.05"
            .value=${this.w2}
            @cds-slider-changed=${(e: CustomEvent) => this._onSliderChange('w2', e)}>
          </cds-slider>

          <cds-slider
            label-text="Biais b"
            min="-2" max="2" step="0.05"
            .value=${this.bias}
            @cds-slider-changed=${(e: CustomEvent) => this._onSliderChange('bias', e)}>
          </cds-slider>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'classification-manual-config': ClassificationManualConfig;
  }
}
