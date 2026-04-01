import {Classification, Line} from './domain.ts';

export class ApiClient {
  async getClassification(): Promise<Classification> {
    const response = await fetch('/classification');
    return response.json();
  }

  async reset(): Promise<Classification> {
    const response = await fetch('/classification/reset', {method: 'POST'});
    return response.json();
  }

  async setClassifier(line: Line): Promise<Classification> {
    const params = new URLSearchParams({
      slope: String(line.slope),
      intercept: String(line.intercept),
    });
    const response = await fetch('/classification/boundary', {method: 'POST', body: params});
    return response.json();
  }

  async addPoint(): Promise<Classification> {
    const response = await fetch('/classification/points', {method: 'POST'});
    return response.json();
  }

  async train(): Promise<Classification> {
    const response = await fetch('/classification/train', {method: 'POST'});
    return response.json();
  }

}
