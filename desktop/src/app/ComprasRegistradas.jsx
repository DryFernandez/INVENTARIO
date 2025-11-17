import React, { useState, useEffect } from 'react'
import '../css/comprasRegistradas.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'
import Card from '../components/common/Card'
import Table from '../components/common/Table'
import Modal from '../components/common/Modal'
import { IoMdSearch, IoMdEye } from 'react-icons/io'
import { FaFileInvoice, FaBoxOpen, FaTruck } from 'react-icons/fa'
import { comprasAPI } from '../services/api'
import { formatearMoneda, formatearMonedaCompleta } from '../utils/formatters'

function ComprasRegistradas() {
  const [compras, setCompras] = useState([]);
  const [comprasFiltradas, setComprasFiltradas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    cargarCompras();
  }, []);

  useEffect(() => {
    filtrarCompras();
  }, [searchTerm, compras]);

  const cargarCompras = async () => {
    try {
      setLoading(true);
      const response = await comprasAPI.getAll();
      const data = Array.isArray(response) ? response : (response.data || []);
      setCompras(data);
      setComprasFiltradas(data);
    } catch (error) {
      console.error('Error cargando compras:', error);
      setCompras([]);
      setComprasFiltradas([]);
      alert('Error al cargar las compras');
    } finally {
      setLoading(false);
    }
  };

  const filtrarCompras = () => {
    if (!searchTerm) {
      setComprasFiltradas(compras);
      return;
    }

    const filtered = (compras || []).filter(compra =>
      compra.numeroFactura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compra.proveedor?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compra.proveedor?.ruc?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setComprasFiltradas(filtered);
  };

  const verDetalle = (compra) => {
    setCompraSeleccionada(compra);
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
      key: 'numeroFactura', 
      header: 'N° Factura',
      render: (compra) => (
        <div className='factura-cell'>
          <FaFileInvoice />
          <span>{compra.numeroFactura}</span>
        </div>
      )
    },
    { 
      key: 'fechaCompra', 
      header: 'Fecha',
      render: (compra) => formatearFecha(compra.fechaCompra)
    },
    { 
      key: 'proveedor', 
      header: 'Proveedor',
      render: (compra) => (
        <div>
          <div className='proveedor-nombre'>{compra.proveedor?.nombre || 'N/A'}</div>
          {compra.proveedor?.ruc && (
            <div className='proveedor-ruc'>{compra.proveedor.ruc}</div>
          )}
        </div>
      )
    },
    { 
      key: 'items', 
      header: 'Productos',
      render: (compra) => (
        <div className='items-count'>
          <FaBoxOpen />
          <span>{compra.items?.length || 0} items</span>
        </div>
      )
    },
    { 
      key: 'total', 
      header: 'Total',
      render: (compra) => (
        <span className='total-amount'>{formatearMoneda(compra.total)}</span>
      )
    },
    { 
      key: 'estado', 
      header: 'Estado',
      render: (compra) => (
        <span className={`badge badge-${compra.estado}`}>
          {compra.estado}
        </span>
      )
    },
    { 
      key: 'pagado', 
      header: 'Pago',
      render: (compra) => (
        <span className={`badge-pago ${compra.pagado ? 'pagado' : 'pendiente'}`}>
          {compra.pagado ? '✓ Pagado' : '⏳ Pendiente'}
        </span>
      )
    }
  ];

  const calcularTotalCompras = () => {
    return (comprasFiltradas || []).reduce((sum, compra) => sum + (compra.total || 0), 0);
  };

  const calcularComprasPendientes = () => {
    return (comprasFiltradas || []).filter(c => !c.pagado).length;
  };

  const calcularProductosTotal = () => {
    return (comprasFiltradas || []).reduce((sum, compra) => {
      return sum + (compra.items?.reduce((itemSum, item) => itemSum + item.cantidad, 0) || 0);
    }, 0);
  };

  return (
    <div className='compras-registradas-container'>
      <Nav />
      <main className='compras-registradas-main'>
        <Bar />
        <div className='compras-registradas-content'>
          <div className='compras-registradas-header'>
            <div>
              <h1>Compras Registradas</h1>
              <p>Historial completo de todas las compras realizadas</p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className='stats-grid'>
            <Card className='stat-card'>
              <div className='stat-icon total'>
                <FaFileInvoice />
              </div>
              <div className='stat-info'>
                <p className='stat-label'>Total Compras</p>
                <h3 className='stat-value'>{formatearMoneda(calcularTotalCompras())}</h3>
                <span className='stat-subtitle'>{comprasFiltradas.length} transacciones</span>
              </div>
            </Card>

            <Card className='stat-card'>
              <div className='stat-icon pendiente'>
                <FaTruck />
              </div>
              <div className='stat-info'>
                <p className='stat-label'>Pagos Pendientes</p>
                <h3 className='stat-value'>{calcularComprasPendientes()}</h3>
                <span className='stat-subtitle'>
                  {formatearMoneda((comprasFiltradas || [])
                    .filter(c => !c.pagado)
                    .reduce((sum, c) => sum + c.total, 0))}
                </span>
              </div>
            </Card>

            <Card className='stat-card'>
              <div className='stat-icon productos'>
                <FaBoxOpen />
              </div>
              <div className='stat-info'>
                <p className='stat-label'>Productos Comprados</p>
                <h3 className='stat-value'>{calcularProductosTotal()}</h3>
                <span className='stat-subtitle'>unidades totales</span>
              </div>
            </Card>
          </div>

          {/* Tabla de compras */}
          <Card>
            <div className='search-container'>
              <div className='search-box'>
                <IoMdSearch className='search-icon' />
                <input
                  type='text'
                  className='search-input'
                  placeholder='Buscar por factura, proveedor o RUC...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className='loading-state'>Cargando compras...</div>
            ) : (
              <Table 
                columns={columns} 
                data={comprasFiltradas}
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

      {/* Modal de detalle de compra */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCompraSeleccionada(null);
        }}
        title="Detalle de Compra"
        size="large"
      >
        {compraSeleccionada && (
          <div className='compra-detalle'>
            <div className='detalle-header'>
              <div className='detalle-item'>
                <label>N° Factura:</label>
                <span className='factura-numero'>{compraSeleccionada.numeroFactura}</span>
              </div>
              <div className='detalle-item'>
                <label>Fecha:</label>
                <span>{formatearFecha(compraSeleccionada.fechaCompra)}</span>
              </div>
              <div className='detalle-item'>
                <label>Estado:</label>
                <span className={`badge badge-${compraSeleccionada.estado}`}>
                  {compraSeleccionada.estado}
                </span>
              </div>
              <div className='detalle-item'>
                <label>Pago:</label>
                <span className={`badge-pago ${compraSeleccionada.pagado ? 'pagado' : 'pendiente'}`}>
                  {compraSeleccionada.pagado ? '✓ Pagado' : '⏳ Pendiente'}
                </span>
              </div>
            </div>

            <div className='detalle-section'>
              <h4>Información del Proveedor</h4>
              <div className='proveedor-info'>
                <p><strong>Nombre:</strong> {compraSeleccionada.proveedor?.nombre}</p>
                {compraSeleccionada.proveedor?.ruc && (
                  <p><strong>RUC:</strong> {compraSeleccionada.proveedor.ruc}</p>
                )}
                {compraSeleccionada.proveedor?.email && (
                  <p><strong>Email:</strong> {compraSeleccionada.proveedor.email}</p>
                )}
                {compraSeleccionada.proveedor?.telefono && (
                  <p><strong>Teléfono:</strong> {compraSeleccionada.proveedor.telefono}</p>
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
                  {compraSeleccionada.items?.map((item, index) => (
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
              <div className='totales'>
                <div className='total-row total-final'>
                  <span>Total:</span>
                  <span>{formatearMonedaCompleta(compraSeleccionada.total)}</span>
                </div>
              </div>
            </div>

            {compraSeleccionada.usuario && (
              <div className='detalle-footer'>
                <p className='usuario-info'>
                  Registrado por: <strong>{compraSeleccionada.usuario.nombre}</strong>
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ComprasRegistradas
