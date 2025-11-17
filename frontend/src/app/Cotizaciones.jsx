// app/Cotizaciones.jsx
import { useState, useEffect } from 'react';
import Nav from '../components/nav/Nav';
import Bar from '../components/bar/Bar';
import cotizacionesService from '../services/cotizaciones';
import { Button, Card, Table, Modal } from '../components/common';
import '../css/cotizaciones.css';

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  const cargarCotizaciones = async () => {
    try {
      setLoading(true);
      const data = await cotizacionesService.getAll();
      setCotizaciones(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertirVenta = async (id) => {
    if (!confirm('¿Convertir esta cotización en venta?')) return;
    
    try {
      await cotizacionesService.convertirAVenta(id, 'efectivo');
      alert('Cotización convertida a venta exitosamente');
      cargarCotizaciones();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Error al convertir la cotización');
    }
  };

  const handleAprobar = async (id) => {
    try {
      await cotizacionesService.aprobar(id);
      alert('Cotización aprobada');
      cargarCotizaciones();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al aprobar la cotización');
    }
  };

  const handleRechazar = async (id) => {
    const motivo = prompt('Motivo del rechazo:');
    if (!motivo) return;
    
    try {
      await cotizacionesService.rechazar(id, motivo);
      alert('Cotización rechazada');
      cargarCotizaciones();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al rechazar la cotización');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      borrador: 'badge-secondary',
      enviada: 'badge-info',
      aprobada: 'badge-success',
      rechazada: 'badge-danger',
      vencida: 'badge-warning',
      convertida: 'badge-primary'
    };
    return badges[estado] || 'badge-secondary';
  };

  const diasRestantes = (fechaVencimiento) => {
    const dias = Math.ceil((new Date(fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24));
    return dias;
  };

  return (
    <div className="cotizaciones-container">
      <Bar />
      <main className="cotizaciones-main">
        <Nav />
        <div className="cotizaciones-content">
      <div className="header">
        <h1>📝 Cotizaciones</h1>
        <Button onClick={() => setModalOpen(true)} className="btn-primary">
          + Nueva Cotización
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Vencimiento</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.map(cot => {
                const dias = diasRestantes(cot.fechaVencimiento);
                return (
                  <tr key={cot._id}>
                    <td>{cot.numeroCotizacion}</td>
                    <td>{cot.cliente?.nombre}</td>
                    <td>{new Date(cot.fechaCotizacion).toLocaleDateString()}</td>
                    <td>
                      {new Date(cot.fechaVencimiento).toLocaleDateString()}
                      {dias > 0 && dias <= 5 && (
                        <span className="badge badge-warning ml-2">
                          {dias} días
                        </span>
                      )}
                    </td>
                    <td>${cot.total.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${getEstadoBadge(cot.estado)}`}>
                        {cot.estado}
                      </span>
                    </td>
                    <td className="acciones">
                      <Button size="small" onClick={() => {}}>Ver</Button>
                      {cot.estado === 'enviada' && (
                        <>
                          <Button size="small" className="btn-success" onClick={() => handleAprobar(cot._id)}>
                            Aprobar
                          </Button>
                          <Button size="small" className="btn-danger" onClick={() => handleRechazar(cot._id)}>
                            Rechazar
                          </Button>
                        </>
                      )}
                      {cot.estado === 'aprobada' && !cot.ventaGenerada && (
                        <Button size="small" className="btn-primary" onClick={() => handleConvertirVenta(cot._id)}>
                          Convertir a Venta
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
        </div>
      </main>
    </div>
  );
}
