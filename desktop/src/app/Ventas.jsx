import React, { useState, useEffect } from 'react'
import '../css/ventas.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Modal from '../components/common/Modal'
import { IoMdSearch, IoMdAdd, IoMdRemove, IoMdTrash } from 'react-icons/io'
import { FaShoppingCart, FaCreditCard, FaMoneyBillWave, FaUser } from 'react-icons/fa'
import { productosAPI, clientesAPI, ventasAPI } from '../services/api'
import { formatearMonedaCompleta } from '../utils/formatters'

function Ventas() {
  const [carrito, setCarrito] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalPagoOpen, setIsModalPagoOpen] = useState(false);
  const [datosTarjeta, setDatosTarjeta] = useState({
    numeroTarjeta: '',
    fechaExpiracion: '',
    cvv: '',
    titular: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [productosData, clientesData] = await Promise.all([
        productosAPI.getAll(),
        clientesAPI.getAll()
      ]);
      setProductosDisponibles(productosData);
      setClientes(clientesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

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

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    if (!clienteSeleccionado) {
      alert('Por favor seleccione un cliente');
      return;
    }

    if (metodoPago === 'tarjeta') {
      setIsModalPagoOpen(true);
      return;
    }

    await finalizarVenta();
  };

  const finalizarVenta = async () => {
    try {
      const venta = {
        cliente: clienteSeleccionado._id,
        items: carrito.map(item => ({
          producto: item._id,
          cantidad: item.cantidad,
          precioUnitario: item.precio
        })),
        metodoPago,
        subtotal: calcularSubtotal(),
        impuesto: calcularImpuesto(),
        total: calcularTotal(),
        ...(metodoPago === 'tarjeta' && {
          datosTarjeta: {
            numeroTarjeta: datosTarjeta.numeroTarjeta,
            titular: datosTarjeta.titular,
            fechaExpiracion: datosTarjeta.fechaExpiracion
          }
        })
      };

      await ventasAPI.create(venta);
      alert('Venta procesada exitosamente');
      
      // Limpiar
      setCarrito([]);
      setClienteSeleccionado(null);
      setMetodoPago('efectivo');
      setDatosTarjeta({
        numeroTarjeta: '',
        fechaExpiracion: '',
        cvv: '',
        titular: ''
      });
      setIsModalPagoOpen(false);
      
      // Recargar productos para actualizar stock
      await cargarDatos();
    } catch (error) {
      console.error('Error procesando venta:', error);
      alert(error.response?.data?.error || 'Error al procesar la venta');
    }
  };

  const handlePagoTarjeta = (e) => {
    e.preventDefault();
    finalizarVenta();
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
                {/* Selector de cliente */}
                <div className='cliente-info'>
                  <label className='input-label'>
                    <FaUser style={{ marginRight: '0.5rem' }} />
                    Cliente
                  </label>
                  <select
                    className='input'
                    value={clienteSeleccionado?._id || ''}
                    onChange={(e) => {
                      const cliente = clientes.find(c => c._id === e.target.value);
                      setClienteSeleccionado(cliente || null);
                    }}
                    required
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(cliente => (
                      <option key={cliente._id} value={cliente._id}>
                        {cliente.nombre} {cliente.ruc ? `- ${cliente.ruc}` : ''}
                      </option>
                    ))}
                  </select>
                  {clienteSeleccionado && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      padding: '0.5rem', 
                      background: 'var(--bg-secondary)', 
                      borderRadius: '6px',
                      fontSize: '0.85rem'
                    }}>
                      {clienteSeleccionado.email && <p>📧 {clienteSeleccionado.email}</p>}
                      {clienteSeleccionado.telefono && <p>📱 {clienteSeleccionado.telefono}</p>}
                    </div>
                  )}
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
                          {formatearMonedaCompleta(item.precio * item.cantidad)}
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
                    <span>{formatearMonedaCompleta(calcularSubtotal())}</span>
                  </div>
                  <div className='resumen-item'>
                    <span>IVA (16%):</span>
                    <span>{formatearMonedaCompleta(calcularImpuesto())}</span>
                  </div>
                  <div className='resumen-total'>
                    <span>Total:</span>
                    <span>{formatearMonedaCompleta(calcularTotal())}</span>
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

      {/* Modal de Pago con Tarjeta */}
      <Modal
        isOpen={isModalPagoOpen}
        onClose={() => setIsModalPagoOpen(false)}
        title="Datos de la Tarjeta"
      >
        <form onSubmit={handlePagoTarjeta} className='form-pago-tarjeta'>
          <div className='form-group'>
            <label className='input-label'>Titular de la Tarjeta</label>
            <Input
              type="text"
              placeholder="Nombre como aparece en la tarjeta"
              value={datosTarjeta.titular}
              onChange={(e) => setDatosTarjeta({...datosTarjeta, titular: e.target.value})}
              required
            />
          </div>

          <div className='form-group'>
            <label className='input-label'>Número de Tarjeta</label>
            <Input
              type="text"
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              value={datosTarjeta.numeroTarjeta}
              onChange={(e) => {
                const valor = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                setDatosTarjeta({...datosTarjeta, numeroTarjeta: valor});
              }}
              required
            />
          </div>

          <div className='form-row'>
            <div className='form-group'>
              <label className='input-label'>Fecha de Expiración</label>
              <Input
                type="text"
                placeholder="MM/YY"
                maxLength="5"
                value={datosTarjeta.fechaExpiracion}
                onChange={(e) => {
                  let valor = e.target.value.replace(/\D/g, '');
                  if (valor.length >= 2) {
                    valor = valor.slice(0, 2) + '/' + valor.slice(2, 4);
                  }
                  setDatosTarjeta({...datosTarjeta, fechaExpiracion: valor});
                }}
                required
              />
            </div>

            <div className='form-group'>
              <label className='input-label'>CVV</label>
              <Input
                type="text"
                placeholder="123"
                maxLength="3"
                value={datosTarjeta.cvv}
                onChange={(e) => {
                  const valor = e.target.value.replace(/\D/g, '');
                  setDatosTarjeta({...datosTarjeta, cvv: valor});
                }}
                required
              />
            </div>
          </div>

          <div className='resumen-modal'>
            <p>Total a pagar: <strong>{formatearMonedaCompleta(calcularTotal())}</strong></p>
          </div>

          <div className='modal-actions'>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setIsModalPagoOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Confirmar Pago
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Ventas
