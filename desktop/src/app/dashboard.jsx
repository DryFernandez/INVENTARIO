import React, { useState, useEffect } from 'react'
import '../css/dashboard.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'
import Card from '../components/common/Card'
import { productosAPI, categoriasAPI, almacenesAPI, inventarioAlmacenAPI, ventasAPI, comprasAPI } from '../services/api'
import { 
  FaBoxes, 
  FaShoppingCart, 
  FaDollarSign, 
  FaExclamationTriangle,
  FaArrowUp,
  FaWarehouse,
  FaChartLine
} from 'react-icons/fa'
import { formatearNumero, formatearMoneda } from '../utils/formatters'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar as BarGraph, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

function Dashboard() {
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosActivos: 0,
    stockBajo: 0,
    ventasHoy: 0,
    ventasMes: 0,
    comprasMes: 0,
    almacenes: 0,
    categorias: 0
  });
  const [productosStockBajo, setProductosStockBajo] = useState([]);
  const [inventarioPorAlmacen, setInventarioPorAlmacen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventasPorMes, setVentasPorMes] = useState([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [categoriaDistribucion, setCategoriaDistribucion] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [productos, categorias, almacenesRaw, estadisticas, ventasData, comprasData] = await Promise.all([
          productosAPI.getAll(),
          categoriasAPI.getAll(),
          almacenesAPI.getAll(),
          inventarioAlmacenAPI.getEstadisticas().catch(() => null),
          ventasAPI.getAll().catch(() => []),
          comprasAPI.getAll().catch(() => [])
        ]);

        // Normalizar datos de ventas y compras (pueden venir como objeto o array)
        const ventas = Array.isArray(ventasData) ? ventasData : (ventasData?.data || []);
        const compras = Array.isArray(comprasData) ? comprasData : (comprasData?.data || []);

        // Filtrar solo almacenes activos
        const almacenes = (almacenesRaw || []).filter(a => a.activo !== false);

        const productosActivos = productos.filter(p => p.activo);
        const stockBajo = productos.filter(p => p.stock <= p.stockMinimo);
        
        // Calcular estadísticas de ventas
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        
        const ventasHoy = (ventas || []).filter(v => {
          const fechaVenta = new Date(v.fechaVenta || v.createdAt);
          return fechaVenta >= hoy;
        });
        
        const ventasDelMes = (ventas || []).filter(v => {
          const fechaVenta = new Date(v.fechaVenta || v.createdAt);
          return fechaVenta >= inicioMes;
        });
        
        const comprasDelMes = (compras || []).filter(c => {
          const fechaCompra = new Date(c.fechaCompra || c.createdAt);
          return fechaCompra >= inicioMes;
        });
        
        const totalVentasMes = ventasDelMes.reduce((sum, v) => sum + (v.total || 0), 0);
        const totalComprasMes = comprasDelMes.reduce((sum, c) => sum + (c.total || 0), 0);
        const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + (v.total || 0), 0);
        
        // Usar estadísticas de inventario si están disponibles
        let inventarioAlmacenes = [];
        
        if (estadisticas?.data?.porAlmacen) {
          inventarioAlmacenes = estadisticas.data.porAlmacen;
        } else {
          // Fallback: calcular desde productos
          inventarioAlmacenes = almacenes.map(almacen => {
            const productosAlmacen = productos.filter(p => p.almacen?._id === almacen._id || p.almacen === almacen._id);
            const totalProductos = productosAlmacen.length;
            const totalStock = productosAlmacen.reduce((sum, p) => sum + (p.stock || 0), 0);
            const valorTotal = productosAlmacen.reduce((sum, p) => sum + ((p.stock || 0) * (p.precio || 0)), 0);
            
            return {
              _id: almacen._id,
              almacen: almacen.nombre,
              ubicacion: almacen.ubicacion,
              totalProductos,
              stockTotal: totalStock,
              valorTotal,
              productosStockBajo: productosAlmacen.filter(p => p.stock <= p.stockMinimo).length
            };
          });
        }
        
        setStats({
          totalProductos: estadisticas?.data?.global?.totalProductos || productos.length,
          productosActivos: productosActivos.length,
          stockBajo: estadisticas?.data?.global?.productosStockBajo || stockBajo.length,
          ventasHoy: ventasHoy.length,
          ventasHoyTotal: totalVentasHoy,
          ventasMes: totalVentasMes,
          comprasMes: totalComprasMes,
          almacenes: almacenes.length,
          categorias: categorias.length
        });

        setProductosStockBajo(stockBajo.slice(0, 3));
        setInventarioPorAlmacen(inventarioAlmacenes);

        // Calcular ventas por mes (últimos 6 meses)
        const ventasPorMesData = calcularVentasPorMes(ventas);
        setVentasPorMes(ventasPorMesData);

        // Productos más vendidos
        const topProductos = calcularProductosMasVendidos(ventas, productos);
        setProductosMasVendidos(topProductos);

        // Distribución por categoría
        const distribucion = calcularDistribucionCategorias(productos, categorias);
        setCategoriaDistribucion(distribucion);

      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const calcularVentasPorMes = (ventas) => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const datos = [];

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mes = meses[fecha.getMonth()];
      const año = fecha.getFullYear();
      
      const ventasMes = ventas.filter(v => {
        const fechaVenta = new Date(v.fechaVenta || v.createdAt);
        return fechaVenta.getMonth() === fecha.getMonth() && 
               fechaVenta.getFullYear() === fecha.getFullYear();
      });

      const total = ventasMes.reduce((sum, v) => sum + (v.total || 0), 0);
      
      datos.push({
        mes: `${mes} ${año}`,
        ventas: total,
        cantidad: ventasMes.length
      });
    }

    return datos;
  };

  const calcularProductosMasVendidos = (ventas, productos) => {
    const productosVentas = {};

    ventas.forEach(venta => {
      if (venta.productos && Array.isArray(venta.productos)) {
        venta.productos.forEach(item => {
          const prodId = item.producto?._id || item.producto;
          if (prodId) {
            if (!productosVentas[prodId]) {
              productosVentas[prodId] = {
                id: prodId,
                cantidad: 0,
                total: 0
              };
            }
            productosVentas[prodId].cantidad += item.cantidad || 0;
            productosVentas[prodId].total += (item.cantidad || 0) * (item.precio || 0);
          }
        });
      }
    });

    const topProductos = Object.values(productosVentas)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)
      .map(p => {
        const producto = productos.find(prod => prod._id === p.id);
        return {
          nombre: producto?.nombre || 'Producto',
          cantidad: p.cantidad,
          total: p.total
        };
      });

    return topProductos;
  };

  const calcularDistribucionCategorias = (productos, categorias) => {
    const distribucion = {};

    productos.forEach(producto => {
      const catId = producto.categoria?._id || producto.categoria;
      if (catId) {
        if (!distribucion[catId]) {
          const categoria = categorias.find(c => c._id === catId);
          distribucion[catId] = {
            nombre: categoria?.nombre || 'Sin categoría',
            valor: 0
          };
        }
        distribucion[catId].valor++;
      }
    });

    return Object.values(distribucion).slice(0, 8);
  };

  if (loading) {
    return (
      <div className='dashboard-container'>
        <Bar />
        <main className='dashboard-main'>
          <Nav />
          <div className='dashboard-content'>
            <div className='loading'>Cargando datos...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='dashboard-container'>
      <Bar />
      <main className='dashboard-main'>
        <Nav />
        <div className='dashboard-content'>
          <div className='dashboard-header'>
            <h1>Dashboard</h1>
            <p className='dashboard-subtitle'>Resumen general del inventario</p>
          </div>

          {/* Tarjetas de estadísticas principales */}
          <div className='stats-grid'>
            <div className='stat-card primary'>
              <div className='stat-icon'>
                <FaBoxes />
              </div>
              <div className='stat-info'>
                <h3>{stats.totalProductos}</h3>
                <p>Total Productos</p>
                <span className='stat-detail'>{stats.productosActivos} activos</span>
              </div>
            </div>

            <div className='stat-card success'>
              <div className='stat-icon'>
                <FaDollarSign />
              </div>
              <div className='stat-info'>
                <h3>${formatearNumero(stats.ventasMes)}</h3>
                <p>Ventas del Mes</p>
                <span className='stat-detail'>
                  <FaArrowUp /> +12% vs mes anterior
                </span>
              </div>
            </div>

            <div className='stat-card warning'>
              <div className='stat-icon'>
                <FaExclamationTriangle />
              </div>
              <div className='stat-info'>
                <h3>{stats.stockBajo}</h3>
                <p>Stock Bajo</p>
                <span className='stat-detail'>Requieren reposición</span>
              </div>
            </div>

            <div className='stat-card info'>
              <div className='stat-icon'>
                <FaShoppingCart />
              </div>
              <div className='stat-info'>
                <h3>{stats.ventasHoy}</h3>
                <p>Ventas Hoy</p>
                <span className='stat-detail'>${formatearNumero(stats.ventasHoyTotal || 0)}</span>
              </div>
            </div>
          </div>

          {/* Segunda fila de estadísticas */}
          <div className='secondary-stats'>
            <Card title="Inventario por Almacén">
              <div className='almacenes-inventory'>
                {inventarioPorAlmacen.length > 0 ? (
                  inventarioPorAlmacen.map((almacen, index) => (
                    <div key={almacen._id || almacen.almacen || index} className='almacen-card'>
                      <div className='almacen-header'>
                        <FaWarehouse style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }} />
                        <div>
                          <h4>{almacen.almacen || almacen.nombre}</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            📍 {almacen.ubicacion || 'Ubicación no especificada'}
                          </p>
                        </div>
                      </div>
                      <div className='almacen-stats'>
                        <div className='almacen-stat'>
                          <span className='stat-label'>Productos</span>
                          <span className='stat-value'>{almacen.totalProductos}</span>
                        </div>
                        <div className='almacen-stat'>
                          <span className='stat-label'>Stock Total</span>
                          <span className='stat-value'>{almacen.stockTotal}</span>
                        </div>
                        <div className='almacen-stat'>
                          <span className='stat-label'>Valor Inventario</span>
                          <span className='stat-value'>${formatearNumero(almacen.valorTotal)}</span>
                        </div>
                      </div>
                      {almacen.productosStockBajo > 0 && (
                        <div style={{ 
                          marginTop: '0.75rem', 
                          padding: '0.5rem', 
                          background: 'rgba(239, 68, 68, 0.1)',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: 'var(--error)',
                          textAlign: 'center'
                        }}>
                          ⚠️ {almacen.productosStockBajo} producto{almacen.productosStockBajo !== 1 ? 's' : ''} con stock bajo
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                    📦 No hay almacenes registrados
                  </p>
                )}
              </div>
            </Card>

            <Card title="Resumen de Operaciones">
              <div className='operations-grid'>
                <div className='operation-item'>
                  <FaWarehouse className='op-icon' />
                  <div>
                    <p className='op-label'>Almacenes</p>
                    <h4>{stats.almacenes}</h4>
                  </div>
                </div>
                <div className='operation-item'>
                  <FaBoxes className='op-icon' />
                  <div>
                    <p className='op-label'>Categorías</p>
                    <h4>{stats.categorias}</h4>
                  </div>
                </div>
                <div className='operation-item'>
                  <FaDollarSign className='op-icon' />
                  <div>
                    <p className='op-label'>Compras del Mes</p>
                    <h4>${formatearNumero(stats.comprasMes)}</h4>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Tercera fila de estadísticas */}
          <div className='secondary-stats'>
            <Card title="Productos con Stock Bajo">
              <div className='low-stock-list'>
                {productosStockBajo.length > 0 ? (
                  productosStockBajo.map(producto => (
                    <div key={producto._id} className='stock-item'>
                      <div>
                        <span style={{ fontWeight: '500' }}>{producto.nombre}</span>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                          📦 {producto.almacen?.nombre || 'Sin almacén'}
                        </p>
                      </div>
                      <span className='stock-badge low'>{producto.stock} unidades</span>
                    </div>
                  ))
                ) : (
                  <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>
                    ✅ Todos los productos tienen stock suficiente
                  </p>
                )}
              </div>
            </Card>

            <Card title="Actividad Reciente">
              <div className='activity-list'>
                <div className='activity-item'>
                  <div className='activity-icon success'>
                    <FaShoppingCart />
                  </div>
                  <div className='activity-content'>
                    <p className='activity-title'>Nueva venta registrada</p>
                    <span className='activity-time'>Hace 5 minutos</span>
                  </div>
                </div>
                <div className='activity-item'>
                  <div className='activity-icon warning'>
                    <FaExclamationTriangle />
                  </div>
                  <div className='activity-content'>
                    <p className='activity-title'>Alerta de stock bajo en {stats.stockBajo} productos</p>
                    <span className='activity-time'>Hace 1 hora</span>
                  </div>
                </div>
                <div className='activity-item'>
                  <div className='activity-icon primary'>
                    <FaBoxes />
                  </div>
                  <div className='activity-content'>
                    <p className='activity-title'>Nuevo producto agregado al inventario</p>
                    <span className='activity-time'>Hace 2 horas</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Gráficos */}
          <div className='charts-section'>
            <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaChartLine style={{ color: 'var(--primary-color)' }} />
              <span>Ventas Últimos 6 Meses</span>
            </div>}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ventasPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="mes" 
                    stroke="var(--text-secondary)"
                    style={{ fontSize: '0.85rem' }}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    style={{ fontSize: '0.85rem' }}
                    tickFormatter={(value) => `$${formatearNumero(value)}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius)'
                    }}
                    formatter={(value) => `$${formatearNumero(value)}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ventas" 
                    stroke="var(--primary-color)" 
                    strokeWidth={3}
                    name="Ventas"
                    dot={{ fill: 'var(--primary-color)', r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className='charts-grid'>
            <Card title="Productos Más Vendidos">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productosMasVendidos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="nombre" 
                    stroke="var(--text-secondary)"
                    style={{ fontSize: '0.75rem' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    style={{ fontSize: '0.85rem' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius)'
                    }}
                  />
                  <Legend />
                  <BarGraph 
                    dataKey="cantidad" 
                    fill="var(--success)" 
                    name="Cantidad Vendida"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Distribución por Categoría">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoriaDistribucion}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.nombre}: ${entry.valor}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {categoriaDistribucion.map((entry, index) => {
                      const colors = [
                        'var(--primary-color)', 
                        'var(--success)', 
                        'var(--warning)', 
                        'var(--info)',
                        '#8b5cf6',
                        '#ec4899',
                        '#f97316',
                        '#14b8a6'
                      ];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
