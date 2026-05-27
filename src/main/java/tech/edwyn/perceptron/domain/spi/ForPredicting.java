package tech.edwyn.perceptron.domain.spi;

import tech.edwyn.perceptron.domain.Label;
import tech.edwyn.perceptron.domain.Line;
import tech.edwyn.perceptron.domain.Point;

import java.util.Collection;

public interface ForPredicting {
  void train(Line boundary);

  void train(Point point, Line boundary);

  void train(Collection<Point> points, Line boundary);

  Line getPrediction();

  Label predict(double x, double y);

  void reset();

  double[] getWeights();
}

