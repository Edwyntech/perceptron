import {html, LitElement, svg} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {apiClient} from '../services.ts';
import {Classification, Line} from '../domain.ts';

@customElement('classification-perceptron')
export class ClassificationPerceptron extends LitElement {

  // Disable Shadow DOM so Carbon Web Components styles (injected into document) apply correctly
  override createRenderRoot() {
    return this;
  }

  @property({attribute: false})
  set classification(value: Classification | null) {
    const old = this._classification;
    this._classification = value;
    this.requestUpdate('classification', old);
    if (value) this._refreshWeights();
  }
  get classification(): Classification | null {
    return this._classification;
  }
  private _classification: Classification | null = null;

  @state()
  private _weights: number[] = [];

  @state()
  private _prediction: Line | null = null;

  private async _refreshWeights(): Promise<void> {
    await apiClient.getWeights().then(w => this._weights = w).catch(console.error);
    await apiClient.getPrediction().then(p => this._prediction = p).catch(console.error);
  }

  private formatWeight(w: number): string {
    return w.toFixed(3);
  }

  override render() {
    const [w1 = 0, w2 = 0, bias = 0] = this._weights;

    // Layout constants
    const vw = 600;
    const vh = 310;

    const inputX = 55;
    const x1Y = 80;
    const x2Y = 175;
    const nodeR = 24;

    const sumX = 240;
    const sumY = 128;
    const sumR = 28;

    const stepX = 380;
    const stepY = 128;
    const stepR = 28;

    const biasX = 240;
    const biasY = 230;
    const biasR = 22;

    const outputEndX = 560;

    // Arrow marker colours
    const arrowBlue = '#4a6fa5';
    const arrowRed = '#8b2020';
    const arrowOrange = '#c07020';

    return html`
      <div style="margin-top: 1rem;">
        ${svg`
          <svg width="100%" viewBox="0 0 ${vw} ${vh}"
               xmlns="http://www.w3.org/2000/svg"
               style="font-family: 'Georgia', serif; overflow: visible;">

            <defs>
              <!-- blue arrowhead -->
              <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="${arrowBlue}"/>
              </marker>
              <!-- red arrowhead -->
              <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="${arrowRed}"/>
              </marker>
              <!-- orange arrowhead -->
              <marker id="arrow-orange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="${arrowOrange}"/>
              </marker>
            </defs>

            <!-- ── Connections: inputs → Σ (blue) ── -->
            <line x1="${inputX + nodeR}" y1="${x1Y}"
                  x2="${sumX - sumR}" y2="${sumY}"
                  stroke="${arrowBlue}" stroke-width="2"
                  marker-end="url(#arrow-blue)"/>
            <line x1="${inputX + nodeR}" y1="${x2Y}"
                  x2="${sumX - sumR}" y2="${sumY}"
                  stroke="${arrowBlue}" stroke-width="2"
                  marker-end="url(#arrow-blue)"/>

            <!-- weight labels on input connections: above w1 line, below w2 line -->
            <text x="${(inputX + nodeR + sumX - sumR) / 2 + 10}"
                  y="${(x1Y + sumY) / 2 - 34}"
                  text-anchor="middle" font-size="15" font-weight="bold" fill="#1a3a6e" font-style="italic">
              w&#x2081; = ${this.formatWeight(w1)}
            </text>
            <text x="${(inputX + nodeR + sumX - sumR) / 2 + 10}"
                  y="${(x2Y + sumY) / 2 + 42}"
                  text-anchor="middle" font-size="15" font-weight="bold" fill="#1a3a6e" font-style="italic">
              w&#x2082; = ${this.formatWeight(w2)}
            </text>

            <!-- ── Connection: bias → Σ (blue, vertical) ── -->
            <line x1="${biasX}" y1="${biasY - biasR}"
                  x2="${sumX}" y2="${sumY + sumR}"
                  stroke="${arrowBlue}" stroke-width="2"
                  marker-end="url(#arrow-blue)"/>

            <!-- ── Connection: Σ → step (red) ── -->
            <line x1="${sumX + sumR}" y1="${sumY}"
                  x2="${stepX - stepR}" y2="${sumY}"
                  stroke="${arrowRed}" stroke-width="2"
                  marker-end="url(#arrow-red)"/>

            <!-- ── Connection: step → output (orange arrow) ── -->
            <line x1="${stepX + stepR}" y1="${stepY}"
                  x2="${outputEndX}" y2="${stepY}"
                  stroke="${arrowOrange}" stroke-width="2"
                  marker-end="url(#arrow-orange)"/>
            <!-- output label ŷ -->
            <text x="${outputEndX + 8}" y="${stepY + 5}"
                  font-size="16" font-weight="bold" fill="${arrowOrange}" font-style="italic">&#x1D4CE;</text>

            <!-- ── Input nodes (blue-purple) ── -->
            <circle cx="${inputX}" cy="${x1Y}" r="${nodeR}"
                    fill="#b0bde8" stroke="#7080c0" stroke-width="1.5"/>
            <text x="${inputX}" y="${x1Y + 5}" text-anchor="middle"
                  font-size="15" fill="#222" font-style="italic">x&#x2081;</text>

            <circle cx="${inputX}" cy="${x2Y}" r="${nodeR}"
                    fill="#b0bde8" stroke="#7080c0" stroke-width="1.5"/>
            <text x="${inputX}" y="${x2Y + 5}" text-anchor="middle"
                  font-size="15" fill="#222" font-style="italic">x&#x2082;</text>

            <!-- ── Bias node (green) ── -->
            <circle cx="${biasX}" cy="${biasY}" r="${biasR}"
                    fill="#b8d8b0" stroke="#70a870" stroke-width="1.5"/>
            <text x="${biasX}" y="${biasY + 5}" text-anchor="middle"
                  font-size="15" fill="#222" font-style="italic">b</text>

            <!-- ── Σ neuron (orange/tan) ── -->
            <circle cx="${sumX}" cy="${sumY}" r="${sumR}"
                    fill="#e8c87a" stroke="#c0a040" stroke-width="1.5"/>
            <text x="${sumX}" y="${sumY + 8}" text-anchor="middle"
                  font-size="22" fill="#222">&#x3A3;</text>

            <!-- ── Step function node (light yellow) ── -->
            <circle cx="${stepX}" cy="${stepY}" r="${stepR}"
                    fill="#f0f0c0" stroke="#b0b060" stroke-width="1.5"/>
            <!-- step function graph inside the circle: axes + step shape -->
            <!-- x-axis -->
            <line x1="${stepX - 18}" y1="${stepY + 10}" x2="${stepX + 18}" y2="${stepY + 10}"
                  stroke="#888" stroke-width="1"/>
            <!-- y-axis (centered) -->
            <line x1="${stepX}" y1="${stepY + 14}" x2="${stepX}" y2="${stepY - 16}"
                  stroke="#888" stroke-width="1"/>
            <!-- step function: 0 for x<0, 1 for x>=0 -->
            <polyline points="${stepX - 18},${stepY + 10} ${stepX},${stepY + 10} ${stepX},${stepY - 12} ${stepX + 18},${stepY - 12}"
                      fill="none" stroke="#c03030" stroke-width="2"/>
            <text x="${stepX}" y="${stepY + 42}" text-anchor="middle"
                  font-size="10" fill="#555">Step Function</text>

            <!-- bias weight label: east of bias node -->
            <text x="${biasX + biasR + 8}" y="${biasY + 5}"
                  font-size="15" font-weight="bold" fill="#1a3a6e" font-style="italic">
              b = ${this.formatWeight(bias)}
            </text>

            <!-- ── Predicted boundary line equation ── -->
            <text x="${vw / 2}" y="${vh - 10}"
                  text-anchor="middle" font-size="30" font-weight="bold" fill="#333" font-style="italic">
              Boundary: y = ${this._prediction ? this.formatWeight(this._prediction.slope) : '?'} x + ${this._prediction ? this.formatWeight(this._prediction.intercept) : '?'}
            </text>
          </svg>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'classification-perceptron': ClassificationPerceptron;
  }
}
