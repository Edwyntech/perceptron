package tech.edwyn.perceptron;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import tech.edwyn.perceptron.domain.Classification;
import tech.edwyn.perceptron.domain.spi.ForPredicting;
import tech.edwyn.perceptron.infra.spi.Perceptron;

import static org.springframework.boot.SpringApplication.run;

@SpringBootApplication
public class PerceptronApplication {

  static void main(String[] args) {
    run(PerceptronApplication.class, args);
  }

  @Bean
  public Perceptron perceptron() {
    return new Perceptron();
  }

  @Bean
  public Classification classification(ForPredicting forPredicting) {
    return new Classification(forPredicting);
  }

}
