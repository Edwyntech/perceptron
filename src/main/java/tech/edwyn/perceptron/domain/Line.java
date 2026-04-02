package tech.edwyn.perceptron.domain;

public record Line(double slope, double intercept) {

  public static Line random() {
    return new Line(Math.random() * 5, Math.random() * 10);
  }
}
