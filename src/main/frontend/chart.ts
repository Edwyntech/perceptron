import {ChartTabularData, ComboChartOptions, ScaleTypes} from '@carbon/charts';
import {Classification} from './domain.ts';

const GROUP_CLASSIFICATION = 'Limite';
const GROUP_PREDICTION = 'Prédiction';
const GROUP_ABOVE = 'Au-dessus';
const GROUP_BELOW = 'En-dessous';

const AREA_MIN = 0;
const AREA_MAX = 1000;

// Returns the x value where y = slope * x + intercept equals the given y boundary
const xAtY = (y: number, slope: number, intercept: number) => (y - intercept) / slope;

// Clips the line defined by slope/intercept to the (0,0)-(1000,1000) area,
// returning two endpoint data points, or an empty array if the line is outside the area.
const lineDataPoints = (group: string, slope: number, intercept: number) => {
  // Candidate x values: area left/right edges and x values at area top/bottom edges
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

  const first = points[0];
  const last = points[points.length - 1];
  return [first, last];
};

const GROUP_COLORS: Record<string, string> = {
  [GROUP_CLASSIFICATION]: '#F08200',
  [GROUP_PREDICTION]: '#AAAAAA',
  [GROUP_ABOVE]: '#00FF00',
  [GROUP_BELOW]: '#FF0000',
};

export const options: ComboChartOptions = {
  title: 'Classification',
  animations: false,
  axes: {
    left: {
      title: 'Y',
      mapsTo: 'y',
      scaleType: ScaleTypes.LINEAR,
    },
    bottom: {
      title: 'X',
      mapsTo: 'x',
      scaleType: ScaleTypes.LINEAR,
    },
  },
  getFillColor: (group: string, defaultFillColor: string | undefined): string => GROUP_COLORS[group] ?? defaultFillColor ?? '#000000',
  getStrokeColor: (group: string, defaultStrokeColor: string | undefined): string => GROUP_COLORS[group] ?? defaultStrokeColor ?? '#000000',
  comboChartTypes: [
    {
      type: 'line',
      options: {
        points: {
          enabled: false,
        },
      },
      correspondingDatasets: [GROUP_CLASSIFICATION, GROUP_PREDICTION],
    },
    {
      type: 'scatter',
      options: {
        points: {
          radius: 10,
        },
      },
      correspondingDatasets: [GROUP_ABOVE, GROUP_BELOW],
    },
  ],
  legend: {
    alignment: 'center',
  },
  height: '100%',
  width: '100%',
  resizable: true,
};

export const chartDataFrom = (classification: Classification): ChartTabularData => {
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
