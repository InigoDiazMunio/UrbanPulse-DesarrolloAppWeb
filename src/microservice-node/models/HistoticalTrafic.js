const mongoose = require('mongoose');

const historicalTrafficSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true, index: true },
  zone: { type: String, required: true },
  province: { type: String, required: true },
  vehicle_count: { type: Number, required: true },
  incident_count: { type: Number, required: true },
  average_speed: { type: Number, required: true }
}, {
  timestamps: false
});

// Índice compuesto para búsquedas eficientes
historicalTrafficSchema.index({ timestamp: 1, zone: 1 });

// TTL index: borrar automáticamente registros mayores a 30 días
historicalTrafficSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 }); // 30 días

module.exports = mongoose.model('HistoricalTraffic', historicalTrafficSchema);