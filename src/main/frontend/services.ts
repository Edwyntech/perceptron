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

  async addPoints(count: number, xMin?: number, xMax?: number, yMin?: number, yMax?: number): Promise<Classification> {
    const params = new URLSearchParams({count: String(count)});
    if (xMin !== undefined) params.append('xMin', String(xMin));
    if (xMax !== undefined) params.append('xMax', String(xMax));
    if (yMin !== undefined) params.append('yMin', String(yMin));
    if (yMax !== undefined) params.append('yMax', String(yMax));
    const response = await fetch('/classification/points', {method: 'POST', body: params}).then(checkOk);
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

  trainStream(
    epochs: number,
    delayMs: number,
    onUpdate: (update: { prediction: Line; weights: number[]; converged: boolean }) => void,
    onComplete: () => void,
    onError: (error: any) => void
  ): () => void {
    const eventSource = new EventSource(`/classification/train-stream?epochs=${epochs}&delayMs=${delayMs}`);

    eventSource.addEventListener('update', (event: MessageEvent) => {
      try {
        const update = JSON.parse(event.data) as { prediction: Line; weights: number[]; converged: boolean };
        onUpdate(update);
      } catch (err) {
        onError(err);
      }
    });

    eventSource.addEventListener('complete', () => {
      eventSource.close();
      onComplete();
    });

    eventSource.addEventListener('error', (event) => {
      eventSource.close();
      onError(event);
    });

    return () => {
      eventSource.close();
    };
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
