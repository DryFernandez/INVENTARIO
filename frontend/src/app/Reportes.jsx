// app/Reportes.jsx
import { useState } from 'react';
import Nav from '../components/nav/Nav';
import Bar from '../components/bar/Bar';
import reportesService from '../services/reportes';
import { Button, Card, Table } from '../components/common';
import { FaFileExcel } from 'react-icons/fa';
import { exportToExcel, formatDataForExport } from '../utils/excelExport';
import '../css/reportes.css';

export default function Reportes() {
  const [tipoReporte, setTipoReporte] = useState('valorizacion');
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const generarReporte = async () => {
    try {
      setLoading(true);
      const filtros = { fechaInicio, fechaFin };
      
      let resultado;
      switch(tipoReporte) {
        case 'valorizacion':
          resultado = await reportesService.getValorizacion(filtros);
          break;
        case 'mas-vendidos':
          resultado = await reportesService.getMasVendidos({ ...filtros, limit: 20 });
          break;
        case 'rotacion':
          resultado = await reportesService.getRotacion(filtros);
          break;
        case 'rotacion-lenta':
          resultado = await reportesService.getRotacionLenta(90);
          break;
        case 'margenes':
          resultado = await reportesService.getMargenes(filtros);
          break;
        case 'proyeccion':
          resultado = await reportesService.getProyeccionCompras({ dias: 30 });
          break;
      }
      
      setDatos(resultado);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const exportarReporte = () => {
    if (!datos) return;

    const nombreArchivo = `reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}`;
    
    switch(tipoReporte) {
      case 'valorizacion': {
        const dataExport = formatDataForExport(datos.productos, {
          codigo: 'Código',
          nombre: 'Producto',
          categoria: 'Categoría',
          stock: 'Stock',
          costoUnitario: 'Costo Unit.',
          costoTotal: 'Costo Total',
          precioVenta: 'Precio Venta',
          valorVenta: 'Valor Venta'
        });
        exportToExcel(dataExport, nombreArchivo, 'Valorización');
        break;
      }
      case 'mas-vendidos': {
        const dataExport = formatDataForExport(datos.productos, {
          nombre: 'Producto',
          codigo: 'Código',
          cantidadVendida: 'Cantidad Vendida',
          ingresoTotal: 'Ingreso Total',
          numeroVentas: 'Núm. Ventas'
        });
        exportToExcel(dataExport, nombreArchivo, 'Productos Más Vendidos');
        break;
      }
      case 'rotacion': {
        const dataExport = formatDataForExport(datos.productos, {
          nombre: 'Producto',
          codigo: 'Código',
          ventasMensuales: 'Ventas Mensuales',
          stockPromedio: 'Stock Promedio',
          rotacion: 'Rotación',
          diasInventario: 'Días Inventario'
        });
        exportToExcel(dataExport, nombreArchivo, 'Rotación de Inventario');
        break;
      }
      case 'rotacion-lenta': {
        const dataExport = formatDataForExport(datos.productos, {
          nombre: 'Producto',
          codigo: 'Código',
          stock: 'Stock Actual',
          diasSinMovimiento: 'Días Sin Mov.',
          valorInmovilizado: 'Valor Inmovilizado'
        });
        exportToExcel(dataExport, nombreArchivo, 'Rotación Lenta');
        break;
      }
      case 'margenes': {
        const dataExport = formatDataForExport(datos.productos, {
          nombre: 'Producto',
          codigo: 'Código',
          costoPromedio: 'Costo Promedio',
          precioVenta: 'Precio Venta',
          margenUnitario: 'Margen Unit.',
          porcentajeMargen: '% Margen'
        });
        exportToExcel(dataExport, nombreArchivo, 'Márgenes');
        break;
      }
      case 'proyeccion': {
        const dataExport = formatDataForExport(datos.productos, {
          nombre: 'Producto',
          codigo: 'Código',
          stockActual: 'Stock Actual',
          promedioVentaDiaria: 'Promedio Venta Diaria',
          diasParaAgotarse: 'Días Para Agotarse',
          cantidadSugerida: 'Cantidad Sugerida'
        });
        exportToExcel(dataExport, nombreArchivo, 'Proyección de Compras');
        break;
      }
    }
  };

  const renderValorizacion = () => {
    if (!datos) return null;
    
    return (
      <div>
        <div className="totales-grid">
          <Card>
            <h3>Valor Costo</h3>
            <p className="valor-grande">${datos.totales.totalCosto.toFixed(2)}</p>
          </Card>
          <Card>
            <h3>Valor Venta</h3>
            <p className="valor-grande">${datos.totales.totalVenta.toFixed(2)}</p>
          </Card>
          <Card>
            <h3>Total Productos</h3>
            <p className="valor-grande">{datos.totales.totalProductos}</p>
          </Card>
          <Card>
            <h3>Total Unidades</h3>
            <p className="valor-grande">{datos.totales.totalUnidades}</p>
          </Card>
        </div>
        
        <Card className="mt-3">
          <Table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Stock</th>
                <th>Costo Unit.</th>
                <th>Valor Total</th>
                <th>Precio Venta</th>
                <th>Margen %</th>
              </tr>
            </thead>
            <tbody>
              {datos.productos.map(p => (
                <tr key={p.sku}>
                  <td>{p.sku}</td>
                  <td>{p.nombre}</td>
                  <td>{p.stock}</td>
                  <td>${p.costo.toFixed(2)}</td>
                  <td>${p.valorTotal.toFixed(2)}</td>
                  <td>${p.precio.toFixed(2)}</td>
                  <td className={p.porcentajeMargen > 0 ? 'text-success' : 'text-danger'}>
                    {p.porcentajeMargen}%
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    );
  };

  const renderMasVendidos = () => {
    if (!datos) return null;
    
    return (
      <Card>
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Cantidad Vendida</th>
              <th>Ingresos Totales</th>
              <th>N° Ventas</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((item, idx) => (
              <tr key={item._id}>
                <td>{idx + 1}</td>
                <td>{item.producto?.nombre}</td>
                <td>{item.totalVendido}</td>
                <td>${item.totalIngresos.toFixed(2)}</td>
                <td>{item.numeroVentas}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    );
  };

  const renderRotacion = () => {
    if (!datos) return null;
    
    return (
      <Card>
        <Table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Stock Actual</th>
              <th>Vendido</th>
              <th>Índice Rotación</th>
              <th>Días en Inventario</th>
              <th>Clasificación</th>
            </tr>
          </thead>
          <tbody>
            {datos.map(item => (
              <tr key={item.sku}>
                <td>{item.nombre}</td>
                <td>{item.stockActual}</td>
                <td>{item.cantidadVendida}</td>
                <td>{item.indiceRotacion}</td>
                <td>{item.diasInventario}</td>
                <td>
                  <span className={`badge badge-${item.clasificacion === 'Alta' ? 'success' : item.clasificacion === 'Media' ? 'warning' : 'danger'}`}>
                    {item.clasificacion}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    );
  };

  const renderProyeccion = () => {
    if (!datos) return null;
    
    return (
      <div>
        <div className="totales-grid mb-3">
          <Card>
            <h3>Productos a Reponer</h3>
            <p className="valor-grande">{datos.total}</p>
          </Card>
          <Card>
            <h3>Inversión Estimada</h3>
            <p className="valor-grande">${datos.inversionEstimada.toFixed(2)}</p>
          </Card>
        </div>
        
        <Card>
          <Table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock Actual</th>
                <th>Consumo/Día</th>
                <th>Stock Futuro</th>
                <th>Cantidad Sugerida</th>
                <th>Costo</th>
                <th>Prioridad</th>
              </tr>
            </thead>
            <tbody>
              {datos.proyecciones.map(p => (
                <tr key={p.sku}>
                  <td>{p.nombre}</td>
                  <td>{p.stockActual}</td>
                  <td>{p.consumoDiario}</td>
                  <td className={p.stockFuturo < 0 ? 'text-danger' : ''}>
                    {p.stockFuturo}
                  </td>
                  <td><strong>{p.cantidadSugerida}</strong></td>
                  <td>${p.costoEstimado.toFixed(2)}</td>
                  <td>
                    <span className={`badge badge-${p.prioridad === 'Urgente' ? 'danger' : p.prioridad === 'Alta' ? 'warning' : 'info'}`}>
                      {p.prioridad}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    );
  };

  return (
    <div className="reportes-container">
      <Bar />
      <main className="reportes-main">
        <Nav />
        <div className="reportes-content">
      <h1>📊 Reportes Avanzados</h1>

      <Card className="filtros-card">
        <div className="filtros-grid">
          <div>
            <label>Tipo de Reporte</label>
            <select value={tipoReporte} onChange={(e) => setTipoReporte(e.target.value)}>
              <option value="valorizacion">Valorización de Inventario</option>
              <option value="mas-vendidos">Productos Más Vendidos</option>
              <option value="rotacion">Rotación de Inventario</option>
              <option value="rotacion-lenta">Productos de Rotación Lenta</option>
              <option value="margenes">Márgenes de Ganancia</option>
              <option value="proyeccion">Proyección de Compras</option>
            </select>
          </div>
          
          {!['rotacion-lenta', 'proyeccion', 'valorizacion'].includes(tipoReporte) && (
            <>
              <div>
                <label>Fecha Inicio</label>
                <input 
                  type="date" 
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div>
                <label>Fecha Fin</label>
                <input 
                  type="date" 
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </>
          )}
          
          <div className="btn-container">
            <Button onClick={generarReporte} disabled={loading}>
              {loading ? 'Generando...' : '📈 Generar Reporte'}
            </Button>
            
            {datos && (
              <Button onClick={exportarReporte} variant="success">
                <FaFileExcel /> Exportar a Excel
              </Button>
            )}
          </div>
        </div>
      </Card>

      {loading && <div className="loading">Generando reporte...</div>}
      
      {datos && !loading && (
        <div className="resultados">
          {tipoReporte === 'valorizacion' && renderValorizacion()}
          {tipoReporte === 'mas-vendidos' && renderMasVendidos()}
          {tipoReporte === 'rotacion' && renderRotacion()}
          {tipoReporte === 'proyeccion' && renderProyeccion()}
          {/* Agregar renders para los demás reportes */}
        </div>
      )}
        </div>
      </main>
    </div>
  );
}
