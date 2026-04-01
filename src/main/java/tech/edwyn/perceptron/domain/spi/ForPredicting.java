package tech.edwyn.perceptron.domain.spi;

import tech.edwyn.perceptron.domain.Label;
import tech.edwyn.perceptron.domain.Line;

public interface ForPredicting {
  void train(Line boundary);

  Line getPrediction();

  Label predict(double x, double y);

  void reset();
}
