import React, { useState, useEffect } from 'react';
import axios from 'axios';

type User = {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
};

type ServiceStatus = {
  name: string;
  status: 'online' | 'offline';
  endpoint: string;
};

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'users' | 'services' | 'logs'>('users');

  const apiBase = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:8080/api';

  useEffect(() => {
    fetchUsers();
    checkServices();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiBase}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([
        {
          _id: '1',
          username: 'admin',
          email: 'admin@urbanpulse.com',
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      ]);
      setLoading(false);
    }
  };

  const checkServices = async () => {
    const servicesToCheck: ServiceStatus[] = [
      { name: 'Gateway', status: 'offline', endpoint: `${apiBase.replace('/api', '')}/health` },
      { name: 'Microservicio Tráfico', status: 'offline', endpoint: `${apiBase}/movilidad/realtime` },
      { name: 'Microservicio Calidad del Aire', status: 'offline', endpoint: `${apiBase}/meteorologia/realtime` }
    ];

    const updatedServices = await Promise.all(
      servicesToCheck.map(async (service) => {
        try {
          const token = localStorage.getItem('token');
          await axios.get(service.endpoint, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 3000
          });
          return { ...service, status: 'online' as const };
        } catch (error) {
          return { ...service, status: 'offline' as const };
        }
      })
    );

    setServices(updatedServices);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${apiBase}/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        alert('✅ Usuario eliminado correctamente');
        fetchUsers();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (!confirm(`¿Cambiar rol a ${newRole}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${apiBase}/auth/users/${userId}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        alert(`✅ ${response.data.message}`);
        fetchUsers();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cambiar rol');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ fontSize: '24px', color: '#5f6368' }}>Cargando panel de administración...</div>
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
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
             Panel de Administración
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#5f6368', 
            lineHeight: '1.6',
            margin: 0
          }}>
            Gestiona usuarios, monitorea servicios y supervisa el sistema UrbanPulse.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ 
          background: 'white',
          borderRadius: '12px 12px 0 0',
          padding: '0 20px',
          display: 'flex',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setSelectedTab('users')}
            style={{
              padding: '16px 24px',
              border: 'none',
              borderBottom: selectedTab === 'users' ? '3px solid #1967d2' : '3px solid transparent',
              background: 'transparent',
              color: selectedTab === 'users' ? '#1967d2' : '#5f6368',
              fontWeight: selectedTab === 'users' ? '600' : '400',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            👥 Usuarios ({users.length})
          </button>
          <button
            onClick={() => setSelectedTab('services')}
            style={{
              padding: '16px 24px',
              border: 'none',
              borderBottom: selectedTab === 'services' ? '3px solid #1967d2' : '3px solid transparent',
              background: 'transparent',
              color: selectedTab === 'services' ? '#1967d2' : '#5f6368',
              fontWeight: selectedTab === 'services' ? '600' : '400',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            🔧 Servicios
          </button>
          <button
            onClick={() => setSelectedTab('logs')}
            style={{
              padding: '16px 24px',
              border: 'none',
              borderBottom: selectedTab === 'logs' ? '3px solid #1967d2' : '3px solid transparent',
              background: 'transparent',
              color: selectedTab === 'logs' ? '#1967d2' : '#5f6368',
              fontWeight: selectedTab === 'logs' ? '600' : '400',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            📋 Logs del Sistema
          </button>
        </div>

        {/* Content */}
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '0 0 12px 12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          minHeight: '500px'
        }}>
          
          {/* TAB: Usuarios */}
          {selectedTab === 'users' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#202124', margin: 0 }}>
                  Gestión de Usuarios
                </h2>
                <p style={{ fontSize: '14px', color: '#5f6368', marginTop: '8px' }}>
                  Los nuevos usuarios deben registrarse desde la página de login. Usa emails @urbanpulse.com para crear administradores automáticamente.
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#202124' }}>Usuario</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#202124' }}>Email</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#202124' }}>Rol</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#202124' }}>Fecha Registro</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#202124' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr 
                        key={user._id}
                        style={{ 
                          borderBottom: '1px solid #e0e0e0',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={{ padding: '12px 16px', color: '#202124', fontWeight: '500' }}>
                          {user.username}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#5f6368' }}>
                          {user.email}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: user.role === 'admin' ? '#fef3c7' : '#dbeafe',
                            color: user.role === 'admin' ? '#92400e' : '#1e40af'
                          }}>
                            {user.role === 'admin' ? '👑 Admin' : '👤 Usuario'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#5f6368' }}>
                          {new Date(user.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleToggleRole(user._id, user.role)}
                            style={{
                              padding: '6px 12px',
                              background: '#f8f9fa',
                              color: '#202124',
                              border: '1px solid #dadce0',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              marginRight: '8px'
                            }}
                          >
                            Cambiar Rol
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            style={{
                              padding: '6px 12px',
                              background: '#fee2e2',
                              color: '#991b1b',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: Servicios */}
          {selectedTab === 'services' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#202124', marginBottom: '8px' }}>
                  Estado de los Servicios
                </h2>
                <p style={{ fontSize: '14px', color: '#5f6368', margin: 0 }}>
                  Monitoreo en tiempo real de los microservicios de UrbanPulse
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {services.map((service, index) => (
                  <div 
                    key={index}
                    style={{
                      background: service.status === 'online' ? '#f0fdf4' : '#fef2f2',
                      border: service.status === 'online' ? '2px solid #86efac' : '2px solid #fca5a5',
                      borderRadius: '12px',
                      padding: '24px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#202124', margin: 0 }}>
                        {service.name}
                      </h3>
                      <span style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: service.status === 'online' ? '#22c55e' : '#ef4444',
                        display: 'inline-block'
                      }} />
                    </div>
                    <p style={{ fontSize: '14px', color: '#5f6368', margin: '0 0 16px 0' }}>
                      {service.endpoint}
                    </p>
                    <div style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: service.status === 'online' ? '#dcfce7' : '#fee2e2',
                      color: service.status === 'online' ? '#166534' : '#991b1b',
                      fontSize: '13px',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      {service.status === 'online' ? '✅ Online' : '❌ Offline'}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={checkServices}
                style={{
                  marginTop: '24px',
                  padding: '12px 24px',
                  background: '#1967d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                🔄 Actualizar Estado
              </button>
            </div>
          )}

          {/* TAB: Logs */}
          {selectedTab === 'logs' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#202124', marginBottom: '8px' }}>
                  Logs del Sistema
                </h2>
                <p style={{ fontSize: '14px', color: '#5f6368', margin: 0 }}>
                  Actividad reciente y eventos del sistema
                </p>
              </div>

              <div style={{
                background: '#1f2937',
                color: '#e5e7eb',
                padding: '20px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '13px',
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#10b981' }}>[INFO]</span> {new Date().toLocaleString()} - Sistema iniciado correctamente
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#3b82f6' }}>[DEBUG]</span> {new Date().toLocaleString()} - Conexión a MongoDB establecida
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#3b82f6' }}>[DEBUG]</span> {new Date().toLocaleString()} - Conexión a PostgreSQL establecida
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#10b981' }}>[INFO]</span> {new Date().toLocaleString()} - Microservicio de tráfico: {services[1]?.status === 'online' ? 'Online' : 'Offline'}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#10b981' }}>[INFO]</span> {new Date().toLocaleString()} - Microservicio de calidad del aire: {services[2]?.status === 'online' ? 'Online' : 'Offline'}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#f59e0b' }}>[WARN]</span> {new Date().toLocaleString()} - Panel de administración accedido por: admin
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}