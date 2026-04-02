package tech.edwyn.perceptron.infra.spi;

import tech.edwyn.perceptron.domain.Label;
import tech.edwyn.perceptron.domain.Line;
import tech.edwyn.perceptron.domain.spi.ForPredicting;

import java.util.Arrays;

public class Perceptron implements ForPredicting {
  private double[] weights;
  private double learningRate = 0.01;

  public Perceptron() {
    reset();
  }

  @Override
  public void train(Line boundary) {
    double x = Math.random() * 2 - 1;
    double y = Math.random() * 2 - 1;
    double result = calculateOutput(x, y);
    double expected = y > x * boundary.slope() + boundary.intercept() ? 1 : -1;
    double error = expected - result;

    weights[0] += error * x * learningRate;
    weights[1] += error * y * learningRate;
    weights[2] += error * learningRate;
  }

  @Override
  public Line getPrediction() {
    // w0*x + w1*y + w2 = 0 => y = -(w0/w1)*x - w2/w1
    return new Line(-weights[0] / weights[1], -weights[2] / weights[1]);
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
