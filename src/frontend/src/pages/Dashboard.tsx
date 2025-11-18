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
      try {
        const t = await axios.get(`${apiBase}/movilidad/realtime`);
        setTraffic(t.data);
      } catch (e) { console.error(e); }
      try {
        const a = await axios.get(`${apiBase}/meteorologia/realtime`);
        setAir(a.data);
      } catch (e) { console.error(e); }
    }
    fetchData();
    const iv = setInterval(fetchData, 20000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div>
      <h2>Dashboard (datos en tiempo real)</h2>
      <section style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h3>Tráfico</h3>
          {traffic.map(t => (
            <div key={t.zone} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
              <strong>{t.zone}</strong> — Vehículos: {t.vehicle_count} — Velocidad media: {t.average_speed} km/h
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <h3>Calidad del aire</h3>
          {air.map(a => (
            <div key={a.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
              <strong>{a.zone}</strong> — {a.pollutant}: {a.value} {a.unit}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
