// app/Cotizaciones.jsx
import { useState, useEffect } from 'react';
import Nav from '../components/nav/Nav';
import Bar from '../components/bar/Bar';
import cotizacionesService from '../services/cotizaciones';
import { clientesAPI, productosAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button, Card, Modal, Input } from '../components/common';
import { FaFileInvoice, FaEye, FaCheck, FaTimes, FaExchangeAlt, FaPlus, FaDownload } from 'react-icons/fa';
import '../css/cotizaciones.css';

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    cliente: '',
    productos: [],
    validezDias: 15,
    condicionesPago: '',
    tiempoEntrega: '',
    observaciones: ''
  });
  const [filtros, setFiltros] = useState({ estado: '', cliente: '' });
  const toast = useToast();

  useEffect(() => {
    console.log('🚀 Iniciando carga de datos...');
    cargarDatosIniciales();
    cargarCotizaciones();
  }, []);

  useEffect(() => {
    // Solo recargar si los filtros cambiaron después de la carga inicial
    const hasFiltrosActivos = filtros.estado !== '' || filtros.cliente !== '';
    if (hasFiltrosActivos) {
      console.log('🔄 Filtros cambiaron, recargando...', filtros);
      cargarCotizaciones();
    }
  }, [filtros.estado, filtros.cliente]);

  const cargarCotizaciones = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando cotizaciones...');
      
      const data = await cotizacionesService.getAll(filtros);
      console.log('✅ Cotizaciones recibidas:', data?.length || 0);
      
      setCotizaciones(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      toast.error(`Error al cargar cotizaciones: ${error.message}`);
      setCotizaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosIniciales = async () => {
    try {
      const [clientesData, productosData] = await Promise.all([
        clientesAPI.getAll(),
        productosAPI.getAll()
      ]);
      setClientes(clientesData);
      setProductos(productosData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar datos iniciales');
    }
  };

  const handleConvertirVenta = async (id) => {
    if (!window.confirm('¿Convertir esta cotización en venta?')) return;
    
    try {
      await cotizacionesService.convertirAVenta(id, 'efectivo');
      toast.success('Cotización convertida a venta exitosamente');
      cargarCotizaciones();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al convertir la cotización');
    }
  };

  const handleAprobar = async (id) => {
    try {
      await cotizacionesService.aprobar(id);
      toast.success('Cotización aprobada exitosamente');
      cargarCotizaciones();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al aprobar la cotización');
    }
  };

  const handleRechazar = async (id) => {
    const motivo = prompt('Motivo del rechazo:');
    if (!motivo) return;
    
    try {
      await cotizacionesService.rechazar(id, motivo);
      toast.success('Cotización rechazada');
      cargarCotizaciones();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al rechazar la cotización');
    }
  };

  const handleVer = async (cotizacion) => {
    setCotizacionSeleccionada(cotizacion);
    setModalDetalle(true);
  };

  const handleNuevaCotizacion = () => {
    setFormData({
      cliente: '',
      productos: [],
      validezDias: 15,
      condicionesPago: '',
      tiempoEntrega: '',
      observaciones: ''
    });
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar datos mínimos
    if (!formData.cliente) {
      toast.error('Debe seleccionar un cliente');
      return;
    }

    try {
      console.log('📝 Datos del formulario antes de enviar:', formData);
      
      if (isEditing) {
        await cotizacionesService.update(cotizacionSeleccionada._id, formData);
        toast.success('Cotización actualizada exitosamente');
      } else {
        const response = await cotizacionesService.create(formData);
        console.log('✅ Respuesta del servidor:', response);
        toast.success('Cotización creada exitosamente');
      }
      cargarCotizaciones();
      setModalOpen(false);
    } catch (error) {
      console.error('❌ Error al guardar cotización:', error);
      toast.error(`Error al guardar la cotización: ${error.message}`);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const exportarCSV = () => {
    try {
      const headers = ['Número', 'Cliente', 'Fecha', 'Vencimiento', 'Total', 'Estado'];
      const csvContent = [
        headers.join(','),
        ...cotizaciones.map(cot => [
          cot.numeroCotizacion,
          cot.cliente?.nombre || '',
          new Date(cot.fechaCotizacion).toLocaleDateString(),
          new Date(cot.fechaVencimiento).toLocaleDateString(),
          cot.total.toFixed(2),
          cot.estado
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cotizaciones_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Cotizaciones exportadas exitosamente');
    } catch (error) {
      toast.error('Error al exportar cotizaciones');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      borrador: 'badge estado-borrador',
      enviada: 'badge estado-enviada',
      aprobada: 'badge estado-aprobada',
      rechazada: 'badge estado-rechazada',
      vencida: 'badge estado-vencida',
      convertida: 'badge estado-convertida'
    };
    return badges[estado] || 'badge estado-borrador';
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
            <div>
              <h1>📝 Cotizaciones</h1>
              <p className="subtitle">Gestión de cotizaciones de ventas</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button
                variant="info"
                onClick={() => {
                  console.log('🔍 DEBUG - Estado actual:', {
                    cotizaciones: cotizaciones,
                    length: cotizaciones.length,
                    loading: loading,
                    filtros: filtros
                  });
                  alert(`Debug: ${cotizaciones.length} cotizaciones en estado. Loading: ${loading}`);
                }}
              >
                🔍 Debug
              </Button>
              <Button
                variant="secondary"
                icon={<FaDownload />}
                onClick={exportarCSV}
              >
                Exportar
              </Button>
              <Button
                variant="primary"
                icon={<FaPlus />}
                onClick={handleNuevaCotizacion}
              >
                Nueva Cotización
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <Card>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'end', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label">Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                  className="input-field"
                >
                  <option value="">Todos los estados</option>
                  <option value="borrador">Borrador</option>
                  <option value="enviada">Enviada</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="rechazada">Rechazada</option>
                  <option value="vencida">Vencida</option>
                  <option value="convertida">Convertida</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">Cliente</label>
                <select
                  value={filtros.cliente}
                  onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })}
                  className="input-field"
                >
                  <option value="">Todos los clientes</option>
                  {clientes.map(cliente => (
                    <option key={cliente._id} value={cliente._id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="ghost"
                onClick={() => setFiltros({ estado: '', cliente: '' })}
              >
                Limpiar
              </Button>
            </div>
          </Card>

          {/* Tabla de cotizaciones */}
          <Card>
            {loading ? (
              <div className="loading">Cargando cotizaciones...</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
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
                    {cotizaciones.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                          No hay cotizaciones para mostrar
                        </td>
                      </tr>
                    ) : (
                      cotizaciones.map((cot, index) => {
                        console.log('🔄 Renderizando cotización:', cot.numeroCotizacion, cot);
                        const dias = diasRestantes(cot.fechaVencimiento);
                        return (
                          <tr key={cot._id || index}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaFileInvoice style={{ color: 'var(--primary-color)' }} />
                                <span className="numero-cotizacion">{cot?.numeroCotizacion || 'N/A'}</span>
                              </div>
                            </td>
                            <td>{cot?.cliente?.nombre || 'Sin cliente'}</td>
                            <td>
                              {cot?.fechaCotizacion ? 
                                new Date(cot.fechaCotizacion).toLocaleDateString() : 
                                'N/A'
                              }
                            </td>
                            <td>
                              {cot?.fechaVencimiento ? 
                                new Date(cot.fechaVencimiento).toLocaleDateString() : 
                                'N/A'
                              }
                              {dias > 0 && dias <= 5 && (
                                <span className="badge badge-warning ml-2">
                                  {dias} días
                                </span>
                              )}
                              {dias <= 0 && (
                                <span className="badge badge-danger ml-2">
                                  Vencida
                                </span>
                              )}
                            </td>
                            <td>${(cot?.total || 0).toFixed(2)}</td>
                            <td>
                              <span className={`badge ${getEstadoBadge(cot?.estado || 'borrador')}`}>
                                {cot?.estado || 'borrador'}
                              </span>
                            </td>
                            <td className="acciones">
                              <Button
                                variant="ghost"
                                size="small"
                                icon={<FaEye />}
                                onClick={() => handleVer(cot)}
                              >
                                Ver
                              </Button>
                              {cot?.estado === 'enviada' && (
                                <>
                                  <Button
                                    variant="success"
                                    size="small"
                                    icon={<FaCheck />}
                                    onClick={() => handleAprobar(cot._id)}
                                  >
                                    Aprobar
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="small"
                                    icon={<FaTimes />}
                                    onClick={() => handleRechazar(cot._id)}
                                  >
                                    Rechazar
                                  </Button>
                                </>
                              )}
                              {cot?.estado === 'aprobada' && !cot.ventaGenerada && (
                                <Button
                                  variant="primary"
                                  size="small"
                                  icon={<FaExchangeAlt />}
                                  onClick={() => handleConvertirVenta(cot._id)}
                                >
                                  Convertir a Venta
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Modal para nueva/editar cotización */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Editar Cotización' : 'Nueva Cotización'}
        size="large"
      >
        <div className="cotizacion-modal">
          <form onSubmit={handleSubmit} className="cotizacion-form">
            <div className="form-section">
              <h3 className="section-title">Información del Cliente</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="input-label required">Cliente</label>
                  <select
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(cliente => (
                      <option key={cliente._id} value={cliente._id}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="input-label">Validez (días)</label>
                  <input
                    type="number"
                    name="validezDias"
                    value={formData.validezDias}
                    onChange={handleInputChange}
                    className="input-field"
                    min="1"
                    max="365"
                  />
                  <small className="field-hint">La cotización será válida por este número de días</small>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Términos Comerciales</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="input-label">Condiciones de Pago</label>
                  <input
                    type="text"
                    name="condicionesPago"
                    value={formData.condicionesPago}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Ej: 50% adelanto, 50% contra entrega"
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">Tiempo de Entrega</label>
                  <input
                    type="text"
                    name="tiempoEntrega"
                    value={formData.tiempoEntrega}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Ej: 3-5 días hábiles"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Observaciones</h3>
              <div className="form-group">
                <label className="input-label">Notas adicionales</label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  className="input-field textarea-field"
                  rows="4"
                  placeholder="Observaciones, términos especiales, instrucciones adicionales..."
                />
              </div>
            </div>

            <div className="modal-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {isEditing ? 'Actualizar' : 'Crear'} Cotización
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de detalle */}
      <Modal
        isOpen={modalDetalle}
        onClose={() => setModalDetalle(false)}
        title={`Cotización ${cotizacionSeleccionada?.numeroCotizacion}`}
        size="extra-large"
      >
        {cotizacionSeleccionada && (
          <div className="cotizacion-detalle">
            <div className="detalle-header">
              <div className="detalle-info">
                <div className="info-item">
                  <span className="info-label">Cliente:</span>
                  <span className="info-value">{cotizacionSeleccionada.cliente?.nombre}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Estado:</span>
                  <span className={`badge ${getEstadoBadge(cotizacionSeleccionada.estado)}`}>
                    {cotizacionSeleccionada.estado}
                  </span>
                </div>
              </div>
              <div className="detalle-fechas">
                <div className="info-item">
                  <span className="info-label">Fecha de Cotización:</span>
                  <span className="info-value">
                    {new Date(cotizacionSeleccionada.fechaCotizacion).toLocaleDateString()}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Fecha de Vencimiento:</span>
                  <span className="info-value">
                    {new Date(cotizacionSeleccionada.fechaVencimiento).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="detalle-body">
              <div className="detalle-section">
                <h4 className="section-title">Información Comercial</h4>
                <div className="comercial-info">
                  <div className="info-item">
                    <span className="info-label">Total:</span>
                    <span className="info-value total-amount">${cotizacionSeleccionada.total.toFixed(2)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Validez:</span>
                    <span className="info-value">{cotizacionSeleccionada.validezDias} días</span>
                  </div>
                </div>
              </div>

              {cotizacionSeleccionada.condicionesPago && (
                <div className="detalle-section">
                  <h4 className="section-title">Condiciones de Pago</h4>
                  <div className="section-content">
                    <p>{cotizacionSeleccionada.condicionesPago}</p>
                  </div>
                </div>
              )}

              {cotizacionSeleccionada.tiempoEntrega && (
                <div className="detalle-section">
                  <h4 className="section-title">Tiempo de Entrega</h4>
                  <div className="section-content">
                    <p>{cotizacionSeleccionada.tiempoEntrega}</p>
                  </div>
                </div>
              )}

              {cotizacionSeleccionada.observaciones && (
                <div className="detalle-section">
                  <h4 className="section-title">Observaciones</h4>
                  <div className="section-content">
                    <p>{cotizacionSeleccionada.observaciones}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
