import '@carbon/web-components/es';
import './components/classification-header.ts';
import './components/classification-chart.ts';
import './components/classification-toolbar.ts';
import {ClassificationChart} from './components/classification-chart.ts';
import {ClassificationToolbar} from './components/classification-toolbar.ts';
import {ClassificationUpdatedEvent} from './domain.ts';

document.addEventListener('DOMContentLoaded', () => {
  const toolbar = document.querySelector('classification-toolbar') as ClassificationToolbar;
  const chart = document.querySelector('classification-chart') as ClassificationChart;

  toolbar.addEventListener(ClassificationUpdatedEvent.NAME, (e: Event) => {
    chart.classification = (e as ClassificationUpdatedEvent).detail;
    toolbar.classification = (e as ClassificationUpdatedEvent).detail;
  });

  const notification = document.getElementById('error-notification');
  if (notification) {
    notification.addEventListener('cds-notification-closed', () => {
      notification.style.display = 'none';
    });
  }
});
