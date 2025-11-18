import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import ApiDocs from './pages/ApiDocs';
import Admin from './pages/Admin';

export default function App() {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <header style={{ padding: 12, background: '#0b5cff', color: '#fff' }}>
        <h1>UrbanPulse</h1>
        <nav>
          <Link to="/" style={{ color: '#fff', marginRight: 12 }}>Dashboard</Link>
          <Link to="/history" style={{ color: '#fff', marginRight: 12 }}>Histórico</Link>
          <Link to="/api" style={{ color: '#fff', marginRight: 12 }}>API</Link>
          <Link to="/admin" style={{ color: '#fff' }}>Admin</Link>
        </nav>
      </header>
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/api" element={<ApiDocs />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  );
}
