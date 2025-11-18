import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
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
          <div style={{ fontFamily: 'sans-serif', background: '#e8eaed', minHeight: '100vh' }}>
            <header style={{ 
              padding: '16px 40px', 
              background: '#434b53',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: '500',
                  color: '#fff',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                   UrbanPulse
                </h1>
                <nav style={{ display: 'flex', gap: '24px' }}>
                  <Link 
                    to="/" 
                    style={{ 
                      color: location.pathname === '/' ? '#fff' : '#b0b8c1',
                      textDecoration: 'none', 
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'color 0.3s'
                    }}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/history" 
                    style={{ 
                      color: location.pathname === '/history' ? '#fff' : '#b0b8c1',
                      textDecoration: 'none', 
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'color 0.3s'
                    }}
                  >
                    Historico
                  </Link>
                  <Link 
                    to="/api" 
                    style={{ 
                      color: location.pathname === '/api' ? '#fff' : '#b0b8c1',
                      textDecoration: 'none', 
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'color 0.3s'
                    }}
                  >
                    API
                  </Link>
                  <Link 
                    to="/admin" 
                    style={{ 
                      color: location.pathname === '/admin' ? '#fff' : '#b0b8c1',
                      textDecoration: 'none', 
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'color 0.3s'
                    }}
                  >
                    Login
                  </Link>
                </nav>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {user && (
                  <span style={{ color: '#b0b8c1', fontSize: '14px' }}>
                    👤 {user.username}
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 16px',
                    background: '#5f6368',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#4a4f54'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#5f6368'}
                >
                  Logout
                </button>
              </div>
            </header>
            <main>
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