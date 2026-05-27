package tech.edwyn.perceptron.infra.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import tech.edwyn.perceptron.domain.Classification;
import tech.edwyn.perceptron.domain.Line;

import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/classification")
public class ClassificationController {

  private final Classification classification;
  private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

  public ClassificationController(Classification classification) {
    this.classification = classification;
  }

  @GetMapping
  public Classification getClassification() {
    classification.updatePointLabels();
    return classification;
  }

  @PostMapping("/boundary")
  public Classification setBoundary(Line boundary) {
    classification.setBoundary(boundary);
    return classification;
  }

  @PostMapping("/reset")
  public Classification reset() {
    classification.reset();
    return classification;
  }

  @PostMapping("/points")
  public Classification addPoint(
      @RequestParam(required = false) Double xMin,
      @RequestParam(required = false) Double xMax,
      @RequestParam(required = false) Double yMin,
      @RequestParam(required = false) Double yMax,
      @RequestParam(defaultValue = "1") int count) {
    classification.addPoints(xMin, xMax, yMin, yMax, count);
    return classification;
  }

  @PostMapping("/train")
  public Classification train() {
    classification.train();
    return classification;
  }

  @GetMapping("/train-stream")
  public SseEmitter trainStream(
      @RequestParam(defaultValue = "1000") int epochs,
      @RequestParam(defaultValue = "10") int delayMs) {
    SseEmitter emitter = new SseEmitter(300_000L); // 5 minutes timeout

    classification.shufflePoints();

    executor.submit(() -> {
      try {
        for (int i = 0; i < epochs; i++) {
          boolean converged = classification.train();
          emitter.send(SseEmitter.event()
              .name("update")
              .data(new TrainingUpdate(classification.getPrediction(), classification.getWeights(), converged)));
          if (converged && !classification.getPoints().isEmpty()) {
            break;
          }
          if (delayMs > 0) {
            Thread.sleep(delayMs);
          }
        }
        emitter.send(SseEmitter.event()
            .name("complete")
            .data("done"));
        emitter.complete();
      } catch (IOException | IllegalStateException e) {
        emitter.completeWithError(e);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        emitter.completeWithError(e);
      } catch (Exception e) {
        emitter.completeWithError(e);
      }
    });

    return emitter;
  }

  public record TrainingUpdate(Line prediction, double[] weights, boolean converged) {}

  @GetMapping("/prediction")
  public Line getPrediction() {
    return classification.getPrediction();
  }

}
