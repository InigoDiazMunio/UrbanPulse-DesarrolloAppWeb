import React, { useEffect, useState } from 'react';
import axios from 'axios';

type Traffic = { zone: string; vehicle_count: number; average_speed: number; timestamp: string; };
type Air = { id: number; city: string; zone: string; pollutant: string; value: number; unit: string; timestamp: string; };

export default function Dashboard() {
  const [traffic, setTraffic] = useState<Traffic[]>([]);
  const [air, setAir] = useState<Air[]>([]);
  const apiBase = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:8080/api';

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const t = await axios.get(`${apiBase}/movilidad/realtime`, { headers });
        setTraffic(t.data);
      } catch (e) { console.error(e); }
      
      try {
        const a = await axios.get(`${apiBase}/meteorologia/realtime`, { headers });
        setAir(a.data);
      } catch (e) { console.error(e); }
    }
    fetchData();
    const iv = setInterval(fetchData, 20000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ color: '#fff' }}>
      <h2 style={{ marginBottom: '20px' }}>Dashboard (datos en tiempo real)</h2>
      <section style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1, background: '#132f4c', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#00e5cc', marginBottom: '15px' }}>Tráfico</h3>
          {traffic.map(t => (
            <div key={t.zone} style={{ padding: 12, borderBottom: '1px solid #2e4a6a', marginBottom: '10px' }}>
              <strong style={{ color: '#00e5cc' }}>{t.zone}</strong><br />
              Vehículos: {t.vehicle_count} — Velocidad: {t.average_speed} km/h
            </div>
          ))}
        </div>
        <div style={{ flex: 1, background: '#132f4c', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#00e5cc', marginBottom: '15px' }}>Calidad del aire</h3>
          {air.map(a => (
            <div key={a.id} style={{ padding: 12, borderBottom: '1px solid #2e4a6a', marginBottom: '10px' }}>
              <strong style={{ color: '#00e5cc' }}>{a.zone}</strong><br />
              {a.pollutant}: {a.value} {a.unit}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}