export type Label = 'ABOVE' | 'BELOW';

export type Point = {
  x: number;
  y: number;
  label: Label;
};

export type Line = {
  slope: number;
  intercept: number;
};

export type Classification = {
  boundary: Line;
  prediction: Line | null;
  points: Point[];
};

export class ClassificationUpdatedEvent extends CustomEvent<Classification> {
  static readonly NAME = 'classification-updated';

  constructor(classification: Classification) {
    super(ClassificationUpdatedEvent.NAME, {
      detail: classification,
      bubbles: true,
      composed: true,
    });
  }
}

declare global {
  interface HTMLElementEventMap {
    'classification-updated': ClassificationUpdatedEvent;
  }
}
