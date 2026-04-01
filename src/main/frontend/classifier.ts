import {ComboChart} from '@carbon/charts';
import {chartDataFrom, options} from './chart.ts';
import {ApiClient} from './api-client.ts';
import {Classification} from './domain.ts';

const chartHolder = document.getElementById('chart-container') as HTMLDivElement;
const boundarySettings = document.querySelector<HTMLElement>('#classification-line-item')!;
const resetButton = document.querySelector<HTMLElement>('#classification-reset-item cds-button')!;
const addPointsButton = document.querySelector<HTMLElement>('#classification-add-points-item cds-button')!;
const trainButton = document.querySelector<HTMLElement>('#classification-training-item cds-button')!;
const notification = document.getElementById('error-notification') as HTMLElement;

const comboChart = new ComboChart(chartHolder, {data: [], options});
export const apiClient = new ApiClient();

notification.addEventListener('cds-notification-closed', () => {
  notification.style.display = 'none';
});

const boundaryEquation = (slope: number, intercept: number): string => {
  if (slope === 0) return `y = ${intercept}`;
  const slopePart = slope === 1 ? 'x' : slope === -1 ? '-x' : `${slope} x`;
  if (intercept === 0) return `y = ${slopePart}`;
  const interceptPart = intercept > 0 ? `+ ${intercept}` : `- ${Math.abs(intercept)}`;
  return `y = ${slopePart} ${interceptPart}`;
};

export const updateClassification = (classification: Classification): void => {
  comboChart.model.setData(chartDataFrom(classification));
  boundarySettings.querySelector<HTMLInputElement>(`[name='slope']`)!.value = String(classification.boundary.slope);
  boundarySettings.querySelector<HTMLInputElement>(`[name='intercept']`)!.value = String(classification.boundary.intercept);
  boundarySettings.setAttribute('title', `Equation de la droite: ${boundaryEquation(classification.boundary.slope, classification.boundary.intercept)}`);
};

const showError = (message: string): void => {
  notification.setAttribute('subtitle', message);
  notification.style.display = '';
  notification.setAttribute('open', '');
};

const hideError = (): void => {
  notification.removeAttribute('open');
  notification.style.display = 'none';
};

const withButtons = async (buttons: HTMLElement[], action: () => Promise<void>): Promise<void> => {
  buttons.forEach(b => b.setAttribute('disabled', ''));
  hideError();
  try {
    await action();
  } catch (e) {
    showError(e instanceof Error ? e.message : 'An unexpected error occurred.');
  } finally {
    buttons.forEach(b => b.removeAttribute('disabled'));
  }
};

const updateClassifier = (): void => {
  const slope = parseFloat(boundarySettings.querySelector<HTMLInputElement>(`[name='slope']`)!.value);
  const intercept = parseFloat(boundarySettings.querySelector<HTMLInputElement>(`[name='intercept']`)!.value);
  withButtons([], () => apiClient.setClassifier({slope, intercept}).then(updateClassification));
};

boundarySettings.querySelector<HTMLInputElement>(`[name='slope']`)!.addEventListener('cds-number-input', updateClassifier);
boundarySettings.querySelector<HTMLInputElement>(`[name='intercept']`)!.addEventListener('cds-number-input', updateClassifier);

resetButton.addEventListener('click', () => {
  withButtons([resetButton, addPointsButton, trainButton], () => apiClient.reset().then(updateClassification));
});

addPointsButton.addEventListener('click', () => {
  const count = parseInt((document.querySelector<HTMLElement>('#classification-add-points-item cds-number-input') as HTMLInputElement).value);
  withButtons([resetButton, addPointsButton, trainButton], async () => {
    let promise = Promise.resolve();
    for (let i = 0; i < count; i++) {
      promise = promise.then(() => apiClient.addPoint().then(updateClassification));
    }
    await promise;
  });
});

trainButton.addEventListener('click', () => {
  const epochCount = parseInt((document.querySelector<HTMLElement>('#classification-training-item cds-number-input') as HTMLInputElement).value);
  withButtons([resetButton, addPointsButton, trainButton], async () => {
    let promise = Promise.resolve();
    for (let i = 0; i < epochCount; i++) {
      promise = promise.then(() => apiClient.train().then(updateClassification));
    }
    await promise;
  });
});
