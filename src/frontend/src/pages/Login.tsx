import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apiBase = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:8080';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        console.log('Intentando login con:', username);
        const response = await axios.post(`${apiBase}/auth/login`, {
          username,
          password
        });

        console.log('Respuesta login:', response.data);

        if (response.data.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          navigate('/');
        }
      } else {
        // REGISTRO
        console.log('Intentando registro con:', username, email);
        const response = await axios.post(`${apiBase}/auth/register`, {
          username,
          email,
          password
        });

        console.log('Respuesta registro:', response.data);

        if (response.data.success) {
          setSuccess(' Usuario registrado! Ahora puedes iniciar sesión.');
          setIsLogin(true);
          setPassword('');
        }
      }
    } catch (err: any) {
      console.error('Error completo:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error en el servidor';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(19, 47, 76, 0.95)',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        border: '1px solid rgba(0, 229, 204, 0.2)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '42px',
            color: '#00e5cc',
            fontWeight: 'bold',
            margin: 0,
            textShadow: '0 0 20px rgba(0, 229, 204, 0.3)'
          }}>
             UrbanPulse
         
          <p style={{ color: '#b2bac2', marginTop: '8px', fontSize: '14px' }}>
            Plataforma inteligente de movilidad urbana
          </p>
           </h1>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '30px',
          background: 'rgba(10, 25, 41, 0.6)',
          borderRadius: '12px',
          padding: '6px'
        }}>
          <button
            onClick={() => {
              setIsLogin(true);
              setError('');
              setSuccess('');
            }}
            style={{
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              background: isLogin ? 'rgba(0, 229, 204, 0.15)' : 'transparent',
              color: isLogin ? '#00e5cc' : '#b2bac2',
              fontWeight: isLogin ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '15px'
            }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError('');
              setSuccess('');
            }}
            style={{
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              background: !isLogin ? 'rgba(0, 229, 204, 0.15)' : 'transparent',
              color: !isLogin ? '#00e5cc' : '#b2bac2',
              fontWeight: !isLogin ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '15px'
            }}
          >
            Registrarse
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#b2bac2',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Escribe tu usuario"
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(10, 25, 41, 0.6)',
                border: '1px solid rgba(0, 229, 204, 0.3)',
                borderRadius: '8px',
                fontSize: '15px',
                color: 'white',
                boxSizing: 'border-box',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#00e5cc';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 229, 204, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 229, 204, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#b2bac2',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={!isLogin}
                placeholder="tu@email.com"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(10, 25, 41, 0.6)',
                  border: '1px solid rgba(0, 229, 204, 0.3)',
                  borderRadius: '8px',
                  fontSize: '15px',
                  color: 'white',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00e5cc';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 229, 204, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 229, 204, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#b2bac2',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(10, 25, 41, 0.6)',
                border: '1px solid rgba(0, 229, 204, 0.3)',
                borderRadius: '8px',
                fontSize: '15px',
                color: 'white',
                boxSizing: 'border-box',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#00e5cc';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 229, 204, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 229, 204, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
              background: 'rgba(244, 67, 54, 0.15)',
              color: '#ff6b6b',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              border: '1px solid rgba(244, 67, 54, 0.3)'
            }}>
               {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '12px',
              background: 'rgba(0, 229, 204, 0.15)',
              color: '#00e5cc',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              border: '1px solid rgba(0, 229, 204, 0.3)'
            }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? '#666' : 'linear-gradient(135deg, #00e5cc 0%, #00a896 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(0, 229, 204, 0.3)'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 229, 204, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 229, 204, 0.3)';
            }}
          >
            {loading ? '⏳ Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </button>
        </form>

        {isLogin && (
          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            color: '#b2bac2',
            fontSize: '14px'
          }}>
            ¿No tienes cuenta?{' '}
            <span
              onClick={() => {
                setIsLogin(false);
                setError('');
                setSuccess('');
              }}
              style={{
                color: '#00e5cc',
                cursor: 'pointer',
                fontWeight: 'bold',
                textDecoration: 'underline'
              }}
            >
              Regístrate aquí
            </span>
          </div>
        )}
      </div>
    </div>
  );
}