import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('classification-header')
export class ClassificationHeader extends LitElement {
  // Disable Shadow DOM so Carbon Web Components styles work correctly
  override createRenderRoot() {
    return this;
  }

  override render() {
    return html`
      <cds-header aria-label="Edwyn Days">
        <cds-header-name href="javascript:void 0" prefix="Edwyn Days">[Perceptron]</cds-header-name>
      </cds-header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'classification-header': ClassificationHeader;
  }
}
