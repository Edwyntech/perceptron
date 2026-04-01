import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import ExpandAll from '@carbon/icons/es/expand-all/16';
import CollapseAll from '@carbon/icons/es/collapse-all/16';
import {ApiClient} from './api-client.ts';
import {Classification} from './domain.ts';
import {ClassificationChart} from './classification-chart.ts';

const boundaryEquation = (slope: number, intercept: number): string => {
  if (slope === 0) return `y = ${intercept}`;
  const slopePart = slope === 1 ? 'x' : slope === -1 ? '-x' : `${slope} x`;
  if (intercept === 0) return `y = ${slopePart}`;
  const interceptPart = intercept > 0 ? `+ ${intercept}` : `- ${Math.abs(intercept)}`;
  return `y = ${slopePart} ${interceptPart}`;
};

@customElement('classification-toolbar')
export class ClassificationToolbar extends LitElement {
  // Disable Shadow DOM so Carbon Web Components styles and external DOM queries work correctly
  override createRenderRoot() {
    return this;
  }

  private readonly apiClient = new ApiClient();

  @property({attribute: false})
  chartHolder!: ClassificationChart;

  @property({attribute: false})
  notification!: HTMLElement;

  private get lineItem(): HTMLElement {
    return this.querySelector('#classification-line-item') as HTMLElement;
  }

  @state()
  private _busy = false;

  @state()
  private _allExpanded = false;

  @state()
  private _addPointsCount = 100;

  @state()
  private _epochCount = 100;

  @state()
  private _slope = 1;

  @state()
  private _intercept = 0;

  protected override async firstUpdated(): Promise<void> {
    await this.apiClient.getClassification().then(c => this.updateClassification(c)).catch(console.error);
  }

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('notification') && this.notification) {
      const prev = changedProperties.get('notification') as HTMLElement | undefined;
      if (prev) {
        prev.removeEventListener('cds-notification-closed', this.onNotificationClosed);
      }
      this.notification.addEventListener('cds-notification-closed', this.onNotificationClosed);
    }
  }

  private readonly onNotificationClosed = (): void => {
    this.notification.style.display = 'none';
  };

  updateClassification(classification: Classification): void {
    this.chartHolder.classification = classification;
    this._slope = classification.boundary.slope;
    this._intercept = classification.boundary.intercept;
    this.lineItem.setAttribute('title', `Equation de la droite: ${boundaryEquation(classification.boundary.slope, classification.boundary.intercept)}`);
  }

  private showError(message: string): void {
    this.notification.setAttribute('subtitle', message);
    this.notification.style.display = '';
    this.notification.setAttribute('open', '');
  }

  private async withButtons(action: () => Promise<void>): Promise<void> {
    this._busy = true;
    try {
      await action();
    } catch (e) {
      this.showError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      this._busy = false;
    }
  }

  private onBoundaryChange(e: CustomEvent<{value: string}>): void {
    const input = e.target as HTMLElement;
    if (input.getAttribute('name') === 'slope') this._slope = parseFloat(e.detail.value);
    else if (input.getAttribute('name') === 'intercept') this._intercept = parseFloat(e.detail.value);
    this.withButtons(() => this.apiClient.setClassifier({slope: this._slope, intercept: this._intercept}).then(c => this.updateClassification(c)));
  }

  private onReset(): void {
    this.withButtons(() => this.apiClient.reset().then(c => this.updateClassification(c)));
  }

  private onAddPoints(): void {
    const count = this._addPointsCount;
    this.withButtons(async () => {
      let promise = Promise.resolve();
      for (let i = 0; i < count; i++) {
        promise = promise.then(() => this.apiClient.addPoint().then(c => this.updateClassification(c)));
      }
      await promise;
    });
  }

  private onTrain(): void {
    const epochCount = this._epochCount;
    this.withButtons(async () => {
      let promise = Promise.resolve();
      for (let i = 0; i < epochCount; i++) {
        promise = promise.then(() => this.apiClient.train().then(c => this.updateClassification(c)));
      }
      await promise;
    });
  }

  override render() {
    return html`
      <cds-button-set>
        <cds-icon-button id="expand-all-btn" label="Tout déplier" size="sm" kind="ghost"
                         @click=${() => this._allExpanded = true}>
          <cds-icon slot="icon" .icon=${ExpandAll}></cds-icon>
        </cds-icon-button>
        <cds-icon-button id="collapse-all-btn" label="Tout replier" size="sm" kind="ghost"
                         @click=${() => this._allExpanded = false}>
          <cds-icon slot="icon" .icon=${CollapseAll}></cds-icon>
        </cds-icon-button>
      </cds-button-set>

      <style>
        classification-toolbar .boundary-inputs {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
        }

        classification-toolbar .boundary-inputs cds-number-input {
          width: 150px;
        }
      </style>

      <cds-accordion>
        <cds-accordion-item title="Equation de la droite: y = x" id="classification-line-item"
                            ?open=${this._allExpanded}>
          <div class="boundary-inputs">
            <p>y =</p>
            <cds-number-input name="slope" label="pente" min="-100" max="100" .value=${String(this._slope)} step="1"
                              @cds-number-input=${this.onBoundaryChange}></cds-number-input>
            <p>x +</p>
            <cds-number-input name="intercept" label="ordonnée" min="-1000" max="1000" .value=${String(this._intercept)}
                              step="1" @cds-number-input=${this.onBoundaryChange}></cds-number-input>
          </div>
        </cds-accordion-item>

        <cds-accordion-item title="Ajout de points" id="classification-add-points-item" ?open=${this._allExpanded}>
          <cds-number-input name="count" label="nombre de points" min="1" max="1000"
                            .value=${String(this._addPointsCount)} step="1" @cds-number-input=${(e: CustomEvent<{
            value: string
          }>) => this._addPointsCount = parseInt(e.detail.value)}></cds-number-input>
          <cds-button type="button" appearance="primary" ?disabled=${this._busy} @click=${this.onAddPoints}>Ajouter
          </cds-button>
        </cds-accordion-item>

        <cds-accordion-item title="Entrainement" id="classification-training-item" ?open=${this._allExpanded}>
          <cds-number-input name="count" label="nombre de points" min="1" max="1000" .value=${String(this._epochCount)}
                            step="1" @cds-number-input=${(e: CustomEvent<{
            value: string
          }>) => this._epochCount = parseInt(e.detail.value)}></cds-number-input>
          <cds-button type="button" appearance="primary" ?disabled=${this._busy} @click=${this.onTrain}>Entrainer
          </cds-button>
        </cds-accordion-item>

        <cds-accordion-item title="Remise à zéro" id="classification-reset-item" ?open=${this._allExpanded}>
          <cds-button type="button" appearance="primary" ?disabled=${this._busy} @click=${this.onReset}>Remettre à
            zéro
          </cds-button>
        </cds-accordion-item>

      </cds-accordion>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'classification-toolbar': ClassificationToolbar;
  }
}
