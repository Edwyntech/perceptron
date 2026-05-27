import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('classification-header')
export class ClassificationHeader extends LitElement {
  // Disable Shadow DOM so Carbon Web Components styles work correctly
  override createRenderRoot() {
    return this;
  }

  @property({type: String})
  activeTab = 'entrainement';

  private _selectTab(tab: string) {
    this.activeTab = tab;
    this.dispatchEvent(new CustomEvent('tab-changed', {
      detail: {tab},
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    return html`
      <cds-header aria-label="Edwyn Days">
        <cds-header-name href="javascript:void 0"
                         prefix="Edwyn Days">
          [Perceptron]
        </cds-header-name>
        <cds-header-nav aria-label="App Navigation">
          <cds-header-nav-item href="javascript:void 0"
                               ?active=${this.activeTab === 'entrainement'}
                               @click=${() => this._selectTab('entrainement')}>
            Entrainement
          </cds-header-nav-item>
          <cds-header-nav-item href="javascript:void 0"
                               ?active=${this.activeTab === 'statique'}
                               @click=${() => this._selectTab('statique')}>
            Statique
          </cds-header-nav-item>
        </cds-header-nav>
      </cds-header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'classification-header': ClassificationHeader;
  }
}
