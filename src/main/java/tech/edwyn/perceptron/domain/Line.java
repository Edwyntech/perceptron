package tech.edwyn.perceptron.domain;

public record Line(int slope, int intercept) {

  public static Line random() {
    return new Line((int) (Math.random() * 200) - 100, (int) (Math.random() * 200) - 100);
  }
}
