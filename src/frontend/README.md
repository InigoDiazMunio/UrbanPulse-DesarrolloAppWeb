# Frontend - UrbanPulse Dashboard

Dashboard interactivo en React + TypeScript que visualiza datos de tráfico y calidad del aire del País Vasco en tiempo real.

## Software que se necesita instalar

- **Node.js** (versión 18 o superior)
- **npm**  o **yarn**


## Servicios que hay que arrancar

Este frontend necesita que el **Gateway** esté corriendo en `http://localhost:8080` para acceder a:

- **API de Movilidad**: `/api/movilidad/realtime`
- **API de Meteorología**: `/api/meteorologia/realtime`
- **API de Autenticación**: `/api/auth/login` y `/api/auth/register`


## Dependencias que hay que instalar

Desde `src/frontend/`, ejecutar:
```bash
npm install
```

O si se usa yarn:
```bash
yarn install
```

### Dependencias principales incluidas

- **React** 18.2.0 - Framework de UI
- **TypeScript** 5.6.2 
- **Vite** 5.0.0 
- **Axios** 1.4.0 - Cliente HTTP
- **Recharts** 2.15.4 - Gráficos interactivos
- **Leaflet** 1.9.4 + **React-Leaflet** 4.2.1 - Mapas interactivos
- **React Router DOM** 6.13.0 - Enrutamiento

## Cómo arrancar la parte servidora (Backend)

### Arrancar el Gateway:
```bash
cd src/gateway
npm install
npm start
```

El Gateway debe estar corriendo en `http://localhost:8080`.

### Estructura de datos esperada del Backend:

**Tráfico** (`GET /api/movilidad/realtime`):
```json
[
  {
    "zone": "Bilbao",
    "location": "A-8",
    "road": "Autopista",
    "description": "Tráfico fluido",
    "type": "highway",
    "level": "normal",
    "vehicle_count": 1500,
    "average_speed": 90,
    "incident_count": 0,
    "timestamp": "2024-12-12T10:00:00Z"
  }
]
```

**Calidad del Aire** (`GET /api/meteorologia/realtime`):
```json
[
  {
    "id": 1,
    "city": "Bilbao",
    "zone": "Bilbao - Centro",
    "pollutant": "PM10",
    "value": 25.5,
    "unit": "µg/m³",
    "timestamp": "2024-12-12T10:00:00Z"
  }
]
```

## Cómo arrancar la parte cliente (Frontend)

### Modo desarrollo:
```bash
npm run dev
```

Esto iniciará el servidor de desarrollo en:
```
http://localhost:5173
```

### Modo producción:
```bash
npm run build
npm run preview
```

El build se genera en la carpeta `dist/`.

## Cómo acceder a la parte cliente

### Acceso local (desarrollo):

1. Asegúrate de que el Gateway esté corriendo en `http://localhost:8080`
2. Arranca el frontend: `npm run dev`
3. Abre tu navegador en: **http://localhost:5173**

### Flujo de acceso:

1. **Login**: La aplicación te redirige a `/login`
2. **Registrarse**: Crea una cuenta con usuario, email y contraseña
   - Si usas un email `@urbanpulse.com`, serás administrador automáticamente
3. **Dashboard**: Visualiza tráfico y calidad del aire en tiempo real
4. **Histórico**: Analiza evolución temporal de datos
5. **API**: Documentación de endpoints disponibles
6. **Admin** (solo administradores): Gestión de usuarios y servicios

### Credenciales de prueba:

**Usuario normal:**
- Username: `usuario1`
- Email: `usuario1@test.com`
- Password: `123456`

**Administrador** (si registras con email `@urbanpulse.com`):
- Username: `admin`
- Email: `admin@urbanpulse.com`
- Password: `admin123`

### Acceso en producción:

Después de hacer `npm run build`, sirve la carpeta `dist/` con cualquier servidor web:
```bash
npm run preview
npx serve dist
```

