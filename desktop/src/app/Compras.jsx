import React, { useState, useEffect } from 'react'
import '../css/compras.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import { IoIosAdd, IoMdTrash } from 'react-icons/io'
import { FaBoxOpen } from 'react-icons/fa'
import { comprasAPI, proveedoresAPI, productosAPI, almacenesAPI } from '../services/api'
import { formatearMonedaCompleta } from '../utils/formatters'

function Compras() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    proveedor: '',
    almacen: '',
    items: [],
    pagado: false
  });

  const [itemActual, setItemActual] = useState({
    producto: '',
    cantidad: '',
    precioUnitario: ''
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      const [proveedoresData, productosData, almacenesData] = await Promise.all([
        proveedoresAPI.getAll(),
        productosAPI.getAll(),
        almacenesAPI.getAll()
      ]);
      setProveedores(proveedoresData || []);
      setProductos(productosData || []);
      setAlmacenes(almacenesData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos necesarios');
    }
  };

  const handleAgregarItem = () => {
    if (!itemActual.producto || !itemActual.cantidad || !itemActual.precioUnitario) {
      alert('Por favor completa todos los campos del producto');
      return;
    }

    const producto = productos.find(p => p._id === itemActual.producto);
    if (!producto) {
      alert('Producto no encontrado');
      return;
    }

    const nuevoItem = {
      producto: itemActual.producto,
      nombreProducto: producto.nombre,
      sku: producto.sku,
      cantidad: parseInt(itemActual.cantidad),
      precioUnitario: parseFloat(itemActual.precioUnitario),
      subtotal: parseInt(itemActual.cantidad) * parseFloat(itemActual.precioUnitario)
    };

    setFormData({
      ...formData,
      items: [...formData.items, nuevoItem]
    });

    setItemActual({
      producto: '',
      cantidad: '',
      precioUnitario: ''
    });
  };

  const handleEliminarItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const calcularTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.proveedor) {
      alert('Por favor selecciona un proveedor');
      return;
    }

    if (!formData.almacen) {
      alert('Por favor selecciona un almacén');
      return;
    }

    if (formData.items.length === 0) {
      alert('Por favor agrega al menos un producto');
      return;
    }

    try {
      setLoading(true);
      
      const compraData = {
        proveedor: formData.proveedor,
        almacen: formData.almacen,
        pagado: formData.pagado,
        items: formData.items.map(item => ({
          producto: item.producto,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario
        }))
      };

      await comprasAPI.create(compraData);
      
      alert('Compra registrada exitosamente');
      setIsModalOpen(false);
      setFormData({
        proveedor: '',
        almacen: '',
        items: [],
        pagado: false
      });
      
    } catch (error) {
      console.error('Error al crear compra:', error);
      alert(error.message || 'Error al registrar la compra');
    } finally {
      setLoading(false);
    }
  };

  const proveedorSeleccionado = proveedores.find(p => p._id === formData.proveedor);

  return (
    <div className='compras-container'>
      <Bar />
      <main className='compras-main'>
        <Nav />
        <div className='compras-content'>
          <div className='compras-header'>
            <div>
              <h1>Compras</h1>
              <p className='subtitle'>Registra nuevas compras de mercancía</p>
            </div>
            <Button
              variant="primary"
              icon={<IoIosAdd />}
              onClick={() => setIsModalOpen(true)}
            >
              Nueva Compra
            </Button>
          </div>

          <Card>
            <div className='info-box'>
              <FaBoxOpen style={{ fontSize: '3rem', color: 'var(--primary-color)', opacity: 0.5 }} />
              <h3>Registra una Nueva Compra</h3>
              <p>Haz clic en "Nueva Compra" para registrar la entrada de mercancía</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Las compras incrementarán automáticamente el stock en el almacén seleccionado
              </p>
            </div>
          </Card>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ proveedor: '', almacen: '', items: [], pagado: false });
          setItemActual({ producto: '', cantidad: '', precioUnitario: '' });
        }}
        title="Nueva Orden de Compra"
        size="large"
      >
        <form onSubmit={handleSubmit} className='compras-form'>
          {/* Información del Proveedor */}
          <div className='form-section'>
            <h3>Información del Proveedor</h3>
            <div className='form-grid'>
              <div className='form-group'>
                <label>Proveedor *</label>
                <select
                  value={formData.proveedor}
                  onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                  required
                  className='form-select'
                >
                  <option value="">Selecciona un proveedor</option>
                  {proveedores.map(proveedor => (
                    <option key={proveedor._id} value={proveedor._id}>
                      {proveedor.nombre} {proveedor.ruc ? `- ${proveedor.ruc}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className='form-group'>
                <label>Almacén de Destino *</label>
                <select
                  value={formData.almacen}
                  onChange={(e) => setFormData({ ...formData, almacen: e.target.value })}
                  required
                  className='form-select'
                >
                  <option value="">Selecciona un almacén</option>
                  {almacenes.map(almacen => (
                    <option key={almacen._id} value={almacen._id}>
                      {almacen.nombre} - {almacen.ubicacion}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {proveedorSeleccionado && (
              <div className='proveedor-info'>
                <p><strong>Contacto:</strong> {proveedorSeleccionado.email || 'No especificado'}</p>
                <p><strong>Teléfono:</strong> {proveedorSeleccionado.telefono || 'No especificado'}</p>
              </div>
            )}

            <div className='form-group' style={{ marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type='checkbox'
                  checked={formData.pagado}
                  onChange={(e) => setFormData({ ...formData, pagado: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Marcar como pagado
                </span>
              </label>
            </div>
          </div>

          {/* Agregar Productos */}
          <div className='form-section'>
            <h3>Agregar Productos</h3>
            <div className='form-grid'>
              <div className='form-group'>
                <label>Producto *</label>
                <select
                  value={itemActual.producto}
                  onChange={(e) => setItemActual({ ...itemActual, producto: e.target.value })}
                  className='form-select'
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map(producto => (
                    <option key={producto._id} value={producto._id}>
                      {producto.nombre} ({producto.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className='form-group'>
                <label>Cantidad *</label>
                <input
                  type='number'
                  min='1'
                  value={itemActual.cantidad}
                  onChange={(e) => setItemActual({ ...itemActual, cantidad: e.target.value })}
                  className='form-input'
                  placeholder='0'
                />
              </div>

              <div className='form-group'>
                <label>Precio Unitario *</label>
                <input
                  type='number'
                  step='0.01'
                  min='0'
                  value={itemActual.precioUnitario}
                  onChange={(e) => setItemActual({ ...itemActual, precioUnitario: e.target.value })}
                  className='form-input'
                  placeholder='0.00'
                />
              </div>

              <div className='form-group' style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button
                  type='button'
                  variant='primary'
                  onClick={handleAgregarItem}
                  style={{ width: '100%' }}
                >
                  Agregar
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de Productos */}
          {formData.items.length > 0 && (
            <div className='form-section'>
              <h3>Productos Agregados</h3>
              <table className='items-table'>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.nombreProducto}</td>
                      <td>{item.sku}</td>
                      <td>{item.cantidad}</td>
                      <td>{formatearMonedaCompleta(item.precioUnitario)}</td>
                      <td>{formatearMonedaCompleta(item.subtotal)}</td>
                      <td>
                        <button
                          type='button'
                          onClick={() => handleEliminarItem(index)}
                          className='btn-delete'
                        >
                          <IoMdTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan='4' style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                    <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{formatearMonedaCompleta(calcularTotal())}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className='modal-actions'>
            <Button 
              variant='ghost' 
              onClick={() => {
                setIsModalOpen(false);
                setFormData({ proveedor: '', almacen: '', items: [], pagado: false });
                setItemActual({ producto: '', cantidad: '', precioUnitario: '' });
              }} 
              type='button'
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              variant='primary' 
              type='submit'
              disabled={loading || formData.items.length === 0}
            >
              {loading ? 'Registrando...' : 'Registrar Compra'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Compras