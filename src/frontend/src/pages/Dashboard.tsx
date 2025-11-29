import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type Traffic = { 
  zone: string;
  location: string;
  road: string;
  description: string;
  type: string;
  level: string;
  vehicle_count: number; 
  average_speed: number;
  incident_count: number;
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

const MUNICIPALITY_COORDS: { [key: string]: [number, number] } = {
  'Bilbao': [43.2630, -2.9350],
  'Barakaldo': [43.2972, -2.9886],
  'Getxo': [43.3498, -3.0083],
  'Portugalete': [43.3214, -3.0217],
  'Santurtzi': [43.3297, -3.0331],
  'Basauri': [43.2328, -2.8864],
  'Durango': [43.1706, -2.6322],
  'Leioa': [43.3289, -2.9842],
  'Sestao': [43.3100, -3.0100],
  'Donostia-San Sebastián': [43.3183, -1.9812],
  'Irun': [43.3389, -1.7894],
  'Eibar': [43.1844, -2.4711],
  'Errenteria': [43.3117, -1.9019],
  'Zarautz': [43.2831, -2.1689],
  'Vitoria-Gasteiz': [42.8467, -2.6716],
  'Llodio': [43.1533, -2.9597]
};

const MUNICIPALITY_TO_PROVINCE: { [key: string]: string } = {
  'Bilbao': 'Bizkaia',
  'Barakaldo': 'Bizkaia',
  'Getxo': 'Bizkaia',
  'Portugalete': 'Bizkaia',
  'Santurtzi': 'Bizkaia',
  'Basauri': 'Bizkaia',
  'Durango': 'Bizkaia',
  'Leioa': 'Bizkaia',
  'Sestao': 'Bizkaia',
  'Donostia-San Sebastián': 'Gipuzkoa',
  'Irun': 'Gipuzkoa',
  'Eibar': 'Gipuzkoa',
  'Errenteria': 'Gipuzkoa',
  'Zarautz': 'Gipuzkoa',
  'Vitoria-Gasteiz': 'Araba',
  'Llodio': 'Araba'
};

function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 9);
  }, [center, map]);
  return null;
}

