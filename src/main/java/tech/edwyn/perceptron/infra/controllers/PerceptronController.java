package tech.edwyn.perceptron.infra.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tech.edwyn.perceptron.infra.spi.Perceptron;

@RestController
@RequestMapping("/perceptron")
public class PerceptronController {
  private final Perceptron perceptron;

  public PerceptronController(Perceptron perceptron) {
    this.perceptron = perceptron;
  }

  @GetMapping("/learning-rate")
  public double getLearningRate() {
    return perceptron.getLearningRate();
  }

  @PutMapping("/learning-rate")
  public void setLearningRate(@RequestParam double learningRate) {
    perceptron.setLearningRate(learningRate);
  }

  @GetMapping("/weights")
  public double[] getWeights() {
    return perceptron.getWeights();
  }

}
