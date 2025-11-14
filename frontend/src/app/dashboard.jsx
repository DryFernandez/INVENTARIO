import React, { useState, useEffect } from 'react'
import '../css/dashboard.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'
import Card from '../components/common/Card'
import { productosAPI, categoriasAPI, almacenesAPI } from '../services/api'
import { 
  FaBoxes, 
  FaShoppingCart, 
  FaDollarSign, 
  FaExclamationTriangle,
  FaArrowUp,
  FaWarehouse
} from 'react-icons/fa'

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [productos, categorias, almacenes] = await Promise.all([
          productosAPI.getAll(),
          categoriasAPI.getAll(),
          almacenesAPI.getAll()
        ]);

        const productosActivos = productos.filter(p => p.activo);
        const stockBajo = productos.filter(p => p.stock <= p.stockMinimo);
        
        setStats({
          totalProductos: productos.length,
          productosActivos: productosActivos.length,
          stockBajo: stockBajo.length,
          ventasHoy: 0, // Implementar cuando haya datos de ventas
          ventasMes: 0,
          comprasMes: 0,
          almacenes: almacenes.length,
          categorias: categorias.length
        });

        setProductosStockBajo(stockBajo.slice(0, 3));
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

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
                <h3>${stats.ventasMes.toLocaleString()}</h3>
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
                <span className='stat-detail'>Actualizado en tiempo real</span>
              </div>
            </div>
          </div>

          {/* Segunda fila de estadísticas */}
          <div className='secondary-stats'>
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
                    <h4>${stats.comprasMes.toLocaleString()}</h4>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Productos con Stock Bajo">
              <div className='low-stock-list'>
                {productosStockBajo.length > 0 ? (
                  productosStockBajo.map(producto => (
                    <div key={producto._id} className='stock-item'>
                      <span>{producto.nombre}</span>
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
          </div>

          {/* Actividad reciente */}
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
                  <p className='activity-title'>Alerta de stock bajo en 3 productos</p>
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
      </main>
    </div>
  )
}

export default Dashboard
