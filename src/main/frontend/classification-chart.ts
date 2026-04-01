import {LitElement, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {ChartTabularData, ComboChart, ComboChartOptions, ScaleTypes} from '@carbon/charts';
import {Classification} from './domain.ts';

const GROUP_CLASSIFICATION = 'Limite';
const GROUP_PREDICTION = 'Prédiction';
const GROUP_ABOVE = 'Au-dessus';
const GROUP_BELOW = 'En-dessous';
const AREA_MIN = 0;
const AREA_MAX = 1000;

const xAtY = (y: number, slope: number, intercept: number) => (y - intercept) / slope;

const lineDataPoints = (group: string, slope: number, intercept: number) => {
  const candidates: number[] = [AREA_MIN, AREA_MAX];
  if (slope !== 0) {
    candidates.push(xAtY(AREA_MIN, slope, intercept));
    candidates.push(xAtY(AREA_MAX, slope, intercept));
  }
  const points = candidates
    .filter(x => x >= AREA_MIN && x <= AREA_MAX)
    .map(x => ({group, x, y: slope * x + intercept}))
    .filter(p => p.y >= AREA_MIN && p.y <= AREA_MAX);
  if (points.length < 2) return [];
  return [points[0], points[points.length - 1]];
};

const GROUP_COLORS: Record<string, string> = {
  [GROUP_CLASSIFICATION]: '#F08200',
  [GROUP_PREDICTION]: '#AAAAAA',
  [GROUP_ABOVE]: '#00FF00',
  [GROUP_BELOW]: '#FF0000',
};

const options: ComboChartOptions = {
  title: 'Classification',
  animations: false,
  axes: {
    left: {title: 'Y', mapsTo: 'y', scaleType: ScaleTypes.LINEAR},
    bottom: {title: 'X', mapsTo: 'x', scaleType: ScaleTypes.LINEAR},
  },
  getFillColor: (group: string, defaultFillColor: string | undefined): string => GROUP_COLORS[group] ?? defaultFillColor ?? '#000000',
  getStrokeColor: (group: string, defaultStrokeColor: string | undefined): string => GROUP_COLORS[group] ?? defaultStrokeColor ?? '#000000',
  comboChartTypes: [
    {
      type: 'line',
      options: {points: {enabled: false}},
      correspondingDatasets: [GROUP_CLASSIFICATION, GROUP_PREDICTION],
    },
    {
      type: 'scatter',
      options: {points: {radius: 10}},
      correspondingDatasets: [GROUP_ABOVE, GROUP_BELOW],
    },
  ],
  legend: {alignment: 'center'},
  height: '100%',
  width: '100%',
  resizable: true,
};

const chartDataFrom = (classification: Classification): ChartTabularData => {
  const classificationData = classification.boundary
    ? lineDataPoints(GROUP_CLASSIFICATION, classification.boundary.slope, classification.boundary.intercept)
    : [];
  const predictionData = classification.prediction
    ? lineDataPoints(GROUP_PREDICTION, classification.prediction.slope, classification.prediction.intercept)
    : [];
  const pointsData = classification.points.map(({x, y, label}) => ({
    group: label === 'ABOVE' ? GROUP_ABOVE : GROUP_BELOW,
    x,
    y,
  }));
  return [...classificationData, ...predictionData, ...pointsData];
};

@customElement('classification-chart')
export class ClassificationChart extends LitElement {
  // Disable Shadow DOM so Carbon Charts styles (injected into document) apply correctly
  override createRenderRoot() {
    return this;
  }

  @property({attribute: false})
  classification: Classification | null = null;

  private comboChart: ComboChart | null = null;

  @query('#chart-container')
  private chartContainer!: HTMLDivElement;

  protected firstUpdated(): void {
    this.comboChart = new ComboChart(this.chartContainer, {data: [], options});
    if (this.classification) {
      this.comboChart.model.setData(chartDataFrom(this.classification));
    }
  }

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('classification') && this.classification && this.comboChart) {
      this.comboChart.model.setData(chartDataFrom(this.classification));
    }
  }

  override render() {
    return html`<div id="chart-container"></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'classification-chart': ClassificationChart;
  }
}
