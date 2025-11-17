import React, { useState, useEffect } from "react";
import "../css/productos.css";
import Nav from "../components/nav/Nav";
import Bar from "../components/bar/Bar";
import Table from "../components/common/Table";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";
import Card from "../components/common/Card";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { productosAPI, categoriasAPI, almacenesAPI, proveedoresAPI } from "../services/api";
import { IoIosAdd, IoMdSearch } from "react-icons/io";
import { FaFilter, FaFileExport } from "react-icons/fa";
import { formatearMoneda } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    sku: "",
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
    stock: "",
    stockMinimo: "",
    almacen: "",
    proveedor: "",
    imagen: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, producto: null });
  const { success, error } = useToast();

  // Cargar datos desde el backend
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [productosData, categoriasData, almacenesData, proveedoresData] = await Promise.all([
        productosAPI.getAll(),
        categoriasAPI.getAll(),
        almacenesAPI.getAll(),
        proveedoresAPI.getAll()
      ]);
      
      console.log('✅ Productos cargados:', productosData);
      console.log('✅ Categorías cargadas:', categoriasData);
      console.log('✅ Almacenes cargados:', almacenesData);
      console.log('✅ Proveedores cargados:', proveedoresData);
      
      setProductos(productosData);
      setFilteredProductos(productosData);
      setCategorias(categoriasData);
      setAlmacenes(almacenesData);
      setProveedores(proveedoresData);
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      error(err.message || 'Error al cargar los datos. Verifica que el servidor esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos
  useEffect(() => {
    let filtered = productos;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategoria) {
      filtered = filtered.filter((p) => {
        const catId = p.categoria?._id || p.categoria;
        return catId === selectedCategoria;
      });
    }

    setFilteredProductos(filtered);
  }, [searchTerm, selectedCategoria, productos]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await productosAPI.update(editingId, formData);
        success('Producto actualizado exitosamente');
      } else {
        await productosAPI.create(formData);
        success('Producto creado exitosamente');
      }
      await cargarDatos();
      resetForm();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      error(err.message || 'Error al guardar el producto');
    }
  };

  const handleEdit = (producto) => {
    setFormData({
      sku: producto.sku,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      categoria: producto.categoria?._id || producto.categoria,
      precio: producto.precio,
      stock: producto.stock,
      stockMinimo: producto.stockMinimo,
      almacen: producto.almacen?._id || producto.almacen,
      proveedor: producto.proveedor?._id || producto.proveedor || '',
      imagen: producto.imagen || '',
    });
    setIsEditing(true);
    setEditingId(producto._id);
    setIsModalOpen(true);
  };

  const handleDelete = (producto) => {
    setConfirmDialog({ isOpen: true, producto });
  };

  const confirmDelete = async () => {
    try {
      await productosAPI.delete(confirmDialog.producto._id);
      await cargarDatos();
      success('Producto eliminado exitosamente');
      setConfirmDialog({ isOpen: false, producto: null });
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      error(err.message || 'Error al eliminar el producto');
    }
  };

  const resetForm = () => {
    setFormData({
      sku: "",
      nombre: "",
      descripcion: "",
      categoria: "",
      precio: "",
      stock: "",
      stockMinimo: "",
      almacen: "",
      proveedor: "",
      imagen: "",
    });
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const columns = [
    { header: "SKU", accessor: "sku" },
    { header: "Nombre", accessor: "nombre" },
    { 
      header: "Categoría", 
      accessor: "categoria",
      render: (row) => row.categoria?.nombre || 'Sin categoría'
    },
    { 
      header: "Almacén", 
      accessor: "almacen",
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>📦</span>
          <span>{row.almacen?.nombre || 'Sin asignar'}</span>
        </div>
      )
    },
    {
      header: "Precio",
      accessor: "precio",
      render: (row) => formatearMoneda(row.precio || 0),
    },
    {
      header: "Stock",
      accessor: "stock",
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span
            className={`stock-badge ${
              row.stock <= row.stockMinimo ? "low" : "normal"
            }`}
          >
            {row.stock} unidades
          </span>
          {row.stock <= row.stockMinimo && (
            <span style={{ fontSize: '0.75rem', color: 'var(--error)' }}>
              ⚠️ Stock bajo (mín: {row.stockMinimo})
            </span>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="productos-container">
        <Bar />
        <main className="productos-main">
          <Nav />
          <div className="productos-content">
            <div className="loading">Cargando productos...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="productos-container">
      <Bar />
      <main className="productos-main">
        <Nav />
        <div className="productos-content">
          <div className="productos-header">
            <div>
              <h1>Productos</h1>
              <p className="subtitle">Gestión de inventario de productos</p>
            </div>
            <div className="header-actions">
              <Button
                variant="outline"
                icon={<FaFileExport />}
                onClick={() => alert("Exportar productos")}
              >
                Exportar
              </Button>
              <Button
                variant="primary"
                icon={<IoIosAdd />}
                onClick={() => setIsModalOpen(true)}
              >
                Nuevo Producto
              </Button>
            </div>
          </div>

          <Card>
            <div className="filters-section">
              <div className="search-box">
                <Input
                  placeholder="Buscar por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<IoMdSearch />}
                />
              </div>
              <div className="filter-select">
                <select
                  className="input"
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <Table
              columns={columns}
              data={filteredProductos}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Card>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={isEditing ? "Editar Producto" : "Nuevo Producto"}
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Input
              label="SKU (auto-generado)"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Se generará automáticamente"
            />
            <Input
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
            <div className="form-group">
              <label className="input-label">Categoría *</label>
              <select
                className="input"
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            <Input
              label="Precio"
              name="precio"
              type="number"
              value={formData.precio}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Stock Mínimo"
              name="stockMinimo"
              type="number"
              value={formData.stockMinimo}
              onChange={handleInputChange}
              required
            />
            <div className="form-group">
              <label className="input-label">Almacén *</label>
              <select
                className="input"
                name="almacen"
                value={formData.almacen}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar almacén</option>
                {almacenes.map(alm => (
                  <option key={alm._id} value={alm._id}>{alm.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Proveedor</label>
              <select
                className="input"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleInputChange}
              >
                <option value="">Seleccionar proveedor</option>
                {proveedores.map(prov => (
                  <option key={prov._id} value={prov._id}>{prov.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Descripción</label>
            <textarea
              className="input"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows="4"
            />
          </div>
          <div className="modal-actions">
            <Button variant="ghost" onClick={resetForm} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {isEditing ? "Actualizar" : "Crear"} Producto
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Confirmar eliminación"
        message={`¿Eliminar el producto "${confirmDialog.producto?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, producto: null })}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}

export default Productos;
