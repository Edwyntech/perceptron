import {html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {apiClient} from '../services.ts';
import {ClassificationItemBase} from './classification-item-base.ts';

@customElement('classification-add-points-item')
export class ClassificationAddPointsItem extends ClassificationItemBase {

  @property({type: Boolean})
  open = false;

  @state()
  private _addPointsCount = 100;

  protected override async firstUpdated(): Promise<void> {
    await apiClient.getClassification()
      .then(c => this.notifyClassification(c))
      .catch(console.error);
  }

  private onAddPoints(): void {
    const count = this._addPointsCount;
    this.withAction(async () => {
      let promise = Promise.resolve();
      for (let i = 0; i < count; i++) {
        promise = promise.then(() => apiClient.addPoint().then(c => this.notifyClassification(c)));
      }
      await promise;
    });
  }

  override render() {
    return html`
      <cds-accordion-item id="classification-add-points-item"
                          title="Ajout de points"
                          ?open=${this.open}>
        <cds-number-input name="count"
                          label="nombre de points"
                          min="1" max="1000" step="1"
                          .value=${String(this._addPointsCount)}
                          @cds-number-input=${(e: CustomEvent<{ value: string }>) => this._addPointsCount = parseInt(e.detail.value)}>
        </cds-number-input>
        <cds-button type="button"
                    appearance="primary"
                    ?disabled=${this._busy}
                    @click=${this.onAddPoints}>
          Ajouter
        </cds-button>
      </cds-accordion-item>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'classification-add-points-item': ClassificationAddPointsItem;
  }
}
