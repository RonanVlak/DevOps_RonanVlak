[![CI-API](https://github.com/RonanVlak/DevOps_RonanVlak/actions/workflows/CI-API.yml/badge.svg?branch=main)](https://github.com/RonanVlak/DevOps_RonanVlak/actions/workflows/CI-API.yml)


# DevOps Eindopdracht

## Architectuur

De applicatie draait in containers en bestaat uit de volgende services:
* **Frontend:** Web client (gehost op poort `80`)
* **API:** Backend server (gehost op poort `3000`)
* **MongoDB:** NoSQL Database (intern afgeschermd)
* **RabbitMQ:** Message Broker (Management UI op poort `15672`)


### Swarm Initialiseren
Activeer de Docker Swarm modus op je machine (dit hoeft maar één keer per systeem):
```bash
docker swarm init
```

### Images Bouwen
Omdat Docker Swarm lokaal gebouwde images nodig heeft om lokaal te kunnen deployen, bouwen we de Frontend en API eerst lokaal met compose:
```bash
docker compose build
```

### De Stack Uitrollen (Deployen)
Start de volledige stack binnen de Swarm onder de naam `mijnproject`:
```bash
docker stack deploy -c docker-compose.yml mijnproject
```

## Toegang tot de Applicatie

Zodra de stack is uitgerold, verdeelt de Docker Swarm Routing Mesh het verkeer. De applicaties zijn via de browser te bereiken op de volgende adressen:

* **Frontend:** [http://localhost](http://localhost)
* **API:** [http://localhost:3000](http://localhost:3000)
* **RabbitMQ Dashboard:** [http://localhost:15672](http://localhost:15672) *(Inlog: `guest` / `guest`)*

## Horizontal Scaling & Orchestration

Een van de aspecten van dit project is het aantonen van horizontal scaling zonder een nieuw release-proces te hoeven doorlopen.

**Status Controleren:**
Bekijk welke services draaien en hoeveel replica's er actief zijn:
```bash
docker service ls
```

**Live Schalen (Horizontal Scaling):**
Je kunt de services opschalen bij piekdrukte. Schaal bijvoorbeeld de frontend dynamisch op naar 3 instances:
```bash
docker service scale mijnproject_frontend=3
```
*Docker Swarm verdeelt binnenkomend netwerkverkeer nu automatisch over deze 3 instances als een interne load balancer.*


