import {html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {apiClient} from '../services.ts';
import {ClassificationItemBase} from './classification-item-base.ts';
import {Classification} from '../domain.ts';

@customElement('classification-add-points-item')
export class ClassificationAddPointsItem extends ClassificationItemBase {

  @property({type: Boolean})
  open = false;

  @property({attribute: false})
  classification: Classification | null = null;

  @state()
  private _addPointsCount = 1000;

  protected override async firstUpdated(): Promise<void> {
    await apiClient.getClassification()
      .then(c => this.notifyClassification(c))
      .catch(console.error);
  }

  private onAddPoints(): void {
    if (this._busy) return;

    const count = this._addPointsCount;
    let xMin = -1;
    let xMax = 1;
    let yMin = -1;
    let yMax = 1;

    if (this.classification) {
      const points = this.classification.points;
      if (points && points.length > 0) {
        for (const element of points) {
          const p = element;
          if (p.x < xMin) xMin = p.x;
          if (p.x > xMax) xMax = p.x;
          if (p.y < yMin) yMin = p.y;
          if (p.y > yMax) yMax = p.y;
        }
      }

      if (this.classification.boundary) {
        const yBoundaryMin = this.classification.boundary.slope * xMin + this.classification.boundary.intercept;
        const yBoundaryMax = this.classification.boundary.slope * xMax + this.classification.boundary.intercept;
        yMin = Math.min(yMin, yBoundaryMin, yBoundaryMax);
        yMax = Math.max(yMax, yBoundaryMin, yBoundaryMax);
      }
    }

    this.withAction(async () => {
      const c = await apiClient.addPoints(count, xMin, xMax, yMin, yMax);
      this.classification = c;
      this.notifyClassification(c);
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
        <div style="display: flex; justify-content: flex-end; margin-top: 1.25rem;">
          <cds-button type="button"
                      appearance="primary"
                      ?disabled=${this._busy}
                      @click=${this.onAddPoints}>
            Ajouter
          </cds-button>
        </div>
      </cds-accordion-item>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'classification-add-points-item': ClassificationAddPointsItem;
  }
}
