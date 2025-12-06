import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import API from './pages/API';
import Admin from './pages/Admin';
import Login from './pages/Login';

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setUser(null);
    setRole('');
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/" 
        element={<Navigate to="/login" replace />}
      />
      
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
                    to="/dashboard" 
                    style={{ 
                      color: location.pathname === '/dashboard' ? '#fff' : '#b0b8c1',
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
                    Histórico
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
                  
                  {role === 'admin' && (
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
                      Admin
                    </Link>
                  )}
                </nav>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {user && (
                  <span style={{ color: '#b0b8c1', fontSize: '14px' }}>
                    👤 {user.username}
                    {role === 'admin' && <span style={{ marginLeft: '8px', color: '#fbbf24' }}>👑</span>}
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
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/history" element={<History />} />
                <Route path="/api" element={<API />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <Admin />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
}