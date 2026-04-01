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
