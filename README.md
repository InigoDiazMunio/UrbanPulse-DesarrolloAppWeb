# UrbanPulse-DesarrolloAppWeb
Este es mi repositorio sobre UrbanPulse, una aplicación desarrollada para el proyecto de Desarrollo avanzado de aplicaciones para la Web de Datos de la Universidad de Deusto. 

# UrbanPulse - Plataforma de Movilidad Urbana

**UrbanPulse** es una plataforma inteligente de análisis de movilidad urbana y calidad del aire en tiempo real para el País Vasco. Desarrollada con arquitectura de microservicios, integra datos oficiales del Gobierno Vasco para proporcionar información actualizada sobre tráfico, incidencias y contaminación atmosférica.

---

## Índice

- [0) Software necesario](#0-software-necesario)
- [1) Servicios que arrancar](#1-servicios-que-arrancar)
- [2) Dependencias que instalar](#2-dependencias-que-instalar)
- [3) Arrancar parte servidora](#3-arrancar-parte-servidora)
- [4) Acceder a la parte cliente](#4-acceder-a-la-parte-cliente)
- [Arquitectura](#arquitectura)
- [Funcionalidades](#funcionalidades)
- [Estructura del proyecto](#estructura-del-proyecto)

---

## 0 Software necesario

### Requisitos obligatorios:

- **Docker** y **Docker Compose**: [Instalar Docker](https://docs.docker.com/get-docker/)
- **Node.js** v18+: [Instalar Node.js](https://nodejs.org/)
- **Python** 3.10+: [Instalar Python](https://www.python.org/downloads/)

### Verificar instalación:
```bash
docker --version          # Docker 20.x.x o superior
docker-compose --version  # Docker Compose 2.x.x o superior
node --version            # v18.x.x o superior
python --version          # Python 3.10.x o superior
```

---

## 1 Servicios que arrancar

UrbanPulse usa **Docker Compose** para orquestar todos los servicios:
```bash
# Desde la raíz del proyecto
docker-compose up --build
```

Esto arrancará automáticamente:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **MongoDB** | 27017 | Base de datos para tráfico y usuarios |
| **PostgreSQL** | 5432 | Base de datos para calidad del aire |
| **Microservicio Node** | 8002 | Servicio de tráfico (Open Data Euskadi) |
| **Microservicio Python** | 8000 | Servicio de calidad del aire |
| **Gateway** | 8080 | API Gateway + Autenticación JWT |
| **Frontend** | 3000 | Aplicación React (Dashboard) |

### Verificar que todo funciona:
```bash
curl http://localhost:8080/health        # Gateway
curl http://localhost:8002/health        # Microservicio tráfico
curl http://localhost:8000/health        # Microservicio aire
```

---

## 2 Dependencias que instalar

### Opción A: Con Docker (Recomendado)
```bash
docker-compose up --build
```

Docker instalará automáticamente todas las dependencias.

### Opción B: Instalación manual (Desarrollo)

#### Gateway:
```bash
cd src/gateway
npm install
```

#### Microservicio Node:
```bash
cd src/microservice-node
npm install
```

#### Microservicio Python:
```bash
cd src/microservice-python
pip install -r requirements.txt
```

#### Frontend:
```bash
cd src/frontend
npm install
```

---

## 3 Arrancar parte servidora

### Opción A: Docker Compose (Producción/Testing)
```bash
docker-compose up
docker-compose up -d
docker-compose logs -f
docker-compose down
```


#### 1. Arrancar bases de datos:
```bash
# MongoDB
docker run -d -p 27017:27017 --name mongo mongo:6.0

# PostgreSQL
docker run -d -p 5432:5432 \
  -e POSTGRES_USER=urbanpulse \
  -e POSTGRES_PASSWORD=urbanpulse \
  -e POSTGRES_DB=urbanpulse_db \
  --name postgres postgres:15
```

#### 2. Crear tabla en PostgreSQL:
```bash
docker exec -i postgres psql -U urbanpulse -d urbanpulse_db < src/database/postgres-init.sql
```

#### 3. Arrancar microservicio de tráfico:
```bash
cd src/microservice-node
npm start
# Escucha en http://localhost:8002
```

#### 4. Arrancar microservicio de calidad del aire:
```bash
cd src/microservice-python
uvicorn main:app --host 0.0.0.0 --port 8000
# Escucha en http://localhost:8000
```

#### 5. Arrancar Gateway:
```bash
cd src/gateway
npm start
# Escucha en http://localhost:8080
```

#### 6. Arrancar Frontend:
```bash
cd src/frontend
npm run dev
# Escucha en http://localhost:5173
```

---

## 4 Acceder a la parte cliente

### URLs principales:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Dashboard** | http://localhost:3000 | Frontend  |
| **Dashboard (dev)** | http://localhost:5173 | Frontend  |
| **API Gateway** | http://localhost:8080 | API REST |
| **Swagger Docs** | http://localhost:8080/docs | Documentación API |

### Flujo de usuario:

1. **Accede al frontend**: `http://localhost:3000` 
2. **Regístrate**: Crea una cuenta desde `/login`
   - Usa un email `@urbanpulse.com` para ser **administrador**
3. **Explora el dashboard**:
   - **Dashboard**: Visualización en tiempo real
   - **Histórico**: Análisis temporal
   - **API**: Documentación de endpoints
   - **Admin**: Gestión de usuarios (solo administradores)

### Ejemplo de registro:

**Usuario normal:**
```
Username: usuario1
Email: usuario1@test.com
Password: 123456
```

**Administrador:**
```
Username: admin
Email: admin@urbanpulse.com
Password: admin123
```

---

## 📐 Arquitectura
```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                  │
│            http://localhost:3000                    │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ HTTP/REST
                  ▼
┌─────────────────────────────────────────────────────┐
│              API GATEWAY (Node.js)                  │
│            http://localhost:8080                    │
│  • Autenticación JWT                                │
│  • Proxy a microservicios                           │
│  • CORS                                             │
└──────────┬──────────────────────┬───────────────────┘
           │                      │
           │                      │
           ▼                      ▼
┌──────────────────────┐  ┌──────────────────────────┐
│ Microservicio Node   │  │ Microservicio Python     │
│ (Tráfico)            │  │ (Calidad del Aire)       │
│ :8002                │  │ :8000                    │
│                      │  │                          │
│ • Open Data Euskadi  │  │ • Datos realistas        │
│ • MongoDB            │  │ • PostgreSQL             │
└──────────┬───────────┘  └──────────┬───────────────┘
           │                         │
           ▼                         ▼
    ┌──────────┐             ┌──────────────┐
    │ MongoDB  │             │ PostgreSQL   │
    │  :27017  │             │   :5432      │
    └──────────┘             └──────────────┘
```

---

##  Funcionalidades

### Dashboard en Tiempo Real
-  Mapa interactivo del País Vasco con estaciones de medición
- Métricas en vivo: Vehículos, contaminantes, incidencias
-  Código de colores por nivel de contaminación
-  Actualización automática cada 5 minutos
-  Filtro de contaminantes: PM10, PM2.5, NO2, O3
-  Gráficos comparativos por provincias

### Análisis Histórico
-  Evolución temporal de últimos 30 días
-  Filtros por zona, contaminante y fecha
-  Gráficos de evolución dual (tráfico + aire)
-  Tabla detallada con datos por zona

### Panel de Administración
-  Gestión de usuarios (crear, eliminar, cambiar roles)
-  Monitor de estado de microservicios
-  Logs del sistema en tiempo real
-  Acceso restringido solo para administradores

### API REST
-  Documentación Swagger interactiva
-  Autenticación JWT
-  Endpoints para tráfico y calidad del aire
-  Ejemplos de uso y respuestas

---

##  Estructura del proyecto
```
UrbanPulse/
├── src/
│   ├── frontend/              # React + TypeScript
│   │   ├── src/
│   │   │   ├── pages/        # Dashboard, History, API, Admin, Login
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── README.md         #  Documentación frontend
│   │
│   ├── gateway/              # API Gateway (Node.js + Express)
│   │   ├── routes/
│   │   │   └── auth.js       # Login, registro, JWT
│   │   ├── app.js
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── microservice-node/    # Tráfico (Node.js + MongoDB)
│   │   ├── server.js
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── microservice-python/  # Calidad aire (FastAPI + PostgreSQL)
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   └── database/
│       ├── mongo-init.js
│       └── postgres-init.sql
│
├── docker-compose.yml        # Orquestación de servicios
├── .gitignore
└── README.md                 #  Este archivo
```

---

##  Tecnologías

### Frontend
- React 18.2.0
- TypeScript 5.6.2
- Vite 5.0.0
- Recharts (gráficos)
- Leaflet (mapas)
- Axios (HTTP)

### Backend
- Node.js 18 (Gateway + Microservicio tráfico)
- Python 3.10 (Microservicio calidad aire)
- Express (Gateway)
- FastAPI (Python)
- JWT (Autenticación)

### Bases de Datos
- MongoDB 6.0 (Tráfico, usuarios)
- PostgreSQL 15 (Calidad del aire)

### DevOps
- Docker & Docker Compose
- Nginx (producción)

---

##  Fuentes de Datos

- **Tráfico**: [Open Data Euskadi](https://opendata.euskadi.eus/) - API oficial del Gobierno Vasco
- **Calidad del Aire**:  Red de Control de Calidad del Aire del Gobierno Vasco

### Cobertura:
- **16 municipios** principales del País Vasco
- **3 provincias**: Bizkaia, Gipuzkoa, Araba
- **Contaminantes**: PM10, PM2.5, NO2, O3, SO2, CO

---

##  Solución de Problemas

### Docker no arranca los servicios
```bash
docker-compose down -v
docker system prune -a

docker-compose up --build
```



### Frontend no conecta con backend

1. Verifica que el Gateway esté corriendo: `curl http://localhost:8080/health`
2. Comprueba `.env` en `src/frontend/`:
```
   VITE_API_BASE=http://localhost:8080/api
```
3. Revisa CORS en la consola del navegador (F12)

### MongoDB connection refused
```bash
docker ps | grep mongo
docker-compose up mongo -d
```

---

##  Comandos útiles
```bash
docker-compose logs -f gateway
docker-compose logs -f frontend
docker-compose up --build frontend
docker exec -it urbanpulse-mongo mongosh
docker exec -it urbanpulse-postgres psql -U urbanpulse
docker-compose down -v
```

---

Proyecto desarrollado para la **Universidad de Deusto** - Desarrollo Avanzado de Aplicaciones para la Web de Datos.

---

