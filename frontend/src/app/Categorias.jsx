import React, { useState, useEffect } from 'react'
import '../css/categorias.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Table from '../components/common/Table'
import { categoriasAPI } from '../services/api'
import { IoIosAdd } from 'react-icons/io'
import { MdCategory } from 'react-icons/md'

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriasAPI.getAll();
      setCategorias(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      alert('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

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
        await categoriasAPI.update(editingId, formData);
        alert('Categoría actualizada');
      } else {
        await categoriasAPI.create(formData);
        alert('Categoría creada exitosamente');
      }
      await cargarCategorias();
      resetForm();
    } catch (error) {
      console.error('Error guardando categoría:', error);
      alert('Error al guardar la categoría');
    }
  };

  const handleEdit = (categoria) => {
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      activo: categoria.activo
    });
    setIsEditing(true);
    setEditingId(categoria._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (categoria) => {
    if (window.confirm(`¿Eliminar categoría ${categoria.nombre}?`)) {
      try {
        await categoriasAPI.delete(categoria._id);
        await cargarCategorias();
        alert('Categoría eliminada');
      } catch (error) {
        console.error('Error eliminando categoría:', error);
        alert('Error al eliminar la categoría');
      }
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '', activo: true });
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const columns = [
    { 
      header: 'Nombre', 
      accessor: 'nombre',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MdCategory style={{ color: 'var(--primary-color)' }} />
          <strong>{row.nombre}</strong>
        </div>
      )
    },
    { header: 'Descripción', accessor: 'descripcion' },
    { 
      header: 'Productos', 
      accessor: 'productos',
      render: (row) => (
        <span className="productos-count">{row.productos} productos</span>
      )
    },
    {
      header: 'Estado',
      accessor: 'activo',
      render: (row) => (
        <span className={`status-badge ${row.activo ? 'active' : 'inactive'}`}>
          {row.activo ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
  ];

  return (
    <div className='categorias-container'>
      <Bar />
      <main className='categorias-main'>
        <Nav />
        <div className='categorias-content'>
          <div className='categorias-header'>
            <div>
              <h1>Categorías</h1>
              <p className='subtitle'>Gestión de categorías de productos</p>
            </div>
            <Button
              variant="primary"
              icon={<IoIosAdd />}
              onClick={() => setIsModalOpen(true)}
            >
              Nueva Categoría
            </Button>
          </div>

          <Card>
            <Table
              columns={columns}
              data={categorias}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Card>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
          />
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
              {isEditing ? 'Actualizar' : 'Crear'} Categoría
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Categorias