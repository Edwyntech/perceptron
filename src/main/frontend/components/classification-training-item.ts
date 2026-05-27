import {html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {apiClient} from '../services.ts';
import {ClassificationItemBase} from './classification-item-base.ts';
import {Classification, Label} from '../domain.ts';

@customElement('classification-training-item')
export class ClassificationTrainingItem extends ClassificationItemBase {

  @property({type: Boolean})
  open = false;

  @property({attribute: false})
  classification: Classification | null = null;

  @state()
  private _testedCount = 0;

  @state()
  private _epochCount = 1000;

  @state()
  private _learningRate = 0.01;

  @state()
  private _targetTrainingCount = 0;

  @state()
  private _converged = false;

  protected override async firstUpdated(): Promise<void> {
    await apiClient.getClassification()
      .then(c => this.notifyClassification(c))
      .catch(console.error);
  }

  private onLearningRateChange(value: string): void {
    const lr = parseFloat(value);
    if (!isNaN(lr)) {
      this._learningRate = lr;
      apiClient.setLearningRate(lr).catch(console.error);
    }
  }

  private _cancelStream: (() => void) | null = null;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.cancelTraining();
  }

  private cancelTraining(): void {
    if (this._cancelStream) {
      this._cancelStream();
      this._cancelStream = null;
    }
  }

  private onTrain(): void {
    if (this._busy) return;

    const pointsCount = this.classification?.points?.length ?? 0;
    const epochCount = pointsCount > 0 ? pointsCount : this._epochCount;
    this._targetTrainingCount = epochCount;
    this._testedCount = 0;
    this._converged = false;
    this.cancelTraining();

    void this.withAction(() => {
      return new Promise<void>((resolve, reject) => {
        let localTestedCount = 0;
        let lastUpdateTime = 0;
        this._cancelStream = apiClient.trainStream(
          epochCount,
          2, // 2ms delay between steps
          (update) => {
            localTestedCount++;
            if (update.converged) {
              this._converged = true;
            }
            const current = this.classification;
            if (current) {
              const now = Date.now();
              const currentPointsCount = current.points.length;
              const throttleDelay = Math.max(50, Math.min(800, currentPointsCount / 10));
              // Throttle UI updates to dynamic delay for smooth rendering
              if (now - lastUpdateTime > throttleDelay || update.converged) {
                lastUpdateTime = now;
                this._testedCount = localTestedCount;
                const [w1 = 0, w2 = 0, bias = 0] = update.weights || [];
                const points = current.points.map(p => {
                  const activation = w1 * p.x + w2 * p.y + bias;
                  const label: Label = activation > 0 ? 'ABOVE' : 'BELOW';
                  return { ...p, label };
                });
                const updated: Classification = {
                  ...current,
                  prediction: update.prediction,
                  weights: update.weights,
                  points
                };
                this.classification = updated;
                this.notifyClassification(updated);
              }
            }
          },
          () => {
            this._testedCount = localTestedCount;
            // On completion, fetch the final classification to sync point colors
            apiClient.getClassification()
              .then(c => {
                this.classification = c;
                this.notifyClassification(c);
                this._cancelStream = null;
                resolve();
              })
              .catch(reject);
          },
          (err) => {
            this._cancelStream = null;
            reject(err instanceof Error ? err : new Error('Erreur de flux d\'apprentissage.'));
          }
        );
      });
    });
  }

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('classification')) {
      if (!this._busy) {
        this._testedCount = 0;
        this._converged = false;
      }
    }
  }

  override render() {
    return html`
      <cds-accordion-item title="Entrainement"
                          id="classification-training-item"
                          ?open=${this.open}>
        <cds-number-input name="learning-rate"
                          label="taux d'apprentissage"
                          min="0.001" max="1" step="0.001"
                          .value=${String(this._learningRate)}
                          @cds-number-input=${(e: CustomEvent<{ value: string }>) => this.onLearningRateChange(e.detail.value)}>
        </cds-number-input>
        <div style="display: flex; align-items: center; gap: 1.5rem; margin-top: 1.25rem;">
          ${this._busy || this._testedCount > 0 ? html`
            <div style="flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 200px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--cds-text-secondary, #525252); font-weight: 500;">
                <span>
                  ${this._busy 
                    ? 'Apprentissage...' 
                    : (this._converged ? 'Convergence atteinte !' : 'Apprentissage terminé')}
                </span>
                <span style="font-family: monospace;">${this._testedCount} / ${this._targetTrainingCount}</span>
              </div>
              <div style="width: 100%; height: 8px; background-color: var(--cds-border-subtle, #e0e0e0); border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${Math.min(100, (this._testedCount / this._targetTrainingCount) * 100)}%; background: ${this._converged ? 'var(--cds-support-success, #24a148)' : 'var(--cds-link-primary, #0f62fe)'}; transition: width 0.1s ease-out; border-radius: 4px;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--cds-text-helper, #6f6f6f);">
                <span>Points restants : ${Math.max(0, this._targetTrainingCount - this._testedCount)}</span>
                ${this._converged ? html`<span style="color: var(--cds-support-success, #24a148); font-weight: 600;">✓ Stable</span>` : ''}
              </div>
            </div>
          ` : ''}
          
          <cds-button type="button"
                      appearance="primary"
                      style="margin-left: auto;"
                      ?disabled=${this._busy}
                      @click=${this.onTrain}>
            Entrainer
          </cds-button>
        </div>
      </cds-accordion-item>
    `;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'classification-training-item': ClassificationTrainingItem;
  }
}
