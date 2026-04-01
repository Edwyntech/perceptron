import '@carbon/web-components/es';

import './accordion.ts';
import {apiClient, updateClassification} from './classifier.ts';

await apiClient.getClassification().then(updateClassification);
