-- postgres-init.sql
CREATE TABLE IF NOT EXISTS air_quality (
  id SERIAL PRIMARY KEY,
  city VARCHAR(100),
  zone VARCHAR(100),
  pollutant VARCHAR(20),
  value REAL,
  unit VARCHAR(10),
  timestamp TIMESTAMP
);

INSERT INTO air_quality (city, zone, pollutant, value, unit, timestamp) VALUES
('MiCiudad', 'Centro', 'PM10', 42.5, 'µg/m3', now() - interval '1 hour'),
('MiCiudad', 'Norte', 'NO2', 28.0, 'µg/m3', now() - interval '30 minutes');
