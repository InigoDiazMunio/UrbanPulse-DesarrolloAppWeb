const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/urbanpulse';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, '❌ Error de conexión a MongoDB:'));
db.once('open', () => {
  console.log('✅ Conectado a MongoDB');
});

const trafficSchema = new mongoose.Schema({
  zone: String,
  location: String,
  road: String,
  description: String,
  type: String,
  level: String,
  vehicle_count: Number,
  average_speed: Number,
  incident_count: Number,
  timestamp: { type: Date, default: Date.now }
});

const Traffic = mongoose.model('Traffic', trafficSchema);

const EUSKADI_MUNICIPALITIES = [
  // BIZKAIA
  { name: 'Bilbao', province: 'Bizkaia', vehicles: [2500, 4000], population: 345000 },
  { name: 'Barakaldo', province: 'Bizkaia', vehicles: [800, 1500], population: 100000 },
  { name: 'Getxo', province: 'Bizkaia', vehicles: [700, 1200], population: 79000 },
  { name: 'Portugalete', province: 'Bizkaia', vehicles: [400, 800], population: 46000 },
  { name: 'Santurtzi', province: 'Bizkaia', vehicles: [400, 800], population: 45000 },
  { name: 'Basauri', province: 'Bizkaia', vehicles: [350, 700], population: 40000 },
  { name: 'Leioa', province: 'Bizkaia', vehicles: [300, 600], population: 30000 },
  { name: 'Durango', province: 'Bizkaia', vehicles: [300, 600], population: 29000 },
  { name: 'Sestao', province: 'Bizkaia', vehicles: [300, 550], population: 27000 },
  
  // GIPUZKOA
  { name: 'Donostia-San Sebastián', province: 'Gipuzkoa', vehicles: [2000, 3500], population: 186000 },
  { name: 'Irun', province: 'Gipuzkoa', vehicles: [600, 1200], population: 61000 },
  { name: 'Errenteria', province: 'Gipuzkoa', vehicles: [450, 900], population: 39000 },
  { name: 'Eibar', province: 'Gipuzkoa', vehicles: [350, 700], population: 27000 },
  { name: 'Zarautz', province: 'Gipuzkoa', vehicles: [300, 600], population: 23000 },
  
  // ARABA
  { name: 'Vitoria-Gasteiz', province: 'Araba', vehicles: [2500, 4000], population: 252000 },
  { name: 'Llodio', province: 'Araba', vehicles: [250, 500], population: 18000 }
];

async function generateRealisticTraffic() {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const url = `https://api.euskadi.eus/traffic/v1.0/incidences/byDate/${year}/${month}/${day}`;
    
    console.log(`🔄 Consultando incidencias reales de Euskadi...`);
    
    const response = await axios.get(url, { timeout: 10000 });
    
    const realIncidents = response.data?.incidences || [];
    console.log(`✅ Recibidas ${realIncidents.length} incidencias REALES`);
    
    const trafficData = [];
    
    // Generar datos para TODOS los municipios
    for (const municipality of EUSKADI_MUNICIPALITIES) {
      const [minVeh, maxVeh] = municipality.vehicles;
      const baseVehicles = Math.floor(Math.random() * (maxVeh - minVeh)) + minVeh;
      
      // Buscar incidencias reales en este municipio
      const municipalityIncidents = realIncidents.filter(inc => 
        inc.municipality?.toLowerCase().includes(municipality.name.toLowerCase()) ||
        inc.road?.toLowerCase().includes(municipality.name.toLowerCase())
      );
      
      const incidentCount = municipalityIncidents.length;
      const level = incidentCount > 3 ? 'HIGH' : incidentCount > 1 ? 'MEDIUM' : 'LOW';
      
      // Ajustar vehículos según incidencias
      const vehicleAdjustment = incidentCount * 200;
      const finalVehicles = baseVehicles + vehicleAdjustment;
      
      const baseSpeed = 65;
      const speedReduction = incidentCount * 8;
      const averageSpeed = Math.max(25, baseSpeed - speedReduction);
      
      const description = incidentCount > 0 
        ? municipalityIncidents[0].cause || 'Incidencia de tráfico'
        : 'Tráfico fluido';
      
      trafficData.push({
        zone: municipality.name,
        location: `${municipality.name} - Centro`,
        road: 'Zona Urbana',
        description: description,
        type: incidentCount > 0 ? 'INCIDENT' : 'NORMAL',
        level: level,
        vehicle_count: finalVehicles,
        average_speed: averageSpeed,
        incident_count: incidentCount,
        timestamp: new Date()
      });
      
      console.log(`✅ [${municipality.province}] ${municipality.name}: ${finalVehicles} vehículos, ${incidentCount} incidencias`);
    }
    
    return trafficData;
    
  } catch (error) {
    console.error('❌ Error obteniendo datos:', error.message);
    
    // Fallback con datos realistas
    console.log('⚠️ Usando datos estimados');
    return EUSKADI_MUNICIPALITIES.map(municipality => {
      const [minVeh, maxVeh] = municipality.vehicles;
      const vehicles = Math.floor(Math.random() * (maxVeh - minVeh)) + minVeh;
      
      return {
        zone: municipality.name,
        location: `${municipality.name} - Centro`,
        road: 'Zona Urbana',
        description: 'Tráfico fluido',
        type: 'NORMAL',
        level: 'LOW',
        vehicle_count: vehicles,
        average_speed: Math.floor(Math.random() * 20) + 50,
        incident_count: 0,
        timestamp: new Date()
      };
    });
  }
}

async function saveTrafficData() {
  console.log('\n🔄 Actualizando datos de tráfico...');
  
  const trafficData = await generateRealisticTraffic();
  
  if (trafficData.length === 0) {
    console.log('⚠️ No se pudieron obtener datos');
    return;
  }
  
  try {
    for (const data of trafficData) {
      const traffic = new Traffic(data);
      await traffic.save();
    }
    
    const totalVehicles = trafficData.reduce((sum, t) => sum + t.vehicle_count, 0);
    console.log(`✅ Guardados ${trafficData.length} registros`);
    console.log(`📊 TOTAL VEHÍCULOS EN EUSKADI: ${totalVehicles.toLocaleString()}`);
    console.log('─'.repeat(80));
  } catch (error) {
    console.error('❌ Error guardando:', error);
  }
}

const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_SECONDS || '600') * 1000;
setInterval(saveTrafficData, POLL_INTERVAL);
saveTrafficData();

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    source: 'Open Data Euskadi + Datos realistas',
    coverage: 'TODO Euskadi (16 municipios)'
  });
});

app.get('/realtime', async (req, res) => {
  try {
    const pipeline = [
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$zone",
          zone: { $first: "$zone" },
          location: { $first: "$location" },
          road: { $first: "$road" },
          description: { $first: "$description" },
          type: { $first: "$type" },
          level: { $first: "$level" },
          vehicle_count: { $first: "$vehicle_count" },
          average_speed: { $first: "$average_speed" },
          incident_count: { $first: "$incident_count" },
          timestamp: { $first: "$timestamp" }
        }
      },
      { $sort: { zone: 1 } }
    ];
    
    const data = await Traffic.aggregate(pipeline);
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/zones', async (req, res) => {
  try {
    const zones = await Traffic.distinct('zone');
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Microservicio de tráfico en puerto ${PORT}`);
});