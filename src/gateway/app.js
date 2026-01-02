require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 8080;

// CONECTAR A MONGODB PARA USUARIOS
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/urbanpulse';

mongoose.connect(MONGO_URI)
  .then(() => console.log(' Gateway conectado a MongoDB'))
  .catch(err => console.error(' Error conectando a MongoDB:', err));

// Middlewares
app.use(cors());
app.use(express.json());

//  RUTAS DE AUTENTICACIÓN
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Proxies a microservicios
const TRAFFIC_SERVICE_URL = process.env.TRAFFIC_SERVICE_URL || 'http://microservice-node:8002';
const WEATHER_SERVICE_URL = process.env.WEATHER_SERVICE_URL || 'http://microservice-python:8000';

app.use('/api/movilidad', async (req, res) => {
  try {
    const axios = require('axios');
    const url = `${TRAFFIC_SERVICE_URL}${req.path}`;
    const response = await axios({ 
      method: req.method, 
      url, 
      data: req.body 
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.use('/api/meteorologia', async (req, res) => {
  try {
    const axios = require('axios');
    const url = `${WEATHER_SERVICE_URL}${req.path}`;
    const response = await axios({ 
      method: req.method, 
      url, 
      data: req.body 
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Swagger
const swaggerDocument = require('./swagger.json');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`🚀 Gateway corriendo en puerto ${PORT}`);
  console.log(`📚 Documentación Swagger: http://localhost:${PORT}/docs`);
});