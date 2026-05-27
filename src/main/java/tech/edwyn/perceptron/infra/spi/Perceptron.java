package tech.edwyn.perceptron.infra.spi;

import tech.edwyn.perceptron.domain.Label;
import tech.edwyn.perceptron.domain.Line;
import tech.edwyn.perceptron.domain.Point;
import tech.edwyn.perceptron.domain.spi.ForPredicting;

import java.util.Arrays;
import java.util.Collection;

public class Perceptron implements ForPredicting {
  private double[] weights;
  private double learningRate = 0.01;

  public Perceptron() {
    reset();
  }

  @Override
  public void train(Line boundary) {
    double x = Math.random() * 2 - 1;

    double yAtMinX = -1.0 * boundary.slope() + boundary.intercept();
    double yAtMaxX = boundary.slope() + boundary.intercept();
    double yMin = Math.min(-1.0, Math.min(yAtMinX, yAtMaxX)) - 1.0;
    double yMax = Math.max(1.0, Math.max(yAtMinX, yAtMaxX)) + 1.0;

    double y = yMin + Math.random() * (yMax - yMin);

    double result = calculateOutput(x, y);
    double expected = y > x * boundary.slope() + boundary.intercept() ? 1 : -1;
    double error = expected - result;

    weights[0] += error * x * learningRate;
    weights[1] += error * y * learningRate;
    weights[2] += error * learningRate;
  }

  @Override
  public void train(Point point, Line boundary) {
    if (point == null) {
      return;
    }
    double x = point.x();
    double y = point.y();
    double result = calculateOutput(x, y);
    double expected = y > x * boundary.slope() + boundary.intercept() ? 1 : -1;
    double error = expected - result;

    weights[0] += error * x * learningRate;
    weights[1] += error * y * learningRate;
    weights[2] += error * learningRate;
  }

  @Override
  public void train(Collection<Point> points, Line boundary) {
    if (points == null || points.isEmpty()) {
      return;
    }
    java.util.List<Point> shuffled = new java.util.ArrayList<>(points);
    java.util.Collections.shuffle(shuffled);
    for (Point point : shuffled) {
      train(point, boundary);
    }
  }

  @Override
  public Line getPrediction() {
    // w0*x + w1*y + w2 = 0 => y = -(w0/w1)*x - w2/w1
    double w1 = weights[1];
    if (Math.abs(w1) < 1e-9) {
      w1 = Math.copySign(1e-9, w1);
      if (w1 == 0.0) {
        w1 = 1e-9;
      }
    }
    return new Line(-weights[0] / w1, -weights[2] / w1);
  }

  @Override
  public Label predict(double x, double y) {
    double prediction = calculateOutput(x, y);
    return prediction > 0 ? Label.ABOVE : Label.BELOW;
  }

  @SuppressWarnings("UnnecessaryLocalVariable")
  private double calculateOutput(double xn, double yn) {
    double summation = calculateWeightedSum(xn, yn);
    double activation = calculateActivation(summation);
    return activation;
  }

  private static int calculateActivation(double summation) {
    return summation > 0 ? 1 : -1;
  }

  private double calculateWeightedSum(double xn, double yn) {
    return weights[0] * xn + weights[1] * yn + weights[2];
  }

  @Override
  public void reset() {
    weights = new double[]{Math.random(), Math.random(), Math.random()};
  }

  public double getLearningRate() {
    return learningRate;
  }

  public void setLearningRate(double learningRate) {
    this.learningRate = learningRate;
  }

  public double[] getWeights() {
    return Arrays.copyOf(weights, weights.length);
  }
}
