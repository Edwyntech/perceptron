import {Classification, Line} from './domain.ts';

const checkOk = async (response: Response): Promise<Response> => {
  if (!response.ok) throw new Error(`Server error: ${response.status} ${response.statusText}`);
  return response;
};

export class ApiClient {
  async getClassification(): Promise<Classification> {
    const response = await fetch('/classification').then(checkOk);
    return response.json();
  }

  async reset(): Promise<Classification> {
    const response = await fetch('/classification/reset', {method: 'POST'}).then(checkOk);
    return response.json();
  }

  async setClassifier(line: Line): Promise<Classification> {
    const params = new URLSearchParams({
      slope: String(line.slope),
      intercept: String(line.intercept),
    });
    const response = await fetch('/classification/boundary', {method: 'POST', body: params}).then(checkOk);
    return response.json();
  }

  async addPoint(): Promise<Classification> {
    const response = await fetch('/classification/points', {method: 'POST'}).then(checkOk);
    return response.json();
  }

  async setLearningRate(learningRate: number): Promise<void> {
    const params = new URLSearchParams({learningRate: String(learningRate)});
    await fetch(`/perceptron/learning-rate?${params}`, {method: 'PUT'}).then(checkOk);
  }

  async train(): Promise<Classification> {
    const response = await fetch('/classification/train', {method: 'POST'}).then(checkOk);
    return response.json();
  }

  async getWeights(): Promise<Array<number>> {
    const response = await fetch('/perceptron/weights', {method: 'GET'}).then(checkOk);
    return response.json();
  }

  async getPrediction(): Promise<Line> {
    const response = await fetch('/classification/prediction', {method: 'GET'}).then(checkOk);
    return response.json();
  }

}

export const apiClient = new ApiClient();
