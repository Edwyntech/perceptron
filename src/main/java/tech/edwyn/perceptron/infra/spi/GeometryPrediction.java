package tech.edwyn.perceptron.infra.spi;

import tech.edwyn.perceptron.domain.Label;
import tech.edwyn.perceptron.domain.Line;
import tech.edwyn.perceptron.domain.Point;
import tech.edwyn.perceptron.domain.spi.ForPredicting;

import java.util.Collection;

@SuppressWarnings("unused")
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
  public void train(Point point, Line boundary) {
    this.boundary = boundary;
  }

  @Override
  public void train(Collection<Point> points, Line boundary) {
    this.boundary = boundary;
  }

  @Override
  public Line getPrediction() {

    return boundary;
  }

  @Override
  public Label predict(double x, double y) {
    return (y >= x * boundary.slope() + boundary.intercept())
      ? Label.ABOVE
      : Label.BELOW;
  }

  @Override
  public void reset() {
    boundary = Line.random();
  }

  @Override
  public double[] getWeights() {
    return new double[]{-boundary.slope(), 1.0, -boundary.intercept()};
  }
}