## Estructura del Proyecto
```
src/frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx      # Vista principal con mapa y métricas
│   │   ├── History.tsx        # Análisis histórico
│   │   ├── API.tsx           # Documentación API
│   │   ├── Admin.tsx         # Panel administración
│   │   └── Login.tsx         # Autenticación
│   ├── App.tsx               # Navegación y rutas
│   ├── main.tsx             # Punto de entrada
│   ├── index.css            # Estilos globales
│   └── vite-env.d.ts        # Tipos TypeScript
├── public/                   # Archivos estáticos
├── index.html               # HTML base
├── package.json             # Dependencias
├── tsconfig.json            # Config TypeScript
├── vite.config.ts           # Config Vite
├── .env                     # Variables de entorno (crear)
└── README.md               # Este archivo
```

## Funcionalidades

### Dashboard (Tiempo Real)
-  **Mapa interactivo** del País Vasco con estaciones de medición
-  **Métricas en vivo**: Vehículos, contaminantes, incidencias
-  **Código de colores** por nivel de contaminación
-  **Actualización automática** cada 5 minutos
-  **Filtro de contaminantes**: PM10, PM2.5, NO2, O3
-  **Gráficos comparativos** por provincias (Bizkaia, Gipuzkoa, Araba)

### Histórico
-  **Análisis temporal** de últimos 30 días
-  **Filtros**: Zona, contaminante, fecha
-  **Gráficos de evolución** dual (tráfico + calidad del aire)
-  **Tabla detallada** con datos por zona y día

### API
-  **Documentación** de endpoints disponibles
-  **Información de autenticación** JWT
-  **Ejemplos de uso** y respuestas

### Admin (Solo administradores)
-  **Gestión de usuarios**: Ver, eliminar, cambiar roles
-  **Monitor de servicios**: Estado de microservicios
-  **Logs del sistema**: Actividad reciente

## Solución de Problemas

### Error: "Cannot connect to backend"
```bash
cd src/gateway
npm start
# Debe estar en http://localhost:8080
```

- Comprueba la variable `VITE_API_BASE` en `.env`
- Revisa la consola del navegador (F12) para ver errores CORS
- Verifica que MongoDB y PostgreSQL estén corriendo si usas Docker

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### El mapa no se muestra
```bash

import 'leaflet/dist/leaflet.css';
```

Si el problema persiste, revisa la consola del navegador.

### Error: "Vite: Failed to resolve import"
```bash
# Asegúrate de estar en la carpeta correcta
cd src/frontend

# Reinstala dependencias
npm install
```

### Los datos no se actualizan

- Verifica que el Gateway esté respondiendo en `/api/movilidad/realtime`
- Revisa que los microservicios (Node y Python) estén corriendo
- Comprueba los logs del navegador (F12 → Console)

## Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_BASE` | URL base del backend | `http://localhost:8080/api` |

## Tecnologías Utilizadas

- **React** 18.2.0 - Framework frontend
- **TypeScript** 5.6.2 - Tipado estático
- **Vite** 5.0.0 - Build tool ultra-rápido
- **Axios** 1.4.0 - Peticiones HTTP
- **Recharts** 2.15.4 - Gráficos responsivos
- **Leaflet** 1.9.4 - Mapas interactivos
- **React Router** 6.13.0 - Navegación SPA

## Datos en Tiempo Real

### Fuentes de Datos:
- **Tráfico**: Open Data Euskadi - API de incidencias del Gobierno Vasco
- **Calidad del Aire**: Red de Control de Calidad del Aire del Gobierno Vasco

### Cobertura:
- **16 municipios** principales del País Vasco
- **3 provincias**: Bizkaia, Gipuzkoa, Araba
- **Contaminantes**: PM10, PM2.5, NO2, O3, SO2, CO

### Actualización:
- Backend: Cada 10 minutos desde APIs oficiales
- Frontend: Polling cada 5 minutos

## Scripts Disponibles
```bash
npm run dev       
npm run build    
npm run preview  
```

## Despliegue

### Docker 

El proyecto incluye un `Dockerfile` multi-stage:
```bash
docker-compose up frontend
```

### Despliegue manual
```bash
çnpm run build


---
