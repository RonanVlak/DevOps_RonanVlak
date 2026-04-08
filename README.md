[![CI-API](https://github.com/RonanVlak/DevOps_RonanVlak/actions/workflows/CI-API.yml/badge.svg?branch=main)](https://github.com/RonanVlak/DevOps_RonanVlak/actions/workflows/CI-API.yml)

| Service | Status |
| :--- | :--- |
| **API** | [![API Status](https://github.com/RonanVlak/DevOps_RonanVlak/actions/workflows/CI-API.yml/badge.svg?branch=main&job=test-api)](https://github.com/RonanVlak/DevOps_RonanVlak/actions) |
| **Worker** | [![Worker Status](https://github.com/RonanVlak/DevOps_RonanVlak/actions/workflows/CI-API.yml/badge.svg?branch=main&job=test-worker)](https://github.com/RonanVlak/DevOps_RonanVlak/actions) |
| **Frontend** | [![Frontend Status](https://github.com/RonanVlak/DevOps_RonanVlak/actions/workflows/CI-API.yml/badge.svg?branch=main&job=test-frontend)](https://github.com/RonanVlak/DevOps_RonanVlak/actions) |

# DevOps Eindopdracht

## Architectuur

De applicatie is opgebouwd volgens een microservices-architectuur en draait volledig in Docker-containers binnen een Swarm omgeving.

### Componenten

* **Frontend:** Angular web client (gehost op poort 8080).
* **API:** Node.js Express backend server (gehost op poort 3000).
* **Worker:** Een asynchrone service die zware taken verwerkt vanuit de message queue.
* **MongoDB (Database A):** Hoofddatabase voor de API.
* **Mongo Worker (Database B):** Gescheiden database voor de Worker-service.
* **RabbitMQ:** Message Broker voor onderlinge communicatie tussen services.
* **Monitoring:** Prometheus (metrics), Alertmanager (notificaties) en Grafana (dashboards).

## Messaging & Microservices

Dit project demonstreert een event-driven architectuur. Wanneer er een nieuwe gebruiker wordt aangemaakt via de API, gebeurt het volgende:

1. De API slaat de data op in de hoofd-database (Database A).
2. De API plaatst een UserAangemaakt event op de RabbitMQ message bus.
3. De Worker pakt dit bericht direct op uit de queue.
4. De Worker logt de actie in zijn eigen, gescheiden database (Database B).


## Installatie & Deployment (Docker Swarm)

### 1. Swarm Initialiseren

Activeer de Docker Swarm modus (indien nog niet actief):
docker swarm init

### 2. Images Bouwen

Bouw de lokale images voor de API, Worker en Frontend:
docker compose build

### 3. De Stack Uitrollen

Start de volledige stack binnen de Swarm omgeving:
docker stack deploy -c docker-compose.yml mijnproject

## Toegang tot de Applicatie

* Frontend: http://localhost:8080
* API: http://localhost:3000
* Grafana Dashboard: http://localhost (Inlog: admin / admin)
* RabbitMQ Dashboard: http://localhost:15672 (Inlog: guest / guest)

## Horizontal Scaling

Je kunt services dynamisch op- of afschalen zonder downtime:

# Schaal de frontend op naar 3 instances

docker service scale mijnproject_frontend=3

# Controleer de status van de replica's

docker service ls

## Continuous Integration (GitHub Actions)

Bij elke push naar de development branch of pull request naar main worden de volgende stappen automatisch uitgevoerd:

* Linting: Code style check via ESLint op basis van de root-configuratie.
* API Tests: Unittests met Jest en Supertest.
* Worker Tests: Unittests met Jest en een In-Memory MongoDB server.
* Frontend Tests: UI tests via Vitest.