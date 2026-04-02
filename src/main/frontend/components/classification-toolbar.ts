import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import ExpandAll from '@carbon/icons/es/expand-all/16';
import CollapseAll from '@carbon/icons/es/collapse-all/16';
import {Classification, ClassificationUpdatedEvent} from '../domain.ts';
import './classification-boundary-item.ts';
import './classification-add-points-item.ts';
import './classification-training-item.ts';
import './classification-reset-item.ts';
import './classification-perceptron.ts';

@customElement('classification-toolbar')
export class ClassificationToolbar extends LitElement {

  // Disable Shadow DOM so Carbon Web Components styles (injected into document) apply correctly
  override createRenderRoot() {
    return this;
  }

  @property({attribute: false})
  classification: Classification | null = null;

  @state()
  private _allExpanded = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener(ClassificationUpdatedEvent.NAME, this._onClassificationUpdated);
    this.addEventListener('classification-error', this._onClassificationError);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener(ClassificationUpdatedEvent.NAME, this._onClassificationUpdated);
    this.removeEventListener('classification-error', this._onClassificationError);
  }

  private readonly _onClassificationUpdated = (e: Event): void => {
    // Re-dispatch upward so the app controller can update the chart
    const classification = (e as ClassificationUpdatedEvent).detail;
    this.dispatchEvent(new ClassificationUpdatedEvent(classification));
  };

  private readonly _onClassificationError = (e: Event): void => {
    const message = (e as CustomEvent<string>).detail;
    const notification = document.getElementById('error-notification');
    if (notification) {
      notification.setAttribute('subtitle', message);
      notification.style.display = '';
      notification.setAttribute('open', '');
    }
  };

  override render() {
    return html`
      <cds-button-set>
        <cds-icon-button id="collapse-all-btn"
                         label="Tout replier"
                         size="sm"
                         kind="ghost"
                         @click=${() => this._allExpanded = false}>
          <cds-icon slot="icon" .icon=${CollapseAll}></cds-icon>
        </cds-icon-button>
        <cds-icon-button id="expand-all-btn"
                         label="Tout déplier"
                         size="sm"
                         kind="ghost"
                         @click=${() => this._allExpanded = true}>
          <cds-icon slot="icon" .icon=${ExpandAll}></cds-icon>
        </cds-icon-button>
      </cds-button-set>

      <cds-accordion>
        <classification-boundary-item ?open=${this._allExpanded}></classification-boundary-item>
        <classification-add-points-item ?open=${this._allExpanded}></classification-add-points-item>
        <classification-training-item ?open=${this._allExpanded}></classification-training-item>
        <classification-reset-item ?open=${this._allExpanded}></classification-reset-item>
      </cds-accordion>

      <classification-perceptron
        .classification=${this.classification}>
      </classification-perceptron>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'classification-toolbar': ClassificationToolbar;
  }
}
