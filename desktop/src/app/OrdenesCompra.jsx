// app/OrdenesCompra.jsx
import { useState, useEffect } from 'react';
import Nav from '../components/nav/Nav';
import Bar from '../components/bar/Bar';
import ordenesCompraService from '../services/ordenesCompra';
import { Button, Card, Table, Modal, Input } from '../components/common';
import '../css/ordenesCompra.css';

export default function OrdenesCompra() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [filtros, setFiltros] = useState({ estado: '' });

  useEffect(() => {
    cargarOrdenes();
  }, [filtros]);

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      const data = await ordenesCompraService.getAll(filtros);
      setOrdenes(data);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      alert('Error al cargar las órdenes de compra');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearOrden = () => {
    setOrdenSeleccionada(null);
    setModalOpen(true);
  };

  const handleVerDetalles = async (id) => {
    try {
      const orden = await ordenesCompraService.getById(id);
      setOrdenSeleccionada(orden);
      setModalOpen(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar la orden');
    }
  };

  const handleConvertirCompra = async (id) => {
    if (!confirm('¿Convertir esta orden en compra?')) return;
    
    try {
      await ordenesCompraService.convertirACompra(id);
      alert('Orden convertida a compra exitosamente');
      cargarOrdenes();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al convertir la orden');
    }
  };

  const handleCancelar = async (id) => {
    if (!confirm('¿Cancelar esta orden de compra?')) return;
    
    try {
      await ordenesCompraService.cancelar(id);
      alert('Orden cancelada exitosamente');
      cargarOrdenes();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cancelar la orden');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      borrador: 'badge-secondary',
      enviada: 'badge-info',
      parcial: 'badge-warning',
      completa: 'badge-success',
      cancelada: 'badge-danger'
    };
    return badges[estado] || 'badge-secondary';
  };

  return (
    <div className="ordenes-compra-container">
      <Bar />
      <main className="ordenes-compra-main">
        <Nav />
        <div className="ordenes-compra-content">
      <div className="header">
        <h1>📦 Órdenes de Compra</h1>
        <Button onClick={handleCrearOrden} className="btn-primary">
          + Nueva Orden
        </Button>
      </div>

      <Card>
        <div className="filtros">
          <select 
            value={filtros.estado} 
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          >
            <option value="">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="enviada">Enviada</option>
            <option value="parcial">Parcial</option>
            <option value="completa">Completa</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">Cargando...</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Productos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map(orden => (
                <tr key={orden._id}>
                  <td>{orden.numeroOrden}</td>
                  <td>{orden.proveedor?.nombre}</td>
                  <td>{new Date(orden.fechaOrden).toLocaleDateString()}</td>
                  <td>${orden.total.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${getEstadoBadge(orden.estado)}`}>
                      {orden.estado}
                    </span>
                  </td>
                  <td>{orden.productos.length} items</td>
                  <td className="acciones">
                    <Button 
                      size="small" 
                      onClick={() => handleVerDetalles(orden._id)}
                    >
                      Ver
                    </Button>
                    {orden.estado === 'completa' && !orden.compraGenerada && (
                      <Button 
                        size="small" 
                        className="btn-success"
                        onClick={() => handleConvertirCompra(orden._id)}
                      >
                        Convertir
                      </Button>
                    )}
                    {orden.estado === 'borrador' && (
                      <Button 
                        size="small" 
                        className="btn-danger"
                        onClick={() => handleCancelar(orden._id)}
                      >
                        Cancelar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)} title="Detalle de Orden">
          {/* Aquí iría el formulario detallado */}
          <p>Detalles de la orden...</p>
        </Modal>
      )}
        </div>
      </main>
    </div>
  );
}
