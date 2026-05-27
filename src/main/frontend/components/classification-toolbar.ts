import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Classification, ClassificationUpdatedEvent} from '../domain.ts';
import {apiClient} from '../services.ts';
import './classification-boundary-item.ts';
import './classification-add-points-item.ts';
import './classification-training-item.ts';
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
  private _openSection: string | null = null;

  @state()
  private _busy = false;

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
    if (e.target === this) return;
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

  private _handleBeingToggled(e: CustomEvent): void {
    const target = e.target as HTMLElement;
    const isOpening = e.detail.open;

    if (isOpening) {
      const wrapper = target.closest('classification-boundary-item, classification-add-points-item, classification-training-item');
      if (wrapper) {
        this._openSection = wrapper.getAttribute('data-section');
      }
    } else {
      const wrapper = target.closest('classification-boundary-item, classification-add-points-item, classification-training-item');
      if (wrapper) {
        const section = wrapper.getAttribute('data-section');
        if (this._openSection === section) {
          this._openSection = null;
        }
      }
    }
  }

  private async _onReset(): Promise<void> {
    if (this._busy) return;
    this._busy = true;
    try {
      const c = await apiClient.reset();
      this.dispatchEvent(new ClassificationUpdatedEvent(c));
    } catch (e) {
      this.dispatchEvent(new CustomEvent('classification-error', {
        detail: e instanceof Error ? e.message : 'An unexpected error occurred.',
        bubbles: true,
        composed: true,
      }));
    } finally {
      this._busy = false;
    }
  }

  override render() {
    return html`
      <div class="control-card scrollable-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-shrink: 0;">
          <h3 style="margin: 0;">Paramètres</h3>
          <cds-icon-button
            size="sm"
            kind="ghost"
            ?disabled=${this._busy}
            @click=${this._onReset}
            align="bottom-right">
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="16" height="16">
              <path d="M18,28A12,12,0,1,0,6,16v6.2L2.4,18.6,1,20l6,6,6-6-1.4-1.4L8,22.2V16H8A10,10,0,1,1,18,26Z"></path>
            </svg>
            <span slot="tooltip-content">Remettre à zéro</span>
          </cds-icon-button>
        </div>

        <cds-accordion class="scrollable-content" @cds-accordion-item-beingtoggled=${this._handleBeingToggled}>
          <classification-boundary-item ?open=${this._openSection === 'boundary'} data-section="boundary">
          </classification-boundary-item>
          <classification-add-points-item ?open=${this._openSection === 'add-points'} data-section="add-points"
                                          .classification=${this.classification}>
          </classification-add-points-item>
          <classification-training-item ?open=${this._openSection === 'training'} data-section="training"
                                        .classification=${this.classification}>
          </classification-training-item>
        </cds-accordion>
      </div>

      <classification-perceptron
        .classification=${this.classification}
        .weights=${this.classification?.weights ?? null}>
      </classification-perceptron>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'classification-toolbar': ClassificationToolbar;
  }
}
