// app/Alertas.jsx
import { useState, useEffect } from 'react';
import Nav from '../components/nav/Nav';
import Bar from '../components/bar/Bar';
import alertasService from '../services/alertas';
import { Button, Card } from '../components/common';
import '../css/alertas.css';

export default function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('activa');

  useEffect(() => {
    cargarAlertas();
  }, [filtro]);

  const cargarAlertas = async () => {
    try {
      setLoading(true);
      const data = await alertasService.getAll({ estado: filtro });
      setAlertas(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar alertas');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarAlertas = async () => {
    try {
      const result = await alertasService.generarAutomaticas();
      alert(`${result.cantidad} alertas generadas`);
      cargarAlertas();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar alertas');
    }
  };

  const handleMarcarLeida = async (id) => {
    try {
      await alertasService.marcarLeida(id);
      cargarAlertas();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleResolver = async (id) => {
    const accion = prompt('Acción tomada:');
    if (!accion) return;
    
    try {
      await alertasService.resolver(id, accion);
      alert('Alerta resuelta');
      cargarAlertas();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al resolver la alerta');
    }
  };

  const handleIgnorar = async (id) => {
    if (!confirm('¿Ignorar esta alerta?')) return;
    
    try {
      await alertasService.ignorar(id);
      cargarAlertas();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getPrioridadColor = (prioridad) => {
    const colores = {
      critica: '#dc3545',
      alta: '#ffc107',
      media: '#17a2b8',
      baja: '#6c757d'
    };
    return colores[prioridad] || '#6c757d';
  };

  const getTipoIcon = (tipo) => {
    const iconos = {
      stock_minimo: '📉',
      stock_agotado: '🚫',
      producto_vencido: '⚠️',
      producto_por_vencer: '⏰',
      reserva_vencida: '🔓',
      reposicion_automatica: '🔄'
    };
    return iconos[tipo] || '📋';
  };

  return (
    <div className="alertas-container">
      <Bar />
      <main className="alertas-main">
        <Nav />
        <div className="alertas-content">
      <div className="header">
        <h1>🔔 Alertas del Sistema</h1>
        <Button onClick={handleGenerarAlertas} className="btn-primary">
          🔄 Generar Alertas
        </Button>
      </div>

      <div className="filtros">
        <button 
          className={filtro === 'activa' ? 'active' : ''} 
          onClick={() => setFiltro('activa')}
        >
          Activas
        </button>
        <button 
          className={filtro === 'leida' ? 'active' : ''} 
          onClick={() => setFiltro('leida')}
        >
          Leídas
        </button>
        <button 
          className={filtro === 'resuelta' ? 'active' : ''} 
          onClick={() => setFiltro('resuelta')}
        >
          Resueltas
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : (
        <div className="alertas-grid">
          {alertas.map(alerta => (
            <Card key={alerta._id} className="alerta-card">
              <div 
                className="prioridad-bar" 
                style={{ backgroundColor: getPrioridadColor(alerta.prioridad) }}
              />
              <div className="alerta-content">
                <div className="alerta-header">
                  <span className="tipo-icon">{getTipoIcon(alerta.tipo)}</span>
                  <h3>{alerta.titulo}</h3>
                  <span className={`badge badge-${alerta.prioridad}`}>
                    {alerta.prioridad}
                  </span>
                </div>
                <p className="mensaje">{alerta.mensaje}</p>
                <div className="alerta-meta">
                  <span className="fecha">
                    {new Date(alerta.fechaCreacion).toLocaleString()}
                  </span>
                  {alerta.producto && (
                    <span className="producto">{alerta.producto.nombre}</span>
                  )}
                </div>
                {filtro === 'activa' && (
                  <div className="alerta-acciones">
                    <Button size="small" onClick={() => handleMarcarLeida(alerta._id)}>
                      Marcar leída
                    </Button>
                    <Button 
                      size="small" 
                      className="btn-success" 
                      onClick={() => handleResolver(alerta._id)}
                    >
                      Resolver
                    </Button>
                    <Button 
                      size="small" 
                      className="btn-secondary" 
                      onClick={() => handleIgnorar(alerta._id)}
                    >
                      Ignorar
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
        </div>
      </main>
    </div>
  );
}
