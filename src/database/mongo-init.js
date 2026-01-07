// Conectar a la base de datos
db = db.getSiblingDB('urbanpulse_db');

// Crear colección solo si no existe
if (!db.getCollectionNames().includes('traffic')) {
  db.createCollection('traffic');
  print('✅ Collection "traffic" created');
} else {
  print('ℹ️  Collection "traffic" already exists');
}

if (db.traffic.countDocuments() === 0) {
  db.traffic.insertMany([
    {
      zone: 'Centro',
      vehicle_count: 450,
      average_speed: 25.5,
      timestamp: new Date()
    },
    {
      zone: 'Norte',
      vehicle_count: 680,
      average_speed: 32.0,
      timestamp: new Date()
    }
  ]);
  print('✅ Sample data inserted');
} else {
  print('ℹ️  Collection already has data');
}