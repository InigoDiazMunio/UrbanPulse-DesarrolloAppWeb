import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import ApiDocs from './pages/ApiDocs';
import Admin from './pages/Admin';
import Login from './pages/Login';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/*" element={
        <ProtectedRoute>
          <div style={{ fontFamily: 'sans-serif', background: '#0a1929', minHeight: '100vh' }}>
            <header style={{ 
              padding: '20px 40px', 
              background: 'linear-gradient(135deg, #0a1929 0%, #1a2942 100%)',
              borderBottom: '2px solid #00e5cc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(90deg, #00e5cc, #00a896)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>UrbanPulse</h1>
                <nav style={{ marginTop: '15px', display: 'flex', gap: '30px' }}>
                  <Link to="/" style={{ color: '#00e5cc', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
                  <Link to="/history" style={{ color: '#00e5cc', textDecoration: 'none', fontWeight: '500' }}>Histórico</Link>
                  <Link to="/api" style={{ color: '#00e5cc', textDecoration: 'none', fontWeight: '500' }}>API</Link>
                  <Link to="/admin" style={{ color: '#00e5cc', textDecoration: 'none', fontWeight: '500' }}>Admin</Link>
                </nav>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {user && (
                  <span style={{ color: '#b2bac2' }}>
                    👤 {user.username} ({user.role})
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '10px 20px',
                    background: '#d32f2f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Cerrar Sesión
                </button>
              </div>
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
        </ProtectedRoute>
      } />
    </Routes>
  );
}