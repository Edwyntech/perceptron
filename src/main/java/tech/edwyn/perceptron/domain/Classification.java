package tech.edwyn.perceptron.domain;

import tech.edwyn.perceptron.domain.spi.ForPredicting;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class Classification {
  private static final Random random = new Random();
  private final ForPredicting forPredicting;
  private Line boundary;
  private final List<Point> points = new ArrayList<>();
  private int currentPointIndex = 0;

  public Classification(ForPredicting forPredicting) {
    this.forPredicting = forPredicting;
    reset();
  }

  public synchronized Line getBoundary() {
    return boundary;
  }

  public synchronized void setBoundary(Line boundary) {
    this.boundary = boundary;
  }

  public synchronized Line getPrediction() {
    return forPredicting.getPrediction();
  }

  public synchronized List<Point> getPoints() {
    return new ArrayList<>(points);
  }

  public synchronized double[] getWeights() {
    return forPredicting.getWeights();
  }

  public synchronized void reset() {
    forPredicting.reset();
    this.boundary = new Line(1, 0);
    this.points.clear();
    this.currentPointIndex = 0;
  }

  public synchronized void addPoint() {
    addPoint(null, null, null, null);
  }

  public synchronized void addPoint(Double xMin, Double xMax, Double yMin, Double yMax) {
    double minX = xMin != null ? xMin : -1.0;
    double maxX = xMax != null ? xMax : 1.0;
    double minY = yMin != null ? yMin : -1.0;
    double maxY = yMax != null ? yMax : 1.0;

    double x = minX + random.nextDouble() * (maxX - minX);
    double y = minY + random.nextDouble() * (maxY - minY);
    Label label = forPredicting.predict(x, y);
    points.add(new Point(x, y, label));
    this.currentPointIndex = 0;
  }

  public synchronized void addPoints(Double xMin, Double xMax, Double yMin, Double yMax, int count) {
    for (int i = 0; i < count; i++) {
      addPoint(xMin, xMax, yMin, yMax);
    }
  }

  public synchronized void shufflePoints() {
    java.util.Collections.shuffle(this.points, random);
    this.currentPointIndex = 0;
  }

  private boolean checkConvergence() {
    boolean converged = true;
    for (Point p : points) {
      Label prediction = forPredicting.predict(p.x(), p.y());
      Label expected = (p.y() > p.x() * boundary.slope() + boundary.intercept()) ? Label.ABOVE : Label.BELOW;
      if (prediction != expected) {
        converged = false;
      }
    }
    return converged;
  }

  public synchronized boolean train() {
    if (points.isEmpty()) {
      forPredicting.train(boundary);
      return false;
    }
    if (currentPointIndex >= points.size()) {
      shufflePoints();
    }
    Point point = points.get(currentPointIndex);
    forPredicting.train(point, boundary);
    currentPointIndex++;

    return checkConvergence();
  }

  public synchronized void updatePointLabels() {
    for (int i = 0; i < points.size(); i++) {
      Point p = points.get(i);
      Label prediction = forPredicting.predict(p.x(), p.y());
      points.set(i, new Point(p.x(), p.y(), prediction));
    }
  }
}
