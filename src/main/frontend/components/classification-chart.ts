import {LitElement, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {ChartTabularData, ComboChart, ComboChartOptions, ScaleTypes} from '@carbon/charts';
import {Classification, Line, Point} from '../domain.ts';

const GROUP_CLASSIFICATION = 'Limite';
const GROUP_PREDICTION = 'Prédiction';
const GROUP_ABOVE = 'Au-dessus';
const GROUP_BELOW = 'En-dessous';


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
      options: {points: {radius: 4}},
      correspondingDatasets: [GROUP_ABOVE, GROUP_BELOW],
    },
  ],
  legend: {alignment: 'center'},
  height: '100%',
  width: '100%',
  resizable: true,
};

function addIntersection(
  points: { x: number; y: number }[],
  x: number,
  y: number,
  x1: number,
  x2: number,
  y1: number,
  y2: number
): void {
  const epsilon = 1e-9;
  if (x >= x1 - epsilon && x <= x2 + epsilon && y >= y1 - epsilon && y <= y2 + epsilon) {
    points.push({ x, y });
  }
}

function getUniquePoints(points: { x: number; y: number }[]): { x: number; y: number }[] {
  const unique: { x: number; y: number }[] = [];
  const epsilon = 1e-7;
  for (const p of points) {
    if (!unique.some(up => Math.abs(up.x - p.x) < epsilon && Math.abs(up.y - p.y) < epsilon)) {
      unique.push(p);
    }
  }
  return unique;
}

function clipLineToRectangle(
  slope: number,
  intercept: number,
  x1: number,
  x2: number,
  y1: number,
  y2: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];

  addIntersection(points, x1, slope * x1 + intercept, x1, x2, y1, y2);
  addIntersection(points, x2, slope * x2 + intercept, x1, x2, y1, y2);

  if (slope !== 0) {
    addIntersection(points, (y1 - intercept) / slope, y1, x1, x2, y1, y2);
    addIntersection(points, (y2 - intercept) / slope, y2, x1, x2, y1, y2);
  }

  const uniquePoints = getUniquePoints(points);

  if (uniquePoints.length >= 2) {
    uniquePoints.sort((a, b) => a.x - b.x);
    return uniquePoints.slice(0, 2);
  }
  return [];
}

interface BoundingBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

function calculateBoundingBox(points: Point[], boundary: Line | null): BoundingBox {
  let xMin = -1;
  let xMax = 1;
  let yMin = -1;
  let yMax = 1;

  if (points.length > 0) {
    const firstPoint = points[0];
    xMin = Math.min(xMin, firstPoint.x);
    xMax = Math.max(xMax, firstPoint.x);
    yMin = Math.min(yMin, firstPoint.y);
    yMax = Math.max(yMax, firstPoint.y);
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      xMin = Math.min(xMin, p.x);
      xMax = Math.max(xMax, p.x);
      yMin = Math.min(yMin, p.y);
      yMax = Math.max(yMax, p.y);
    }
  }

  if (boundary) {
    const yBoundMin = boundary.slope * xMin + boundary.intercept;
    const yBoundMax = boundary.slope * xMax + boundary.intercept;
    yMin = Math.min(yMin, yBoundMin, yBoundMax);
    yMax = Math.max(yMax, yBoundMin, yBoundMax);
  }

  return { xMin, xMax, yMin, yMax };
}

const chartDataFrom = (classification: Classification): ChartTabularData => {
  const points = classification.points;
  const { xMin, xMax, yMin, yMax } = calculateBoundingBox(points, classification.boundary);

  const pointsData = points.map(p => ({
    group: p.label === 'ABOVE' ? GROUP_ABOVE : GROUP_BELOW,
    x: p.x,
    y: p.y,
  }));

  const getLineData = (group: string, slope: number, intercept: number) => {
    return [
      {group, x: xMin, y: slope * xMin + intercept},
      {group, x: xMax, y: slope * xMax + intercept},
    ];
  };

  const getClippedPredictionData = (slope: number, intercept: number) => {
    if (!Number.isFinite(slope) || !Number.isFinite(intercept)) {
      return [];
    }
    const clipped = clipLineToRectangle(slope, intercept, xMin, xMax, yMin, yMax);
    return clipped.map(p => ({
      group: GROUP_PREDICTION,
      x: p.x,
      y: p.y
    }));
  };

  const classificationData = classification.boundary
    ? getLineData(GROUP_CLASSIFICATION, classification.boundary.slope, classification.boundary.intercept)
    : [];
  const predictionData = classification.prediction
    ? getClippedPredictionData(classification.prediction.slope, classification.prediction.intercept)
    : [];

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
  private readonly chartContainer!: HTMLDivElement;

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
