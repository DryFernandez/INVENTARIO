// app/Kardex.jsx
import { useState, useEffect } from 'react';
import Nav from '../components/nav/Nav';
import Bar from '../components/bar/Bar';
import { Card, Table, Button, Input, Modal } from '../components/common';
import kardexService from '../services/kardex';
import { productosAPI, almacenesAPI } from '../services/api';
import '../css/kardex.css';
import { FaSearch, FaFileExport, FaArrowUp, FaArrowDown, FaExchangeAlt, FaFileExcel } from 'react-icons/fa';
import { formatearMoneda, formatearNumero } from '../utils/formatters';
import { exportToExcel, formatDataForExport } from '../utils/excelExport';

export default function Kardex() {
  const [productos, setProductos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState('');
  const [movimientos, setMovimientos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [productosData, almacenesData] = await Promise.all([
        productosAPI.getAll(),
        almacenesAPI.getAll()
      ]);
      setProductos(productosData);
      setAlmacenes(almacenesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const consultarKardex = async () => {
    if (!productoSeleccionado) {
      alert('Seleccione un producto');
      return;
    }

    try {
      setLoading(true);
      const params = {};
      if (almacenSeleccionado) params.almacen = almacenSeleccionado;
      if (fechaInicio) params.fechaInicio = fechaInicio;
      if (fechaFin) params.fechaFin = fechaFin;

      const response = await kardexService.getByProducto(productoSeleccionado, params);
      setMovimientos(response.data.movimientos);
      setResumen(response.data.resumen);
    } catch (error) {
      console.error('Error consultando kardex:', error);
      alert('Error al consultar kardex');
    } finally {
      setLoading(false);
    }
  };

  const exportarKardex = () => {
    if (!movimientos || movimientos.length === 0) return;

    const dataExport = movimientos.map(mov => ({
      'Fecha': new Date(mov.fecha).toLocaleString('es-ES'),
      'Tipo': mov.tipo.replace('_', ' ').toUpperCase(),
      'Operación': mov.operacion.replace('_', ' ').toUpperCase(),
      'Cantidad Entrada': mov.tipo === 'entrada' || mov.tipo === 'traslado_entrada' ? mov.cantidad : 0,
      'Cantidad Salida': mov.tipo === 'salida' || mov.tipo === 'traslado_salida' ? mov.cantidad : 0,
      'Costo Unitario': mov.costoUnitario,
      'Costo Total': mov.costoTotal,
      'Saldo Cantidad': mov.saldoCantidad,
      'Saldo Valor': mov.saldoValor,
      'Costo Promedio': mov.costoPromedio,
      'Referencia': mov.referencia || 'N/A',
      'Observaciones': mov.observaciones || ''
    }));
    
    const productoNombre = productos.find(p => p._id === productoSeleccionado)?.nombre || 'producto';
    const nombreArchivo = `kardex_${productoNombre}_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(dataExport, nombreArchivo, 'Kardex');
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'entrada':
      case 'traslado_entrada':
        return <FaArrowDown style={{ color: 'var(--success)' }} />;
      case 'salida':
      case 'traslado_salida':
        return <FaArrowUp style={{ color: 'var(--error)' }} />;
      case 'ajuste':
        return <FaExchangeAlt style={{ color: 'var(--warning)' }} />;
      default:
        return null;
    }
  };

  const columns = [
    {
      header: 'Fecha',
      accessor: 'fecha',
      render: (row) => new Date(row.fecha).toLocaleString('es-ES')
    },
    {
      header: 'Tipo',
      accessor: 'tipo',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {getTipoIcon(row.tipo)}
          <span>{row.tipo.replace('_', ' ').toUpperCase()}</span>
        </div>
      )
    },
    {
      header: 'Operación',
      accessor: 'operacion',
      render: (row) => row.operacion.replace('_', ' ')
    },
    {
      header: 'Documento',
      accessor: 'numeroDocumento',
      render: (row) => row.numeroDocumento || '-'
    },
    {
      header: 'Cantidad',
      accessor: 'cantidad',
      render: (row) => (
        <span style={{ 
          color: row.tipo.includes('entrada') ? 'var(--success)' : 'var(--error)',
          fontWeight: '600'
        }}>
          {row.tipo.includes('entrada') ? '+' : '-'}{formatearNumero(row.cantidad)}
        </span>
      )
    },
    {
      header: 'Costo Unit.',
      accessor: 'costoUnitario',
      render: (row) => formatearMoneda(row.costoUnitario)
    },
    {
      header: 'Costo Total',
      accessor: 'costoTotal',
      render: (row) => formatearMoneda(row.costoTotal)
    },
    {
      header: 'Saldo Cant.',
      accessor: 'saldoCantidad',
      render: (row) => <strong>{formatearNumero(row.saldoCantidad)}</strong>
    },
    {
      header: 'Saldo Valor',
      accessor: 'saldoValor',
      render: (row) => <strong>{formatearMoneda(row.saldoValor)}</strong>
    },
    {
      header: 'Costo Prom.',
      accessor: 'costoPromedio',
      render: (row) => formatearMoneda(row.costoPromedio)
    },
    {
      header: 'Usuario',
      accessor: 'usuario',
      render: (row) => row.usuario?.nombre || '-'
    }
  ];

  return (
    <div className="kardex-container">
      <Bar />
      <main className="kardex-main">
        <Nav />
        <div className="kardex-content">
          <div className="kardex-header">
            <div>
              <h1>Kardex de Inventario</h1>
              <p className="subtitle">Movimientos detallados de productos</p>
            </div>
          </div>

          <Card title="Filtros de Búsqueda">
            <div className="filtros-kardex">
              <div className="form-row">
                <div className="form-group">
                  <label>Producto *</label>
                  <select
                    value={productoSeleccionado}
                    onChange={(e) => setProductoSeleccionado(e.target.value)}
                    className="form-control"
                  >
                    <option value="">Seleccione un producto</option>
                    {productos.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.sku} - {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Almacén</label>
                  <select
                    value={almacenSeleccionado}
                    onChange={(e) => setAlmacenSeleccionado(e.target.value)}
                    className="form-control"
                  >
                    <option value="">Todos los almacenes</option>
                    {almacenes.map(a => (
                      <option key={a._id} value={a._id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Fecha Inicio</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Fecha Fin</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="acciones-filtros">
                <Button
                  variant="primary"
                  onClick={consultarKardex}
                  icon={<FaSearch />}
                  disabled={loading || !productoSeleccionado}
                >
                  Consultar
                </Button>
                
                {movimientos && movimientos.length > 0 && (
                  <Button
                    variant="success"
                    onClick={exportarKardex}
                    icon={<FaFileExcel />}
                  >
                    Exportar a Excel
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {resumen && (
            <div className="resumen-kardex">
              <Card>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total Movimientos</span>
                    <span className="stat-value">{resumen.totalMovimientos}</span>
                  </div>
                  <div className="stat-item success">
                    <span className="stat-label">Total Entradas</span>
                    <span className="stat-value">+{formatearNumero(resumen.totalEntradas)}</span>
                  </div>
                  <div className="stat-item danger">
                    <span className="stat-label">Total Salidas</span>
                    <span className="stat-value">-{formatearNumero(resumen.totalSalidas)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Saldo Actual</span>
                    <span className="stat-value">{formatearNumero(resumen.saldoActual)}</span>
                  </div>
                  <div className="stat-item primary">
                    <span className="stat-label">Valor Actual</span>
                    <span className="stat-value">{formatearMoneda(resumen.valorActual)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Costo Promedio</span>
                    <span className="stat-value">{formatearMoneda(resumen.costoPromedioActual)}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {loading ? (
            <div className="loading">Cargando movimientos...</div>
          ) : movimientos.length > 0 ? (
            <Card title="Movimientos de Kardex">
              <Table
                columns={columns}
                data={movimientos}
                showActions={false}
              />
            </Card>
          ) : productoSeleccionado && (
            <Card>
              <div className="no-data">
                No hay movimientos registrados para este producto
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
