package tech.edwyn.perceptron.infra.spi;

import org.junit.jupiter.api.Test;
import tech.edwyn.perceptron.domain.Line;

import static org.junit.jupiter.api.Assertions.assertEquals;

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
}
