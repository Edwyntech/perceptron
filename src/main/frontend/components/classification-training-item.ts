import {html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {apiClient} from '../services.ts';
import {ClassificationItemBase} from './classification-item-base.ts';

@customElement('classification-training-item')
export class ClassificationTrainingItem extends ClassificationItemBase {

  @property({type: Boolean})
  open = false;

  @state()
  private _testedCount = 0;

  @state()
  private _epochCount = 1000;

  @state()
  private _learningRate = 0.01;

  protected override async firstUpdated(): Promise<void> {
    await apiClient.getClassification()
      .then(c => this.notifyClassification(c))
      .catch(console.error);
  }

  private onLearningRateChange(value: string): void {
    const lr = parseFloat(value);
    if (!isNaN(lr)) {
      this._learningRate = lr;
      apiClient.setLearningRate(lr).catch(console.error);
    }
  }

  private onTrain(): void {
    const epochCount = this._epochCount;
    this._testedCount = 0;
    this.withAction(async () => {
      let promise = Promise.resolve();
      for (let i = 0; i < epochCount; i++) {
        promise = promise.then(() => apiClient.train().then(c => {
          this._testedCount++;
          this.notifyClassification(c);
        }));
      }
      await promise;
    });
  }

  override render() {
    return html`
      <cds-accordion-item title="Entrainement"
                          id="classification-training-item"
                          ?open=${this.open}>
        <cds-number-input name="learning-rate"
                          label="taux d'apprentissage"
                          min="0.001" max="1" step="0.001"
                          .value=${String(this._learningRate)}
                          @cds-number-input=${(e: CustomEvent<{ value: string }>) => this.onLearningRateChange(e.detail.value)}>
        </cds-number-input>
        <cds-number-input name="count"
                          label="nombre d'époques"
                          min="1" max="1000" step="1"
                          .value=${String(this._epochCount)}
                          @cds-number-input=${(e: CustomEvent<{ value: string }>) => this._epochCount = parseInt(e.detail.value)}>
        </cds-number-input>
        <cds-button type="button"
                    appearance="primary"
                    ?disabled=${this._busy}
                    @click=${this.onTrain}>
          Entrainer
        </cds-button>
        ${this._testedCount > 0 ? html`<span>(${this._testedCount})</span>` : ''}
      </cds-accordion-item>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'classification-training-item': ClassificationTrainingItem;
  }
}