export default function Dashboard() {
  const [traffic, setTraffic] = useState<Traffic[]>([]);
  const [air, setAir] = useState<Air[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState('Todas');
  const [selectedPollutant, setSelectedPollutant] = useState('PM10');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const apiBase = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:8080/api';

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const [trafficRes, airRes] = await Promise.all([
          axios.get(`${apiBase}/movilidad/realtime`, { headers }),
          axios.get(`${apiBase}/meteorologia/realtime`, { headers })
        ]);
        
        console.log('📊 Traffic:', trafficRes.data.length, 'zones');
        console.log('🌫️ Air:', airRes.data.length, 'measurements');
        
        setTraffic(trafficRes.data);
        setAir(airRes.data);
        setLastUpdate(new Date());
        setLoading(false);
      } catch (e) {
        console.error('Error:', e);
        setLoading(false);
      }
    }
    
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [apiBase]);

  const getProvince = (municipality: string): string => {
    if (!municipality) return 'Otras';
    const lowerMunicipality = municipality.toLowerCase();
    for (const [muni, province] of Object.entries(MUNICIPALITY_TO_PROVINCE)) {
      if (lowerMunicipality.includes(muni.toLowerCase()) || 
          muni.toLowerCase().includes(lowerMunicipality)) {
        return province;
      }
    }
    return 'Otras';
  };

  const filteredTraffic = selectedProvince === 'Todas' 
    ? traffic 
    : traffic.filter(t => getProvince(t.zone) === selectedProvince);

  const filteredAir = selectedProvince === 'Todas'
    ? air
    : air.filter(a => {
        const cityProvince = getProvince(a.city || '');
        const zoneProvince = getProvince(a.zone || '');
        return cityProvince === selectedProvince || zoneProvince === selectedProvince;
      });

  const totalVehicles = filteredTraffic.reduce((sum, t) => sum + t.vehicle_count, 0);
  const totalIncidents = filteredTraffic.reduce((sum, t) => sum + t.incident_count, 0);
  
  const pollutantData = filteredAir.filter(a => a.pollutant === selectedPollutant);
  const avgPollutant = pollutantData.length > 0
    ? pollutantData.reduce((sum, a) => sum + a.value, 0) / pollutantData.length
    : 0;

  const provinceStats: { [key: string]: { vehicles: number; pm10Values: number[]; incidents: number } } = {
    'Bizkaia': { vehicles: 0, pm10Values: [], incidents: 0 },
    'Gipuzkoa': { vehicles: 0, pm10Values: [], incidents: 0 },
    'Araba': { vehicles: 0, pm10Values: [], incidents: 0 }
  };
  
  filteredTraffic.forEach(t => {
    const province = getProvince(t.zone);
    if (provinceStats[province]) {
      provinceStats[province].vehicles += t.vehicle_count;
      provinceStats[province].incidents += t.incident_count;
    }
  });
  
  filteredAir.filter(a => a.pollutant === 'PM10').forEach(a => {
    const province = getProvince(a.city || a.zone);
    if (provinceStats[province]) {
      provinceStats[province].pm10Values.push(a.value);
    }
  });

  const chartData = Object.keys(provinceStats)
    .map(province => ({
      province: province,
      Vehículos: Math.round(provinceStats[province].vehicles / 100),
      'PM10': provinceStats[province].pm10Values.length > 0
        ? Math.round(provinceStats[province].pm10Values.reduce((a, b) => a + b, 0) / provinceStats[province].pm10Values.length)
        : 0,
      // Seguimos calculando incidencias por si acaso, pero no las usaremos en el gráfico
      Incidencias: Math.max(provinceStats[province].incidents, 0.1)
    }))
    .filter(d => d.Vehículos > 0 || d.PM10 > 0);

  const getColorByPM10 = (pm10Value: number): string => {
    if (pm10Value > 50) return '#e53935';
    if (pm10Value > 30) return '#fb8c00';
    if (pm10Value > 15) return '#fdd835';
    return '#43a047';
  };

  const getStationCoords = (zoneName: string): [number, number] | null => {
    if (!zoneName) return null;
    if (MUNICIPALITY_COORDS[zoneName]) return MUNICIPALITY_COORDS[zoneName];
    const match = zoneName.match(/^([^(]+)/);
    if (match) {
      const cityName = match[1].trim();
      if (MUNICIPALITY_COORDS[cityName]) return MUNICIPALITY_COORDS[cityName];
    }
    for (const [municipality, coords] of Object.entries(MUNICIPALITY_COORDS)) {
      if (zoneName.toLowerCase().includes(municipality.toLowerCase())) {
        return coords;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ fontSize: '24px', color: '#5f6368' }}>Cargando...</div>
      </div>
    );
  }

  const uniqueStations = [...new Set(air.map(a => a.zone))].filter(z => z && z.length > 0);

  return (
    <div style={{ background: '#e8eaed', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        
        <div style={{
          background: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '13px', color: '#202124' }}>
             Tráfico: Open Data Euskadi •  Calidad del Aire: Gobierno Vasco
          </span>
          <span style={{ fontSize: '12px', color: '#5f6368' }}>
            Actualiza cada 5 minutos• Última: {lastUpdate.toLocaleTimeString('es-ES')}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px', marginBottom: '20px' }}>
          
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            overflow: 'hidden',
            height: '500px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            {/* CAMBIO 2: Eliminada la cajetilla pequeña del contador de estaciones que estaba aquí */}

            {/* LEYENDA MÁS VISIBLE */}
            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '10px',
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              zIndex: 1000,
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              fontSize: '12px',
              border: '2px solid #333'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '13px', color: '#202124' }}>
                {selectedPollutant} (µg/m³)
              </div>
              {/* CAMBIO 1: Añadido color: '#202124' a los textos para que se vean bien */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#43a047', border: '2px solid white', boxShadow: '0 0 0 1px #333' }} />
                <span style={{ fontWeight: '500', color: '#202124' }}>0-15: Bueno</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fdd835', border: '2px solid white', boxShadow: '0 0 0 1px #333' }} />
                <span style={{ fontWeight: '500', color: '#202124' }}>15-30: Aceptable</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fb8c00', border: '2px solid white', boxShadow: '0 0 0 1px #333' }} />
                <span style={{ fontWeight: '500', color: '#202124' }}>30-50: Moderado</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#e53935', border: '2px solid white', boxShadow: '0 0 0 1px #333' }} />
                <span style={{ fontWeight: '500', color: '#202124' }}>&gt;50: Malo</span>
              </div>
            </div>

            <MapContainer 
              center={[43.0, -2.5]} 
              zoom={9} 
              style={{ height: '100%', width: '100%' }}
            >
              <MapCenter center={[43.0, -2.5]} />
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              
              {uniqueStations.map((zoneName) => {
                const coords = getStationCoords(zoneName);
                if (!coords) return null;
                
                const zoneAir = air.filter(a => a.zone === zoneName);
                const city = zoneAir[0]?.city || '';
                const pollutantDataPoint = zoneAir.find(a => a.pollutant === selectedPollutant);
                
                return (
                  <CircleMarker
                    key={zoneName}
                    center={coords}
                    radius={12}
                    pathOptions={{
                      fillColor: pollutantDataPoint ? getColorByPM10(pollutantDataPoint.value) : '#9e9e9e',
                      fillOpacity: 0.9,
                      color: '#fff',
                      weight: 3
                    }}
                  >
                    <Popup>
                      <div style={{ minWidth: '180px' }}>
                        <strong style={{ fontSize: '13px' }}>{zoneName}</strong>
                        <div style={{ fontSize: '11px', color: '#5f6368', marginTop: '2px' }}>{city}</div>
                        <hr style={{ margin: '6px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
                        {pollutantDataPoint && (
                          <div style={{ fontSize: '12px' }}>
                            <strong>{selectedPollutant}:</strong> {pollutantDataPoint.value.toFixed(1)} {pollutantDataPoint.unit}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#5f6368', marginBottom: '8px' }}>Vehicle Count</div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#202124' }}>{totalVehicles.toLocaleString()}</div>
              <div style={{ fontSize: '11px', color: '#5f6368', marginTop: '4px' }}>
                 vehículos/hora • Open Data Euskadi
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '12px', color: '#5f6368', marginBottom: '8px' }}>{selectedPollutant}</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#202124' }}>
                  {avgPollutant > 0 ? avgPollutant.toFixed(0) : '--'}
                </div>
                <div style={{ fontSize: '12px', color: '#5f6368' }}>µg/m³</div>
              </div>

              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '12px', color: '#5f6368', marginBottom: '8px' }}>Incidencias</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: totalIncidents > 0 ? '#ff9800' : '#4caf50' }}>
                  {totalIncidents}
                </div>
              </div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>Filters</div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#5f6368', marginBottom: '8px' }}>Provincia</label>
                <select 
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #dadce0', fontSize: '14px', cursor: 'pointer' }}
                >
                  <option value="Todas">Todas las provincias</option>
                  <option value="Bizkaia"> Bizkaia</option>
                  <option value="Gipuzkoa"> Gipuzkoa</option>
                  <option value="Araba"> Araba</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#5f6368', marginBottom: '8px' }}>Contaminante</label>
                <select 
                  value={selectedPollutant}
                  onChange={(e) => setSelectedPollutant(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #dadce0', fontSize: '14px', cursor: 'pointer' }}
                >
                  <option value="PM10">PM10</option>
                  <option value="PM25">PM2.5</option>
                  <option value="NO2">NO2</option>
                  <option value="O3">O3</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 4px 0' }}>Traffic vs Pollution - Por Provincias</h3>
          {/* CAMBIO 3: Actualizado el subtítulo y eliminada la barra de Incidencias */}
          <p style={{ fontSize: '12px', color: '#5f6368', margin: '0 0 20px 0' }}>Vehículos (÷100) y PM10</p>
          
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="province" stroke="#5f6368" style={{ fontSize: '13px' }} />
                <YAxis stroke="#5f6368" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #dadce0', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="Vehículos" fill="#4285f4" name="Vehículos (÷100)" />
                <Bar dataKey="PM10" fill="#34a853" name="PM10 µg/m³" />
                {/* La barra de incidencias ha sido eliminada aquí */}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: '#5f6368' }}>No hay datos</div>
          )}
        </div>
      </div>
    </div>
  );
}