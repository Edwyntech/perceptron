package tech.edwyn.perceptron.infra.spi;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tech.edwyn.perceptron.domain.Label;
import tech.edwyn.perceptron.domain.Line;
import tech.edwyn.perceptron.domain.spi.ForPredicting;

import java.util.stream.DoubleStream;

public class Perceptron implements ForPredicting {
  private static final Logger logger = LoggerFactory.getLogger(Perceptron.class);
  private double[] weights;

  public Perceptron() {
    reset();
  }

  @Override
  public void train(Line boundary) {
    double x = Math.random() * 1000;
    double y = Math.random() * 1000;
    double result = getOutput(x, y);
    double expected = y > x * boundary.slope() + boundary.intercept() ? 1 : -1;
    double error = expected - result;

    double learningRate = 0.1;
    weights[0] += error * x * learningRate;
    weights[1] += error * y * learningRate;
    weights[2] += error * learningRate;

    logger.info("Wx: {}, Wy: {}, Wb: {}", weights[0], weights[1], weights[2]);
  }

  @Override
  public Line getPrediction() {
    return new Line( - weights[0] / weights[1], - weights[2] / weights[1]);
  }

  @Override
  public Label predict(double x, double y) {
    double prediction = getOutput(x, y);
    return prediction > 0 ? Label.ABOVE : Label.BELOW;
  }

  private double getOutput(double x, double y) {
    double output = weights[0] * x + weights[1] * y + weights[2];
    return output >= 0 ? 1 : -1;
  }

  @Override
  public void reset() {
    weights = DoubleStream
      .generate(() -> 1)
      .limit(3)
      .toArray();
  }
}
