import React from 'react';

export default function API() {
  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
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
            REST API
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#202124', 
            lineHeight: '1.6',
            margin: 0
          }}>
            La sección <strong>API REST</strong> ofrece acceso programático a los datos de UrbanPulse 
            mediante una interfaz documentada con <strong>OpenAPI 3.0</strong>.
          </p>
        </div>

        {/* Endpoints principales */}
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#202124', 
            marginBottom: '24px' 
          }}>
            Endpoints Principales
          </h2>

          {/* Endpoint 1 - Movilidad */}
          <div style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px', 
            marginBottom: '16px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ 
                background: '#34a853', 
                color: 'white', 
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                GET
              </span>
              <code style={{ 
                fontSize: '14px', 
                fontWeight: '500',
                color: '#202124'
              }}>
                /api/movilidad/realtime
              </code>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <p style={{ 
                fontSize: '14px', 
                color: '#202124', 
                margin: '0 0 12px 0' 
              }}>
                Recupera datos de tráfico y movilidad en tiempo real de todas las estaciones de Euskadi.
              </p>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '12px', 
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'monospace',
                color: '#202124'
              }}>
                <strong>Respuesta:</strong> Array de objetos con zone, vehicle_count, incident_count, timestamp, etc.
              </div>
            </div>
          </div>

          {/* Endpoint 2 - Calidad del Aire */}
          <div style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px', 
            marginBottom: '16px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ 
                background: '#34a853', 
                color: 'white', 
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                GET
              </span>
              <code style={{ 
                fontSize: '14px', 
                fontWeight: '500',
                color: '#202124'
              }}>
                /api/meteorologia/realtime
              </code>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <p style={{ 
                fontSize: '14px', 
                color: '#202124', 
                margin: '0 0 12px 0' 
              }}>
                Devuelve niveles de contaminación atmosférica (PM10, PM2.5, NO2, O3, SO2, CO) de todas las estaciones.
              </p>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '12px', 
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'monospace',
                color: '#202124'
              }}>
                <strong>Respuesta:</strong> Array de mediciones con city, zone, pollutant, value, unit, timestamp.
              </div>
            </div>
          </div>

          {/* Endpoint 3 - Login */}
          <div style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px',
            marginBottom: '16px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ 
                background: '#ea4335', 
                color: 'white', 
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                POST
              </span>
              <code style={{ 
                fontSize: '14px', 
                fontWeight: '500',
                color: '#202124'
              }}>
                /api/login
              </code>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <p style={{ 
                fontSize: '14px', 
                color: '#202124', 
                margin: '0 0 12px 0' 
              }}>
                Permite autenticar usuarios y obtener un token JWT para acceder a los endpoints protegidos.
              </p>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '12px', 
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'monospace',
                marginBottom: '8px',
                color: '#202124'
              }}>
                <strong>Body:</strong> {`{ "username": "usuario", "password": "contraseña" }`}
              </div>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '12px', 
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'monospace',
                color: '#202124'
              }}>
                <strong>Respuesta:</strong> {`{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }`}
              </div>
            </div>
          </div>

          {/* Endpoint 4 - Registro */}
          <div style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ 
                background: '#ea4335', 
                color: 'white', 
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                POST
              </span>
              <code style={{ 
                fontSize: '14px', 
                fontWeight: '500',
                color: '#202124'
              }}>
                /api/registro
              </code>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <p style={{ 
                fontSize: '14px', 
                color: '#202124', 
                margin: '0 0 12px 0' 
              }}>
                Permite registrar nuevos usuarios en el sistema.
              </p>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '12px', 
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'monospace',
                marginBottom: '8px',
                color: '#202124'
              }}>
                <strong>Body:</strong> {`{ "username": "nuevo_usuario", "password": "contraseña_segura" }`}
              </div>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '12px', 
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'monospace',
                color: '#202124'
              }}>
                <strong>Respuesta:</strong> {`{ "message": "Usuario registrado con éxito" }`}
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div style={{ 
          background: '#e8f0fe', 
          padding: '30px', 
          borderRadius: '12px',
          border: '1px solid #d2e3fc',
          marginBottom: '30px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1967d2', 
            marginBottom: '12px' 
          }}>
            📘 Documentación Completa
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#202124', 
            lineHeight: '1.6',
            margin: '0 0 16px 0'
          }}>
            Esta vista está orientada a <strong>desarrolladores y analistas</strong> que deseen 
            integrar los datos de UrbanPulse en sus propias aplicaciones o sistemas externos.
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#202124', 
            lineHeight: '1.6',
            margin: 0
          }}>
            Para más detalles, consulta la <strong>documentación interactiva de Swagger</strong> en{' '}
            <a 
              href="http://localhost:8080/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#1967d2', textDecoration: 'none', fontWeight: '500' }}
            >
              http://localhost:8080/docs
            </a>
          </p>
        </div>

        {/* Autenticación */}
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#202124', 
            marginBottom: '16px' 
          }}>
            🔐 Autenticación
          </h2>
          <p style={{ 
            fontSize: '14px', 
            color: '#202124', 
            lineHeight: '1.6',
            margin: '0 0 16px 0'
          }}>
            Todos los endpoints requieren autenticación mediante <strong>JWT (JSON Web Token)</strong>.
          </p>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '16px', 
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'monospace',
            border: '1px solid #e0e0e0',
            color: '#202124'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Authorization:</strong> Bearer &lt;token&gt;
            </div>
            <div style={{ fontSize: '12px' }}>
              Obtén tu token mediante POST /api/login con tus credenciales
            </div>
          </div>
        </div>

        {/* Fuentes de datos */}
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#202124', 
            marginBottom: '16px' 
          }}>
            📊 Fuentes de Datos
          </h2>
          <ul style={{ 
            fontSize: '14px', 
            color: '#202124', 
            lineHeight: '1.8',
            paddingLeft: '20px'
          }}>
            <li>
              <strong>Tráfico:</strong> Open Data Euskadi - Incidencias reales del Gobierno Vasco.
            </li>
            <li>
              <strong>Calidad del Aire:</strong> Red de Control de Calidad del Aire del Gobierno Vasco.
            </li>
            <li>
              <strong>Actualización:</strong> Cada 5 minutos en backend, polling cada 30 segundos en frontend.
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}