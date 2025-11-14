import React, { useState } from 'react'
import '../css/ventas.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { IoMdSearch, IoMdAdd, IoMdRemove, IoMdTrash } from 'react-icons/io'
import { FaShoppingCart, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa'

function Ventas() {
  const [carrito, setCarrito] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [clienteInfo, setClienteInfo] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });

  // Productos disponibles (ejemplo)
  const productosDisponibles = [
    { _id: '1', sku: 'PROD001', nombre: 'Laptop Dell XPS 15', precio: 1200, stock: 15 },
    { _id: '2', sku: 'PROD002', nombre: 'Mouse Logitech MX', precio: 45, stock: 30 },
    { _id: '3', sku: 'PROD003', nombre: 'Teclado Mecánico', precio: 89, stock: 8 },
    { _id: '4', sku: 'PROD004', nombre: 'Monitor Samsung 27"', precio: 350, stock: 12 },
  ];

  const productosFiltrados = productosDisponibles.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item._id === producto._id);
    
    if (itemExistente) {
      if (itemExistente.cantidad < producto.stock) {
        setCarrito(carrito.map(item =>
          item._id === producto._id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        ));
      } else {
        alert('No hay suficiente stock disponible');
      }
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const cambiarCantidad = (id, delta) => {
    setCarrito(carrito.map(item => {
      if (item._id === id) {
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad > 0 && nuevaCantidad <= item.stock) {
          return { ...item, cantidad: nuevaCantidad };
        }
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item._id !== id));
  };

  const calcularSubtotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const calcularImpuesto = () => {
    return calcularSubtotal() * 0.16; // 16% IVA
  };

  const calcularTotal = () => {
    return calcularSubtotal() + calcularImpuesto();
  };

  const procesarVenta = () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    if (!clienteInfo.nombre) {
      alert('Por favor ingrese el nombre del cliente');
      return;
    }

    const venta = {
      cliente: clienteInfo,
      items: carrito,
      metodoPago,
      subtotal: calcularSubtotal(),
      impuesto: calcularImpuesto(),
      total: calcularTotal(),
      fecha: new Date().toISOString()
    };

    console.log('Procesando venta:', venta);
    alert('Venta procesada exitosamente');
    
    // Limpiar el carrito y formulario
    setCarrito([]);
    setClienteInfo({ nombre: '', email: '', telefono: '' });
  };

  return (
    <div className='ventas-container'>
      <Bar />
      <main className='ventas-main'>
        <Nav />
        <div className='ventas-content'>
          <div className='ventas-header'>
            <h1>Punto de Venta</h1>
            <p className='subtitle'>Registra nuevas ventas</p>
          </div>

          <div className='ventas-layout'>
            {/* Sección de productos */}
            <div className='productos-section'>
              <Card title="Productos Disponibles">
                <div className='search-productos'>
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<IoMdSearch />}
                  />
                </div>

                <div className='productos-grid'>
                  {productosFiltrados.map(producto => (
                    <div key={producto._id} className='producto-card' onClick={() => agregarAlCarrito(producto)}>
                      <div className='producto-info'>
                        <h4>{producto.nombre}</h4>
                        <p className='producto-sku'>{producto.sku}</p>
                        <div className='producto-footer'>
                          <span className='producto-precio'>${producto.precio}</span>
                          <span className='producto-stock'>{producto.stock} en stock</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Carrito de compras */}
            <div className='carrito-section'>
              <Card title={`Carrito de Compras (${carrito.length})`}>
                {/* Info del cliente */}
                <div className='cliente-info'>
                  <Input
                    label="Cliente"
                    placeholder="Nombre del cliente"
                    value={clienteInfo.nombre}
                    onChange={(e) => setClienteInfo({...clienteInfo, nombre: e.target.value})}
                    required
                  />
                  <Input
                    placeholder="Email (opcional)"
                    value={clienteInfo.email}
                    onChange={(e) => setClienteInfo({...clienteInfo, email: e.target.value})}
                  />
                </div>

                {/* Items del carrito */}
                <div className='carrito-items'>
                  {carrito.length === 0 ? (
                    <div className='carrito-vacio'>
                      <FaShoppingCart />
                      <p>El carrito está vacío</p>
                    </div>
                  ) : (
                    carrito.map(item => (
                      <div key={item._id} className='carrito-item'>
                        <div className='item-info'>
                          <h4>{item.nombre}</h4>
                          <p>${item.precio}</p>
                        </div>
                        <div className='item-actions'>
                          <button onClick={() => cambiarCantidad(item._id, -1)} className='qty-btn'>
                            <IoMdRemove />
                          </button>
                          <span className='cantidad'>{item.cantidad}</span>
                          <button onClick={() => cambiarCantidad(item._id, 1)} className='qty-btn'>
                            <IoMdAdd />
                          </button>
                          <button onClick={() => eliminarDelCarrito(item._id)} className='delete-btn'>
                            <IoMdTrash />
                          </button>
                        </div>
                        <div className='item-total'>
                          ${(item.precio * item.cantidad).toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Método de pago */}
                <div className='metodo-pago'>
                  <label className='input-label'>Método de Pago</label>
                  <div className='metodo-options'>
                    <button 
                      className={`metodo-btn ${metodoPago === 'efectivo' ? 'active' : ''}`}
                      onClick={() => setMetodoPago('efectivo')}
                    >
                      <FaMoneyBillWave />
                      Efectivo
                    </button>
                    <button 
                      className={`metodo-btn ${metodoPago === 'tarjeta' ? 'active' : ''}`}
                      onClick={() => setMetodoPago('tarjeta')}
                    >
                      <FaCreditCard />
                      Tarjeta
                    </button>
                  </div>
                </div>

                {/* Resumen */}
                <div className='resumen-venta'>
                  <div className='resumen-item'>
                    <span>Subtotal:</span>
                    <span>${calcularSubtotal().toFixed(2)}</span>
                  </div>
                  <div className='resumen-item'>
                    <span>IVA (16%):</span>
                    <span>${calcularImpuesto().toFixed(2)}</span>
                  </div>
                  <div className='resumen-total'>
                    <span>Total:</span>
                    <span>${calcularTotal().toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  fullWidth 
                  size="large"
                  onClick={procesarVenta}
                  disabled={carrito.length === 0}
                >
                  Procesar Venta
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Ventas
