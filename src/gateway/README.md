# API Gateway — UrbanPulse

Este servicio actúa de punto único (reverse-proxy / gateway) para los microservicios de UrbanPulse.

## Software que se necesita instalar
- Node.js v18+  
- npm o yarn  
- Docker (opcional)

## Servicios que hay que arrancar (dependencias)
- microservice-node (Traffic service) -> por defecto en `TRAFFIC_SERVICE_URL`  
- microservice-python (Weather service) -> por defecto en `WEATHER_SERVICE_URL`


##  Dependencias que hay que instalar
Dentro de `src/gateway/`:
```bash
npm install
