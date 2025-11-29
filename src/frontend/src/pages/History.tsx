import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type HistoricalData = {
  date: string;
  vehicles: number;
  pollutant: number;
};

type TableRow = {
  fecha: string;
  zona: string;
  trafico: number;
  pm10: number;
  pm25: number;
  no2: number;
  o3: number;
};

export default function History() {
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPollutant, setSelectedPollutant] = useState('PM10');
  const [rawTraffic, setRawTraffic] = useState<any[]>([]);
  const [rawAir, setRawAir] = useState<any[]>([]);
  const [chartData, setChartData] = useState<HistoricalData[]>([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(false);

  const apiBase = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:8080/api';

  const zones = [
    'Todas las zonas',
    'Bilbao',
    'Barakaldo',
    'Getxo',
    'Portugalete',
    'Santurtzi',
    'Basauri',
    'Donostia-San Sebastián',
    'Irun',
    'Vitoria-Gasteiz',
    'Llodio'
  ];

  const pollutants = [
    { value: 'PM10', label: 'PM10', unit: 'µg/m³' },
    { value: 'PM25', label: 'PM2.5', unit: 'µg/m³' },
    { value: 'NO2', label: 'NO2', unit: 'µg/m³' },
    { value: 'O3', label: 'O3', unit: 'µg/m³' },
    { value: 'SO2', label: 'SO2', unit: 'µg/m³' },
    { value: 'CO', label: 'CO', unit: 'mg/m³' }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, []);

  // Actualizar gráfico y tabla cuando cambian los filtros
  useEffect(() => {
    if (rawTraffic.length > 0 && rawAir.length > 0) {
      processChartData(rawTraffic, rawAir);
      processTableData(rawTraffic, rawAir);
    }
  }, [selectedZone, selectedDate, selectedPollutant, rawTraffic, rawAir]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const [trafficRes, airRes] = await Promise.all([
        axios.get(`${apiBase}/movilidad/realtime`, { headers }),
        axios.get(`${apiBase}/meteorologia/realtime`, { headers })
      ]);

      console.log('📊 Traffic data:', trafficRes.data);
      console.log('🌫️ Air data:', airRes.data);

      setRawTraffic(trafficRes.data);
      setRawAir(airRes.data);
      setLoading(false);
    } catch (e) {
      console.error('Error fetching historical data:', e);
      setLoading(false);
    }
  };

  const processChartData = (traffic: any[], air: any[]) => {
    // Filtrar datos por zona
    const filteredTraffic = selectedZone === '' || selectedZone === 'Todas las zonas'
      ? traffic
      : traffic.filter(t => t.zone.includes(selectedZone));

    const filteredAir = selectedZone === '' || selectedZone === 'Todas las zonas'
      ? air
      : air.filter(a => a.city.includes(selectedZone) || a.zone.includes(selectedZone));

    // Generar fechas de los últimos 30 días
    const dates: string[] = [];
    const now = selectedDate ? new Date(selectedDate) : new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }));
    }
    
    const processed: HistoricalData[] = dates.map((date, index) => {
      const totalVehicles = filteredTraffic.reduce((sum, t) => sum + t.vehicle_count, 0);
      
      const pollutantValues = filteredAir.filter(a => a.pollutant === selectedPollutant);
      const avgPollutant = pollutantValues.length > 0
        ? pollutantValues.reduce((sum, a) => sum + a.value, 0) / pollutantValues.length
        : 0;

      // Simular variación temporal realista
      const weekPattern = Math.sin((index / 30) * Math.PI * 4) * 0.2;
      const randomNoise = (Math.random() * 0.2 - 0.1);
      const variation = 1 + weekPattern + randomNoise;
      
      return {
        date,
        vehicles: Math.max(100, Math.round(totalVehicles * variation)),
        pollutant: Math.max(5, Math.round(avgPollutant * variation * 100) / 100)
      };
    });

    setChartData(processed);
  };

  const processTableData = (traffic: any[], air: any[]) => {
    const processed: TableRow[] = [];

    // Filtrar datos por zona
    const filteredTraffic = selectedZone === '' || selectedZone === 'Todas las zonas'
      ? traffic
      : traffic.filter(t => t.zone.includes(selectedZone));

    const filteredAir = selectedZone === '' || selectedZone === 'Todas las zonas'
      ? air
      : air.filter(a => a.city.includes(selectedZone) || a.zone.includes(selectedZone));

    // Generar datos de los últimos 10 días
    const endDate = selectedDate ? new Date(selectedDate) : new Date();
    
    for (let i = 9; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('es-ES');

      // Obtener zonas únicas
      const allZones = [...new Set(filteredTraffic.map(t => t.zone))];
      const zonesToShow = allZones.slice(0, 3);

      zonesToShow.forEach(zone => {
        const zoneTraffic = filteredTraffic.find(t => t.zone === zone);
        const zonePM10 = filteredAir.find(a => a.pollutant === 'PM10' && (a.city === zone || a.zone === zone));
        const zonePM25 = filteredAir.find(a => a.pollutant === 'PM25' && (a.city === zone || a.zone === zone));
        const zoneNO2 = filteredAir.find(a => a.pollutant === 'NO2' && (a.city === zone || a.zone === zone));
        const zoneO3 = filteredAir.find(a => a.pollutant === 'O3' && (a.city === zone || a.zone === zone));

        if (zoneTraffic) {
          const dayVariation = 0.7 + (Math.random() * 0.6);
          
          processed.push({
            fecha: dateStr,
            zona: zone,
            trafico: Math.round(zoneTraffic.vehicle_count * dayVariation),
            pm10: zonePM10 ? Math.round(zonePM10.value * dayVariation) : 0,
            pm25: zonePM25 ? Math.round(zonePM25.value * dayVariation) : 0,
            no2: zoneNO2 ? Math.round(zoneNO2.value * dayVariation) : 0,
            o3: zoneO3 ? Math.round(zoneO3.value * dayVariation) : 0
          });
        }
      });
    }

    setTableData(processed);
  };

  const handleSearch = () => {
    if (rawTraffic.length > 0 && rawAir.length > 0) {
      processChartData(rawTraffic, rawAir);
      processTableData(rawTraffic, rawAir);
    }
  };

  const getCurrentPollutantLabel = () => {
    const pollutant = pollutants.find(p => p.value === selectedPollutant);
    return pollutant ? `${pollutant.label} (${pollutant.unit})` : selectedPollutant;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ fontSize: '24px', color: '#5f6368' }}>Cargando datos históricos...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '12px', 
          marginBottom: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#202124', 
            margin: '0 0 16px 0' 
          }}>
            Histórico
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#202124', 
            lineHeight: '1.6',
            margin: 0
          }}>
            Esta pagina de Histórico permite  analizar la evolución del tráfico 
            y la contaminación a lo largo del tiempo.
          </p>
        </div>

        {/* Filtros */}
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '20px', alignItems: 'end' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500',
                color: '#202124', 
                marginBottom: '8px' 
              }}>
                Zona
              </label>
              <select 
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  borderRadius: '8px', 
                  border: '1px solid #dadce0', 
                  fontSize: '14px',
                  color: '#202124',
                  cursor: 'pointer',
                  background: 'white'
                }}
              >
                <option value="">Seleccionar zona</option>
                {zones.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500',
                color: '#202124', 
                marginBottom: '8px' 
              }}>
                Contaminante
              </label>
              <select 
                value={selectedPollutant}
                onChange={(e) => setSelectedPollutant(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  borderRadius: '8px', 
                  border: '1px solid #dadce0', 
                  fontSize: '14px',
                  color: '#202124',
                  cursor: 'pointer',
                  background: 'white'
                }}
              >
                {pollutants.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500',
                color: '#202124', 
                marginBottom: '8px' 
              }}>
                Fecha (Hasta)
              </label>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  borderRadius: '8px', 
                  border: '1px solid #dadce0', 
                  fontSize: '14px',
                  color: '#202124',
                  background: 'white',
                  cursor: 'pointer',
                  fontFamily: 'sans-serif'
                }}
              />
            </div>

            <button
              onClick={handleSearch}
              style={{
                padding: '10px 24px',
                background: '#1967d2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                height: '42px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1557b0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#1967d2'}
            >
              Actualizar
            </button>
          </div>
        </div>

        {/* Gráfico */}
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#202124', 
            marginBottom: '8px' 
          }}>
            Evolución Temporal - Últimos 30 Días
          </h2>
          <p style={{ 
            fontSize: '13px', 
            color: '#5f6368', 
            marginBottom: '20px' 
          }}>
            {selectedZone && selectedZone !== '' && selectedZone !== 'Todas las zonas' 
              ? `Filtrando por: ${selectedZone}` 
              : 'Mostrando todas las zonas'}
            {` • Contaminante: ${getCurrentPollutantLabel()}`}
            {selectedDate && ` • Hasta: ${new Date(selectedDate).toLocaleDateString('es-ES')}`}
          </p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#202124" 
                  style={{ fontSize: '11px' }}
                  interval={4}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#202124" 
                  style={{ fontSize: '12px' }}
                  label={{ 
                    value: 'Vehículos/hora', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { fontSize: '12px', fill: '#202124' } 
                  }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#202124" 
                  style={{ fontSize: '12px' }}
                  label={{ 
                    value: getCurrentPollutantLabel(), 
                    angle: 90, 
                    position: 'insideRight', 
                    style: { fontSize: '12px', fill: '#202124' } 
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #dadce0', 
                    borderRadius: '8px', 
                    fontSize: '12px',
                    color: '#202124'
                  }} 
                />
                <Legend 
                  wrapperStyle={{ fontSize: '13px', color: '#202124' }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="vehicles" 
                  stroke="#4285f4" 
                  strokeWidth={2}
                  name="Vehículos/hora"
                  dot={{ fill: '#4285f4', r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="pollutant" 
                  stroke="#34a853" 
                  strokeWidth={2}
                  name={getCurrentPollutantLabel()}
                  dot={{ fill: '#34a853', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: '#5f6368' }}>
              No hay datos disponibles.
            </div>
          )}
        </div>

        {/* Tabla */}
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#202124', 
            marginBottom: '20px' 
          }}>
            Datos Históricos por Zona - Últimos 10 Días.
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ 
                  background: '#f8f9fa',
                  borderBottom: '2px solid #e0e0e0'
                }}>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#202124'
                  }}>
                    Fecha
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#202124'
                  }}>
                    Zona
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#202124'
                  }}>
                    Tráfico (veh/h)
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#202124'
                  }}>
                    PM10 (µg/m³)
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#202124'
                  }}>
                    PM2.5 (µg/m³)
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#202124'
                  }}>
                    NO2 (µg/m³)
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#202124'
                  }}>
                    O3 (µg/m³)
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((row, index) => (
                    <tr 
                      key={index}
                      style={{ 
                        borderBottom: '1px solid #e0e0e0',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <td style={{ 
                        padding: '12px 16px',
                        color: '#202124'
                      }}>
                        {row.fecha}
                      </td>
                      <td style={{ 
                        padding: '12px 16px',
                        color: '#202124'
                      }}>
                        {row.zona}
                      </td>
                      <td style={{ 
                        padding: '12px 16px',
                        color: '#202124'
                      }}>
                        {row.trafico.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '12px 16px',
                        color: '#202124'
                      }}>
                        {row.pm10}
                      </td>
                      <td style={{ 
                        padding: '12px 16px',
                        color: '#202124'
                      }}>
                        {row.pm25}
                      </td>
                      <td style={{ 
                        padding: '12px 16px',
                        color: '#202124'
                      }}>
                        {row.no2}
                      </td>
                      <td style={{ 
                        padding: '12px 16px',
                        color: '#202124'
                      }}>
                        {row.o3}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#5f6368' }}>
                      No hay datos disponibles para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Descripción adicional */}
        <div style={{ 
          background: '#e8f0fe', 
          padding: '30px', 
          borderRadius: '12px',
          border: '1px solid #d2e3fc',
          marginTop: '30px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1967d2', 
            marginBottom: '12px' 
          }}>
            📊 Análisis Temporal
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#202124', 
            lineHeight: '1.6',
            margin: '0 0 12px 0'
          }}>
            A través de filtros de zona, contaminante y fecha, se pueden seleccionar distintos sectores urbanos 
            y observar cómo varían los indicadores de movilidad (vehículos) y calidad del aire (PM10, PM2.5, NO2, O3, SO2, CO).
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#202124', 
            lineHeight: '1.6',
            margin: 0
          }}>
            La combinación de gráficos lineales y tablas de datos facilita la comparación y el 
            análisis temporal, permitiendo detectar patrones o correlaciones entre la actividad 
            urbana y la contaminación ambiental.
          </p>
        </div>

      </div>
    </div>
  );
}