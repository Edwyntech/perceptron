import '@carbon/web-components/es';
import './components/classification-header.ts';
import {ClassificationHeader} from './components/classification-header.ts';
import './components/classification-chart.ts';
import './components/classification-toolbar.ts';
import './components/classification-static.ts';
import {ClassificationChart} from './components/classification-chart.ts';
import {ClassificationToolbar} from './components/classification-toolbar.ts';
import {ClassificationUpdatedEvent} from './domain.ts';

document.addEventListener('DOMContentLoaded', () => {
  const toolbar = document.querySelector('classification-toolbar') as ClassificationToolbar;
  const chart = document.querySelector('#entrainement-view classification-chart') as ClassificationChart;

  toolbar.addEventListener(ClassificationUpdatedEvent.NAME, (e: Event) => {
    chart.classification = (e as ClassificationUpdatedEvent).detail;
    toolbar.classification = (e as ClassificationUpdatedEvent).detail;
  });

  const header = document.querySelector('classification-header') as ClassificationHeader;
  const entrainementView = document.getElementById('entrainement-view');
  const statiqueView = document.getElementById('statique-view');

  if (header && entrainementView && statiqueView) {
    header.addEventListener('tab-changed', (e: Event) => {
      const tab = (e as CustomEvent<{ tab: string }>).detail.tab;
      if (tab === 'entrainement') {
        entrainementView.classList.add('active');
        statiqueView.classList.remove('active');
      } else {
        entrainementView.classList.remove('active');
        statiqueView.classList.add('active');
      }
    });
  }



  const notification = document.getElementById('error-notification');
  if (notification) {
    notification.addEventListener('cds-notification-closed', () => {
      notification.style.display = 'none';
    });
  }
});
