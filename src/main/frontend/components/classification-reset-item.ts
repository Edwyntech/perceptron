import {html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {apiClient} from '../services.ts';
import {ClassificationItemBase} from './classification-item-base.ts';

@customElement('classification-reset-item')
export class ClassificationResetItem extends ClassificationItemBase {

  @property({type: Boolean})
  open = false;

  protected override async firstUpdated(): Promise<void> {
    await apiClient.getClassification()
      .then(c => this.notifyClassification(c))
      .catch(console.error);
  }

  private onReset(): void {
    this.withAction(() => apiClient.reset().then(c => this.notifyClassification(c)));
  }

  override render() {
    return html`
      <cds-accordion-item title="Remise à zéro"
                          id="classification-reset-item"
                          ?open=${this.open}>
        <cds-button type="button"
                    appearance="primary"
                    ?disabled=${this._busy}
                    @click=${this.onReset}>
          Remettre à zéro
        </cds-button>
      </cds-accordion-item>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'classification-reset-item': ClassificationResetItem;
  }
}
