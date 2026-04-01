package tech.edwyn.perceptron.infra.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tech.edwyn.perceptron.domain.Classification;
import tech.edwyn.perceptron.domain.Line;

@RestController
@RequestMapping("/classification")
public class ClassificationController {

  private final Classification classification;

  public ClassificationController(Classification classification) {
    this.classification = classification;
  }

  @GetMapping
  public Classification getClassification() {
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
  public Classification addPoint() {
    classification.addPoint();
    return classification;
  }

  @PostMapping("/train")
  public Classification train() {
    classification.train();
    return classification;
  }

}
