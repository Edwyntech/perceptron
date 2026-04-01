package tech.edwyn.perceptron.infra.spi;

import tech.edwyn.perceptron.domain.Label;
import tech.edwyn.perceptron.domain.Line;
import tech.edwyn.perceptron.domain.spi.ForPredicting;

public class GeometryPrediction implements ForPredicting {
  private Line boundary;

  public GeometryPrediction() {
    reset();
  }

  @Override
  public void train(Line boundary) {
    this.boundary = boundary;
  }

  @Override
  public Line getPrediction() {
    return boundary;
  }

  @Override
  public Label predict(int x, int y) {
    return (y >= x * boundary.slope() + boundary.intercept())
      ? Label.ABOVE
      : Label.BELOW;
  }

  @Override
  public void reset() {
    boundary = Line.random();
  }
}
