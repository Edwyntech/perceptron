import {html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {apiClient} from '../services.ts';
import {ClassificationItemBase} from './classification-item-base.ts';

const boundaryEquation = (slope: number, intercept: number): string => {
  if (slope === 0) return `y = ${intercept}`;
  let slopePart = `${slope} x`;
  if (slope === 1) {
    slopePart = 'x';
  } else if (slope === -1) {
    slopePart = '-x';
  }
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

  protected override firstUpdated(): void {
    super.firstUpdated();
    apiClient.getClassification()
      .then(c => {
        this._slope = c.boundary.slope;
        this._intercept = c.boundary.intercept;
        this._title = `Equation de la droite: ${boundaryEquation(c.boundary.slope, c.boundary.intercept)}`;
        this.notifyClassification(c);
      })
      .catch(console.error);
  }

  private onBoundaryChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    const parsed = Number.parseFloat(input.value);
    if (Number.isNaN(parsed)) return;
    if (input.getAttribute('name') === 'slope') this._slope = parsed;
    else if (input.getAttribute('name') === 'intercept') this._intercept = parsed;
    void this.withAction(() => apiClient.setClassifier({
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
        <div class="inline-equation">
          <span class="equation-text">y =</span>
          <input type="number"
                 name="slope"
                 class="eq-input"
                 min="-10" max="10" step="1"
                 .value=${String(this._slope)}
                 @input=${this.onBoundaryChange}>
          <span class="equation-text">x</span>
          <span class="equation-text" style="visibility: ${this._intercept >= 0 ? 'visible' : 'hidden'}">+</span>
          <input type="number"
                 name="intercept"
                 class="eq-input"
                 min="-5" max="5" step="1"
                 .value=${String(this._intercept)}
                 @input=${this.onBoundaryChange}>
        </div>
      </cds-accordion-item>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'classification-boundary-item': ClassificationBoundaryItem;
  }
}
