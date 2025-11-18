import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apiBase = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:8080/api';
  const authBase = apiBase.replace('/api', '');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${authBase}/auth/login`, {
        username,
        password
      });

      if (response.data.success) {
        // Guardar token en localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirigir al dashboard
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a1929 0%, #1a2942 100%)'
    }}>
      <div style={{
        background: '#132f4c',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,229,204,0.2)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          background: 'linear-gradient(90deg, #00e5cc, #00a896)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          UrbanPulse
        </h1>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#b2bac2' }}>
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #2e4a6a',
                background: '#0a1929',
                color: '#fff',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#b2bac2' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #2e4a6a',
                background: '#0a1929',
                color: '#fff',
                fontSize: '16px'
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
              background: '#d32f2f',
              color: '#fff',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#666' : 'linear-gradient(90deg, #00e5cc, #00a896)',
              color: '#0a1929',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s'
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#0a1929',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#b2bac2'
        }}>
          <strong>Credenciales de prueba:</strong><br />
          Usuario: <code style={{ color: '#00e5cc' }}>admin</code><br />
          Contraseña: <code style={{ color: '#00e5cc' }}>admin123</code>
        </div>
      </div>
    </div>
  );
}