import React, { useState, useEffect } from 'react'
import '../css/ventasRegistradas.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'
import Card from '../components/common/Card'
import Table from '../components/common/Table'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import { IoMdSearch, IoMdEye } from 'react-icons/io'
import { FaFileInvoice, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa'
import { ventasAPI } from '../services/api'
import { formatearMoneda, formatearMonedaCompleta } from '../utils/formatters'

function VentasRegistradas() {
  const [ventas, setVentas] = useState([]);
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    cargarVentas();
  }, []);

  useEffect(() => {
    filtrarVentas();
  }, [searchTerm, ventas]);

  const cargarVentas = async () => {
    try {
      setLoading(true);
      const response = await ventasAPI.getAll();
      const data = Array.isArray(response) ? response : (response.data || []);
      setVentas(data);
      setVentasFiltradas(data);
    } catch (error) {
      console.error('Error cargando ventas:', error);
      setVentas([]);
      setVentasFiltradas([]);
      alert('Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  const filtrarVentas = () => {
    if (!searchTerm) {
      setVentasFiltradas(ventas);
      return;
    }

    const filtered = (ventas || []).filter(venta =>
      venta.numeroComprobante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.cliente?.ruc?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setVentasFiltradas(filtered);
  };

  const verDetalle = (venta) => {
    setVentaSeleccionada(venta);
    setIsModalOpen(true);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    { 
      key: 'numeroComprobante', 
      header: 'Comprobante',
      render: (venta) => (
        <div className='comprobante-cell'>
          <FaFileInvoice />
          <span>{venta.numeroComprobante}</span>
        </div>
      )
    },
    { 
      key: 'fechaVenta', 
      header: 'Fecha',
      render: (venta) => formatearFecha(venta.fechaVenta)
    },
    { 
      key: 'cliente', 
      header: 'Cliente',
      render: (venta) => (
        <div>
          <div className='cliente-nombre'>{venta.cliente?.nombre || 'N/A'}</div>
          {venta.cliente?.ruc && (
            <div className='cliente-ruc'>{venta.cliente.ruc}</div>
          )}
        </div>
      )
    },
    { 
      key: 'items', 
      header: 'Productos',
      render: (venta) => `${venta.items?.length || 0} items`
    },
    { 
      key: 'metodoPago', 
      header: 'Método de Pago',
      render: (venta) => (
        <div className={`metodo-pago ${venta.metodoPago}`}>
          {venta.metodoPago === 'efectivo' ? <FaMoneyBillWave /> : <FaCreditCard />}
          <span>{venta.metodoPago === 'efectivo' ? 'Efectivo' : 'Tarjeta'}</span>
        </div>
      )
    },
    { 
      key: 'total', 
      header: 'Total',
      render: (venta) => (
        <span className='total-amount'>{formatearMoneda(venta.total)}</span>
      )
    },
    { 
      key: 'estado', 
      header: 'Estado',
      render: (venta) => (
        <span className={`badge badge-${venta.estado}`}>
          {venta.estado}
        </span>
      )
    }
  ];

  const calcularTotalVentas = () => {
    return (ventasFiltradas || []).reduce((sum, venta) => sum + (venta.total || 0), 0);
  };

  const calcularVentasEfectivo = () => {
    return (ventasFiltradas || []).filter(v => v.metodoPago === 'efectivo').length;
  };

  const calcularVentasTarjeta = () => {
    return (ventasFiltradas || []).filter(v => v.metodoPago === 'tarjeta').length;
  };

  return (
    <div className='ventas-registradas-container'>
      <Nav />
      <main className='ventas-registradas-main'>
        <Bar />
        <div className='ventas-registradas-content'>
          <div className='ventas-registradas-header'>
            <div>
              <h1>Ventas Registradas</h1>
              <p>Historial completo de todas las ventas realizadas</p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className='stats-grid'>
            <Card className='stat-card'>
              <div className='stat-icon total'>
                <FaFileInvoice />
              </div>
              <div className='stat-info'>
                <p className='stat-label'>Total Ventas</p>
                <h3 className='stat-value'>{formatearMoneda(calcularTotalVentas())}</h3>
                <span className='stat-subtitle'>{ventasFiltradas.length} transacciones</span>
              </div>
            </Card>

            <Card className='stat-card'>
              <div className='stat-icon efectivo'>
                <FaMoneyBillWave />
              </div>
              <div className='stat-info'>
                <p className='stat-label'>Ventas en Efectivo</p>
                <h3 className='stat-value'>{calcularVentasEfectivo()}</h3>
                <span className='stat-subtitle'>
                  ${(ventasFiltradas || [])
                    .filter(v => v.metodoPago === 'efectivo')
                    .reduce((sum, v) => sum + v.total, 0)
                    .toFixed(2)}
                </span>
              </div>
            </Card>

            <Card className='stat-card'>
              <div className='stat-icon tarjeta'>
                <FaCreditCard />
              </div>
              <div className='stat-info'>
                <p className='stat-label'>Ventas con Tarjeta</p>
                <h3 className='stat-value'>{calcularVentasTarjeta()}</h3>
                <span className='stat-subtitle'>
                  ${(ventasFiltradas || [])
                    .filter(v => v.metodoPago === 'tarjeta')
                    .reduce((sum, v) => sum + v.total, 0)
                    .toFixed(2)}
                </span>
              </div>
            </Card>
          </div>

          {/* Tabla de ventas */}
          <Card>
            <div className='search-container'>
              <div className='search-box'>
                <IoMdSearch className='search-icon' />
                <input
                  type='text'
                  className='search-input'
                  placeholder='Buscar por comprobante, cliente o RUC...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className='loading-state'>Cargando ventas...</div>
            ) : (
              <Table 
                columns={columns} 
                data={ventasFiltradas}
                actions={[
                  {
                    icon: <IoMdEye />,
                    onClick: verDetalle,
                    variant: 'info',
                    title: 'Ver detalle'
                  }
                ]}
              />
            )}
          </Card>
        </div>
      </main>

      {/* Modal de detalle de venta */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setVentaSeleccionada(null);
        }}
        title="Detalle de Venta"
        size="large"
      >
        {ventaSeleccionada && (
          <div className='venta-detalle'>
            <div className='detalle-header'>
              <div className='detalle-item'>
                <label>Comprobante:</label>
                <span className='comprobante-numero'>{ventaSeleccionada.numeroComprobante}</span>
              </div>
              <div className='detalle-item'>
                <label>Fecha:</label>
                <span>{formatearFecha(ventaSeleccionada.fechaVenta)}</span>
              </div>
              <div className='detalle-item'>
                <label>Estado:</label>
                <span className={`badge badge-${ventaSeleccionada.estado}`}>
                  {ventaSeleccionada.estado}
                </span>
              </div>
            </div>

            <div className='detalle-section'>
              <h4>Información del Cliente</h4>
              <div className='cliente-info'>
                <p><strong>Nombre:</strong> {ventaSeleccionada.cliente?.nombre}</p>
                {ventaSeleccionada.cliente?.ruc && (
                  <p><strong>RUC/DNI:</strong> {ventaSeleccionada.cliente.ruc}</p>
                )}
                {ventaSeleccionada.cliente?.email && (
                  <p><strong>Email:</strong> {ventaSeleccionada.cliente.email}</p>
                )}
                {ventaSeleccionada.cliente?.telefono && (
                  <p><strong>Teléfono:</strong> {ventaSeleccionada.cliente.telefono}</p>
                )}
              </div>
            </div>

            <div className='detalle-section'>
              <h4>Productos</h4>
              <table className='productos-table'>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {ventaSeleccionada.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.producto?.nombre || 'N/A'}</td>
                      <td>{item.producto?.sku || 'N/A'}</td>
                      <td>{item.cantidad}</td>
                      <td>{formatearMonedaCompleta(item.precioUnitario)}</td>
                      <td>{formatearMonedaCompleta(item.cantidad * item.precioUnitario)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='detalle-section'>
              <h4>Pago</h4>
              <div className='pago-info'>
                <div className='metodo-pago-detalle'>
                  {ventaSeleccionada.metodoPago === 'efectivo' ? (
                    <FaMoneyBillWave />
                  ) : (
                    <FaCreditCard />
                  )}
                  <span>
                    {ventaSeleccionada.metodoPago === 'efectivo' ? 'Efectivo' : 'Tarjeta'}
                  </span>
                </div>

                {ventaSeleccionada.metodoPago === 'tarjeta' && ventaSeleccionada.datosTarjeta && (
                  <div className='tarjeta-info'>
                    <p><strong>Tarjeta:</strong> {ventaSeleccionada.datosTarjeta.numeroTarjeta}</p>
                    <p><strong>Titular:</strong> {ventaSeleccionada.datosTarjeta.titular}</p>
                  </div>
                )}
              </div>

              <div className='totales'>
                <div className='total-row'>
                  <span>Subtotal:</span>
                  <span>${ventaSeleccionada.subtotal?.toFixed(2)}</span>
                </div>
                <div className='total-row'>
                  <span>IVA (16%):</span>
                  <span>${ventaSeleccionada.impuesto?.toFixed(2)}</span>
                </div>
                <div className='total-row total-final'>
                  <span>Total:</span>
                  <span>${ventaSeleccionada.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {ventaSeleccionada.usuario && (
              <div className='detalle-footer'>
                <p className='vendedor-info'>
                  Vendido por: <strong>{ventaSeleccionada.usuario.nombre}</strong>
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default VentasRegistradas
