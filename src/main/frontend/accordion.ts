import ExpandAll from '@carbon/icons/es/expand-all/16';
import CollapseAll from '@carbon/icons/es/collapse-all/16';

(document.getElementById('expand-all-icon') as any).icon = ExpandAll;
(document.getElementById('collapse-all-icon') as any).icon = CollapseAll;

document.getElementById('expand-all-btn')!.addEventListener('click', () => {
  document.querySelectorAll<HTMLElement>('cds-accordion-item').forEach(item => item.setAttribute('open', ''));
});

document.getElementById('collapse-all-btn')!.addEventListener('click', () => {
  document.querySelectorAll<HTMLElement>('cds-accordion-item').forEach(item => item.removeAttribute('open'));
});
