# Perceptron

Visualisation interactive d'un perceptron simple : l'utilisateur définit une droite de séparation, ajoute des points et entraîne le modèle à les classifier (ABOVE / BELOW).

## Stack

- **Backend** : Java 25, Spring Boot 4, architecture hexagonale (`domain` / `infra`)
- **Frontend** : TypeScript, Lit (Web Components), Carbon Design System, Vite
- **Build** : Maven (le build frontend est intégré via `frontend-maven-plugin`)

## Structure

```
src/main/java/tech/edwyn/perceptron/
├── domain/          # Modèle métier (Point, Line, Label, Classification) + port ForPredicting
└── infra/
    ├── controllers/ # REST API (/classification)
    └── spi/         # Implémentations : Perceptron, GeometryPrediction

src/main/frontend/   # Application Lit (Web Components)
```

## API REST

| Méthode | Endpoint                    | Description                        |
|---------|-----------------------------|------------------------------------|
| GET     | `/classification`           | État courant (points + prédiction) |
| POST    | `/classification/boundary`  | Définir la droite de référence     |
| POST    | `/classification/points`    | Ajouter un point aléatoire         |
| POST    | `/classification/train`     | Effectuer une itération d'entraînement |
| POST    | `/classification/reset`     | Réinitialiser                      |

## Prérequis

- Java 25+
- Maven 3.9+

Node.js et npm sont téléchargés automatiquement par Maven lors du build.

## Build & lancement

```bash
# Build complet (frontend + backend) et lancement
mvn spring-boot:run
```

L'application est accessible sur [http://localhost:8080](http://localhost:8080).

## Développement frontend

Pour itérer rapidement sur le frontend avec hot-reload :

```bash
# Dans un terminal — backend
mvn spring-boot:run

# Dans un autre terminal — frontend
npm install
npm run dev
```

Le serveur Vite démarre sur [http://localhost:5173](http://localhost:5173).
