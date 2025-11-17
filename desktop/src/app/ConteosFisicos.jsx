// app/ConteosFisicos.jsx
import { useState, useEffect } from 'react';
import Nav from '../components/nav/Nav';
import Bar from '../components/bar/Bar';
import conteosFisicosService from '../services/conteosFisicos';
import { Button, Card, Table } from '../components/common';
import '../css/conteosFisicos.css';

export default function ConteosFisicos() {
  const [conteos, setConteos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarConteos();
  }, []);

  const cargarConteos = async () => {
    try {
      setLoading(true);
      const data = await conteosFisicosService.getAll();
      setConteos(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar conteos');
    } finally {
      setLoading(false);
    }
  };

  const handleIniciar = async (id) => {
    try {
      await conteosFisicosService.iniciar(id);
      alert('Conteo iniciado');
      cargarConteos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al iniciar el conteo');
    }
  };

  const handleCompletar = async (id) => {
    try {
      await conteosFisicosService.completar(id);
      alert('Conteo completado');
      cargarConteos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al completar el conteo');
    }
  };

  const handleAjustar = async (id) => {
    if (!confirm('¿Aplicar ajustes de inventario según este conteo?')) return;
    
    try {
      const result = await conteosFisicosService.ajustar(id);
      alert(`Ajustes aplicados: ${result.ajustes.length} productos actualizados`);
      cargarConteos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al aplicar ajustes');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      planificado: 'badge-secondary',
      en_proceso: 'badge-info',
      completado: 'badge-success',
      ajustado: 'badge-primary'
    };
    return badges[estado] || 'badge-secondary';
  };

  const getTipoBadge = (tipo) => {
    const badges = {
      completo: 'badge-warning',
      ciclico: 'badge-info',
      aleatorio: 'badge-secondary'
    };
    return badges[tipo] || 'badge-secondary';
  };

  return (
    <div className="conteos-container">
      <Bar />
      <main className="conteos-main">
        <Nav />
        <div className="conteos-content">
      <div className="header">
        <h1>📋 Conteos Físicos</h1>
        <Button className="btn-primary">
          + Planificar Conteo
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Almacén</th>
                <th>Tipo</th>
                <th>Responsable</th>
                <th>Items</th>
                <th>Varianza</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {conteos.map(conteo => (
                <tr key={conteo._id}>
                  <td>{new Date(conteo.fechaConteo).toLocaleDateString()}</td>
                  <td>{conteo.almacen?.nombre}</td>
                  <td>
                    <span className={`badge ${getTipoBadge(conteo.tipo)}`}>
                      {conteo.tipo}
                    </span>
                  </td>
                  <td>{conteo.responsable?.nombre}</td>
                  <td>
                    {conteo.contados}/{conteo.items.length}
                  </td>
                  <td>
                    {conteo.totalVarianzas && (
                      <span className={conteo.totalVarianzas !== 0 ? 'text-warning' : 'text-success'}>
                        {conteo.totalVarianzas > 0 ? '+' : ''}{conteo.totalVarianzas}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${getEstadoBadge(conteo.estado)}`}>
                      {conteo.estado}
                    </span>
                  </td>
                  <td className="acciones">
                    <Button size="small">Ver</Button>
                    {conteo.estado === 'planificado' && (
                      <Button size="small" className="btn-info" onClick={() => handleIniciar(conteo._id)}>
                        Iniciar
                      </Button>
                    )}
                    {conteo.estado === 'en_proceso' && (
                      <Button size="small" className="btn-success" onClick={() => handleCompletar(conteo._id)}>
                        Completar
                      </Button>
                    )}
                    {conteo.estado === 'completado' && (
                      <Button size="small" className="btn-warning" onClick={() => handleAjustar(conteo._id)}>
                        Aplicar Ajustes
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
        </div>
      </main>
    </div>
  );
}
