package tech.edwyn.perceptron.domain;

import tech.edwyn.perceptron.domain.spi.ForPredicting;

import java.util.HashSet;
import java.util.Random;
import java.util.Set;

import static java.util.stream.Collectors.toSet;

public class Classification {
  private static final Random random = new Random();
  private final ForPredicting forPredicting;
  private Line boundary;
  private Set<Point> points = new HashSet<>();

  public Classification(ForPredicting forPredicting) {
    this.forPredicting = forPredicting;
    reset();
  }

  public Line getBoundary() {
    return boundary;
  }

  public void setBoundary(Line boundary) {
    this.boundary = boundary;
  }

  public Line getPrediction() {
    return forPredicting.getPrediction();
  }

  public Set<Point> getPoints() {
    return points;
  }

  public void reset() {
    forPredicting.reset();
    this.boundary = new Line(1, 0);
    this.points.clear();
  }

  public void addPoint() {
    int x = random.nextInt(1000);
    int y = random.nextInt(1000);
    Label label = forPredicting.predict(x, y);
    points.add(new Point(x, y, label));
  }

  public void train() {
    forPredicting.train(boundary);
    points = points.stream()
                   .map(point -> {
                     Label prediction = forPredicting.predict(point.x(), point.y());
                     return new Point(point.x(), point.y(), prediction);
                   })
                   .collect(toSet());
  }
}
