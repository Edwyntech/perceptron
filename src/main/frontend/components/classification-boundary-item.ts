import {html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {apiClient} from '../services.ts';
import {ClassificationItemBase} from './classification-item-base.ts';

const boundaryEquation = (slope: number, intercept: number): string => {
  if (slope === 0) return `y = ${intercept}`;
  const slopePart = slope === 1 ? 'x' : slope === -1 ? '-x' : `${slope} x`;
  if (intercept === 0) return `y = ${slopePart}`;
  const interceptPart = intercept > 0 ? `+ ${intercept}` : `- ${Math.abs(intercept)}`;
  return `y = ${slopePart} ${interceptPart}`;
};

@customElement('classification-boundary-item')
export class ClassificationBoundaryItem extends ClassificationItemBase {

  @property({type: Boolean})
  open = false;

  @state()
  private _slope = 1;

  @state()
  private _intercept = 0;

  @state()
  private _title = 'Equation de la droite: y = x';

  protected override async firstUpdated(): Promise<void> {
    await apiClient.getClassification()
      .then(c => {
        this._slope = c.boundary.slope;
        this._intercept = c.boundary.intercept;
        this._title = `Equation de la droite: ${boundaryEquation(c.boundary.slope, c.boundary.intercept)}`;
        this.notifyClassification(c);
      })
      .catch(console.error);
  }

  private onBoundaryChange(e: CustomEvent<{ value: string }>): void {
    const input = e.target as HTMLElement;
    const parsed = parseFloat(e.detail.value);
    if (isNaN(parsed)) return;
    if (input.getAttribute('name') === 'slope') this._slope = parsed;
    else if (input.getAttribute('name') === 'intercept') this._intercept = parsed;
    this.withAction(() => apiClient.setClassifier({
      slope: this._slope,
      intercept: this._intercept,
    }).then(c => {
      this._title = `Equation de la droite: ${boundaryEquation(c.boundary.slope, c.boundary.intercept)}`;
      this.notifyClassification(c);
    }));
  }

  override render() {
    return html`
      <cds-accordion-item .title=${this._title}
                          id="classification-line-item"
                          ?open=${this.open}>
        <cds-number-input name="slope"
                          label="pente"
                          min="-10" max="10" step="1"
                          .value=${String(this._slope)}
                          @cds-number-input=${this.onBoundaryChange}>
        </cds-number-input>
        <cds-number-input name="intercept"
                          label="ordonnée"
                          min="-5" max="5" step="1"
                          .value=${String(this._intercept)}
                          @cds-number-input=${this.onBoundaryChange}>
        </cds-number-input>
      </cds-accordion-item>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'classification-boundary-item': ClassificationBoundaryItem;
  }
}
