require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const jwtMiddleware = require('./middleware/auth');

// ✅ IMPORTAR RUTAS DE AUTH
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'UrbanPulse API Gateway',
    version: '1.0.0',
    description: 'Gateway que expone y documenta los endpoints de UrbanPulse'
  },
  servers: [
    { url: `http://localhost:${PORT}`, description: 'Local server' }
  ],
  // ✅ AÑADIR SEGURIDAD
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js', './app.js'],
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ USAR RUTAS DE AUTH (SIN PROTECCIÓN)
app.use('/auth', authRoutes);

// --- Health
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'gateway' }));

// --- JWT-protected example route
app.get('/api/admin/health', jwtMiddleware, (req, res) => {
  res.json({ status: 'ok', service: 'admin-protected', user: req.user || null });
});

// --- Proxies hacia microservicios
const TRAFFIC_SERVICE_URL = process.env.TRAFFIC_SERVICE_URL || 'http://localhost:8002';
const WEATHER_SERVICE_URL = process.env.WEATHER_SERVICE_URL || 'http://localhost:8001';

// ✅ QUITAR jwtMiddleware TEMPORALMENTE PARA DESARROLLO
// (o déjalo si quieres forzar login)
app.use(
  '/api/movilidad',
  // jwtMiddleware,  // ← Comentar esta línea para desarrollo sin login
  createProxyMiddleware({
    target: TRAFFIC_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/movilidad': '/' },
  })
);

app.use(
  '/api/meteorologia',
  // jwtMiddleware,  // ← Comentar también si quieres
  createProxyMiddleware({
    target: WEATHER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/meteorologia': '/' }
  })
);

app.get('/api/info', (req, res) => {
  res.json({
    app: 'UrbanPulse API Gateway',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found in gateway' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});