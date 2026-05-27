package tech.edwyn.perceptron.infra.controllers;

import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import tech.edwyn.perceptron.domain.Classification;
import tech.edwyn.perceptron.infra.spi.Perceptron;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ClassificationControllerTest {

  @Test
  void shouldRunTrainingStreamAsynchronously() throws Exception {
    CountDownLatch trainLatch = new CountDownLatch(5);

    Classification classification = new Classification(new Perceptron()) {
      @Override
      public synchronized boolean train() {
        boolean result = super.train();
        trainLatch.countDown();
        return result;
      }
    };


    ClassificationController controller = new ClassificationController(classification);

    SseEmitter emitter = controller.trainStream(5, 1);
    assertNotNull(emitter, "Emitter should not be null");

    // Wait for the asynchronous training loop to execute 5 times
    boolean finished = trainLatch.await(5, TimeUnit.SECONDS);
    assertTrue(finished, "The training loop should execute 5 times within timeout");
  }

  @Test
  void shouldShufflePointsBeforeTrainingStream() {
    Classification classification = new Classification(new Perceptron());
    for (int i = 0; i < 50; i++) {
      classification.addPoint();
    }

    java.util.List<tech.edwyn.perceptron.domain.Point> originalPoints = classification.getPoints();

    ClassificationController controller = new ClassificationController(classification);
    controller.trainStream(1, 1);

    java.util.List<tech.edwyn.perceptron.domain.Point> shuffledPoints = classification.getPoints();

    org.junit.jupiter.api.Assertions.assertEquals(originalPoints.size(), shuffledPoints.size());

    boolean orderIsDifferent = false;
    for (int i = 0; i < originalPoints.size(); i++) {
      if (originalPoints.get(i).x() != shuffledPoints.get(i).x() ||
          originalPoints.get(i).y() != shuffledPoints.get(i).y()) {
        orderIsDifferent = true;
        break;
      }
    }
    assertTrue(orderIsDifferent, "The points list should be randomized/shuffled");
  }
}
