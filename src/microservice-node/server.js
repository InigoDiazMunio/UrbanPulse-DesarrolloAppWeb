require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const PORT = process.env.PORT || 8002;
const MONGO_URL = process.env.MONGO_URI || 'mongodb://mongo:27017/urbanpulse';
const POLL_INTERVAL = (process.env.POLL_INTERVAL_SECONDS || 30) * 1000;

const app = express();
app.use(cors());
app.use(express.json());

// Mongoose schema/model
const trafficSchema = new mongoose.Schema({
  zone: String,
  vehicle_count: Number,
  average_speed: Number,
  timestamp: { type: Date, default: Date.now }
});
const Traffic = mongoose.model('Traffic', trafficSchema);

// ✅ FUNCIÓN DE CONEXIÓN CON RETRY
async function connectDB(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGO_URL, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ Traffic service: connected to Mongo');
      return true;
    } catch (err) {
      console.log(`⚠️  MongoDB connection attempt ${i + 1}/${retries} failed`);
      if (i === retries - 1) {
        console.error('❌ Could not connect to MongoDB after all retries:', err.message);
        process.exit(1);
      }
      console.log(`⏳ Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Ingest mock external data periodically
async function pollExternalTraffic() {
  try {
    // Verificar que esté conectado
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  Skipping poll - MongoDB not connected');
      return;
    }

    // Aquí podrías llamar a APIs municipales reales. Simulamos datos.
    const sample = {
      zone: Math.random() > 0.5 ? 'Centro' : 'Norte',
      vehicle_count: Math.floor(200 + Math.random() * 1200),
      average_speed: Math.round((20 + Math.random() * 40) * 10) / 10,
      timestamp: new Date()
    };
    const doc = new Traffic(sample);
    await doc.save();
    console.log('✅ Inserted traffic sample:', sample.zone, sample.vehicle_count);
  } catch (err) {
    console.error('❌ Error polling external traffic:', err.message);
  }
}

// Routes
app.get('/realtime', async (req, res) => {
  try {
    // latest per zone
    const zones = await Traffic.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$zone",
          doc: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$doc" } }
    ]);
    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: 'failed to get realtime' });
  }
});

app.get('/history', async (req, res) => {
  try {
    const { zone, limit } = req.query;
    const q = zone ? { zone } : {};
    const docs = await Traffic.find(q).sort({ timestamp: -1 }).limit(parseInt(limit) || 100);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'failed to get history' });
  }
});

app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    service: 'traffic', 
    version: '1.0',
    database: dbStatus,
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({ service: 'traffic', version: '1.0' });
});

// ✅ INICIALIZACIÓN
async function startServer() {
  // Primero conectar a la DB
  await connectDB();
  
  // Luego iniciar el polling
  setInterval(pollExternalTraffic, POLL_INTERVAL);
  pollExternalTraffic();
  
  // Finalmente arrancar el servidor
  app.listen(PORT, () => {
    console.log(`🚀 Traffic microservice running on port ${PORT}`);
  });
}

// Manejo de errores de desconexión
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

// Iniciar
startServer();