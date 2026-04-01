import '@carbon/web-components/es';

import './classification-header.ts';
import './classification-chart.ts';
import './classification-toolbar.ts';
import {ClassificationChart} from './classification-chart.ts';
import {ClassificationToolbar} from './classification-toolbar.ts';

document.addEventListener('DOMContentLoaded', () => {
  const toolbar = document.querySelector('classification-toolbar') as ClassificationToolbar;
  toolbar.chartHolder = document.querySelector('classification-chart') as ClassificationChart;
  toolbar.notification = document.getElementById('error-notification') as HTMLElement;
});
