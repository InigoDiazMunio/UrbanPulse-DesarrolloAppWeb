import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type Traffic = { 
  zone: string; 
  vehicle_count: number; 
  average_speed: number; 
  timestamp: string; 
};

type Air = { 
  id: number; 
  city: string; 
  zone: string; 
  pollutant: string; 
  value: number; 
  unit: string; 
  timestamp: string; 
};

const ZONE_COORDS: { [key: string]: [number, number] } = {
  'Centro': [43.2630, -2.9350],
  'Norte': [43.2780, -2.9350],
  'Sur': [43.2480, -2.9350]
};

export default function Dashboard() {
  const [traffic, setTraffic] = useState<Traffic[]>([]);
  const [air, setAir] = useState<Air[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('Todas');
  const [timeRange, setTimeRange] = useState('24h');
  
  const apiBase = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:8080/api';

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        setLoading(false);
        const [trafficRes, airRes] = await Promise.all([
          axios.get(`${apiBase}/movilidad/realtime`, { headers }),
          axios.get(`${apiBase}/meteorologia/realtime`, { headers })
        ]);
        
        setTraffic(trafficRes.data);
        setAir(airRes.data);
      } catch (e) {
        console.error('Error:', e);
      }
    }
    
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar datos según zona seleccionada
  const filteredTraffic = selectedZone === 'Todas' 
    ? traffic 
    : traffic.filter(t => t.zone === selectedZone);

  const filteredAir = selectedZone === 'Todas'
    ? air
    : air.filter(a => a.zone === selectedZone);

  const totalVehicles = filteredTraffic.reduce((sum, t) => sum + t.vehicle_count, 0);
  const avgPM10 = filteredAir.filter(a => a.pollutant === 'PM10')
    .reduce((sum, a, _, arr) => arr.length ? sum + a.value / arr.length : 0, 0);

  // ✅ MEJORADO: Agrupar datos por zona para el gráfico
  const getZoneData = (zoneName: string) => {
    const trafficData = traffic.find(t => t.zone === zoneName);
    const airData = air.find(a => a.zone === zoneName && a.pollutant === 'PM10');
    
    return {
      zone: zoneName,
      Vehículos: trafficData?.vehicle_count || 0,
      PM10: airData?.value || 0
    };
  };

  const chartData = selectedZone === 'Todas'
    ? ['Centro', 'Norte', 'Sur'].map(zone => getZoneData(zone))
    : [getZoneData(selectedZone)];

  const getZoneColor = (zone: string) => {
    const pm10 = air.find(a => a.zone === zone && a.pollutant === 'PM10');
    if (!pm10) return '#4caf50';
    if (pm10.value > 50) return '#f44336';
    if (pm10.value > 30) return '#ff9800';
    return '#4caf50';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ fontSize: '24px', color: '#5f6368' }}>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#e8eaed', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Layout principal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px', marginBottom: '20px' }}>
          
          {/* Mapa */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            overflow: 'hidden',
            height: '400px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <MapContainer 
              center={[43.2630, -2.9350]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap'
              />
              
              {/* ✅ Mostrar solo zonas con datos de tráfico */}
              {traffic.map((t) => {
                const coords = ZONE_COORDS[t.zone];
                if (!coords) return null;
                
                return (
                  <Circle
                    key={t.zone}
                    center={coords}
                    radius={400}
                    pathOptions={{
                      fillColor: getZoneColor(t.zone),
                      fillOpacity: 0.5,
                      color: getZoneColor(t.zone),
                      weight: 2
                    }}
                  >
                    <Popup>
                      <strong>{t.zone}</strong><br />
                      Vehículos: {t.vehicle_count}<br />
                      Velocidad: {t.average_speed} km/h
                    </Popup>
                  </Circle>
                );
              })}
              
              {/* ✅ Mostrar zonas SIN datos de tráfico en gris */}
              {['Centro', 'Norte', 'Sur']
                .filter(zoneName => !traffic.some(t => t.zone === zoneName))
                .map(zoneName => {
                  const coords = ZONE_COORDS[zoneName];
                  if (!coords) return null;
                  
                  return (
                    <Circle
                      key={zoneName}
                      center={coords}
                      radius={400}
                      pathOptions={{
                        fillColor: '#9e9e9e',
                        fillOpacity: 0.3,
                        color: '#757575',
                        weight: 2
                      }}
                    >
                      <Popup>
                        <strong>{zoneName}</strong><br />
                        Sin datos disponibles
                      </Popup>
                    </Circle>
                  );
                })}
            </MapContainer>
          </div>

          {/* Panel derecho - Métricas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Vehicle Count */}
            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#5f6368', marginBottom: '8px' }}>
                Vehicle Count
              </div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#202124' }}>
                {totalVehicles.toLocaleString()}
              </div>
            </div>

            {/* PM10 y Temperatura */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '12px', color: '#5f6368', marginBottom: '8px' }}>PM10</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#202124' }}>
                  {avgPM10 > 0 ? avgPM10.toFixed(0) : '--'}
                </div>
                <div style={{ fontSize: '12px', color: '#5f6368' }}>µg/m³</div>
              </div>

              <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '12px', color: '#5f6368', marginBottom: '8px' }}>Temperature</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#202124' }}>
                  🌡️ 18°C
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#202124' }}>
                Filters
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#5f6368', marginBottom: '8px' }}>
                  Zone
                </label>
                <select 
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #dadce0',
                    background: 'white',
                    color: '#202124',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Todas">Todas</option>
                  <option value="Centro">Centro</option>
                  <option value="Norte">Norte</option>
                  <option value="Sur">Sur</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#5f6368', marginBottom: '8px' }}>
                  Date
                </label>
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #dadce0',
                    background: 'white',
                    color: '#202124',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="24h">Últimas 24 horas</option>
                  <option value="7d">Últimos 7 días</option>
                  <option value="30d">Últimos 30 días</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico Traffic vs Pollution */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#202124', margin: 0 }}>
              Traffic vs Pollution {selectedZone !== 'Todas' && `- ${selectedZone}`}
            </h3>
            <span style={{ fontSize: '14px', color: '#5f6368' }}>Last 24 hours</span>
          </div>
          
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="zone" stroke="#5f6368" style={{ fontSize: '12px' }} />
                <YAxis stroke="#5f6368" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="Vehículos" stroke="#4285f4" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="PM10" stroke="#34a853" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: '#5f6368' }}>
              No hay datos disponibles para la zona seleccionada
            </div>
          )}
        </div>
      </div>
    </div>
  );
}