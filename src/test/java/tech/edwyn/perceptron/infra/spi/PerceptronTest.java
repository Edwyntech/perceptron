package tech.edwyn.perceptron.infra.spi;

import org.junit.jupiter.api.Test;
import tech.edwyn.perceptron.domain.Line;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PerceptronTest {

  @Test
  void shouldLearnInterceptForLinearBoundary() {
    Perceptron perceptron = new Perceptron();
    Line boundary = new Line(0.5, 0.2); // y = 0.5x + 0.2

    for (int i = 0; i < 10000; i++) {
      perceptron.train(boundary);
    }

    Line prediction = perceptron.getPrediction();
    assertEquals(0.5, prediction.slope(), 0.2, "Slope should be close to 0.5");
    assertEquals(0.2, prediction.intercept(), 0.2, "Intercept should be close to 0.2");
  }

  @Test
  void shouldLearnNegativeInterceptForLinearBoundary() {
    Perceptron perceptron = new Perceptron();
    perceptron.setLearningRate(0.001);
    Line boundary = new Line(2.0, -3.0); // y = 2x - 3

    for (int i = 0; i < 100000; i++) {
      perceptron.train(boundary);
    }

    Line prediction = perceptron.getPrediction();
    assertEquals(2.0, prediction.slope(), 0.2, "Slope should be close to 2.0");
    assertEquals(-3.0, prediction.intercept(), 0.2, "Intercept should be close to -3.0");
  }

  @Test
  void shouldLearnFromSpecificCollectionOfPoints() {
    Perceptron perceptron = new Perceptron();
    perceptron.setLearningRate(0.01);
    Line boundary = new Line(1.0, 0.5); // y = 1.0x + 0.5

    java.util.List<tech.edwyn.perceptron.domain.Point> points = new java.util.ArrayList<>();
    for (int i = 0; i < 500; i++) {
      double x = Math.random() * 2 - 1;
      double y = Math.random() * 2 - 1;
      points.add(new tech.edwyn.perceptron.domain.Point(x, y, tech.edwyn.perceptron.domain.Label.BELOW));
    }

    for (int epoch = 0; epoch < 2000; epoch++) {
      perceptron.train(points, boundary);
    }

    Line prediction = perceptron.getPrediction();
    assertEquals(1.0, prediction.slope(), 0.2, "Slope should be close to 1.0");
    assertEquals(0.5, prediction.intercept(), 0.2, "Intercept should be close to 0.5");
  }

  @Test
  void shouldHandleZeroWeightForY() throws Exception {
    Perceptron perceptron = new Perceptron();
    java.lang.reflect.Field field = Perceptron.class.getDeclaredField("weights");
    field.setAccessible(true);
    field.set(perceptron, new double[]{1.0, 0.0, 0.5});

    Line prediction = perceptron.getPrediction();
    assertTrue(Double.isFinite(prediction.slope()), "Slope should be finite");
    assertTrue(Double.isFinite(prediction.intercept()), "Intercept should be finite");
  }
}

