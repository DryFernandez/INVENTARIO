import React, { useState, useEffect } from 'react'
import '../css/almacenes.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Table from '../components/common/Table'
import { almacenesAPI } from '../services/api'
import { IoIosAdd } from 'react-icons/io'
import { FaWarehouse } from 'react-icons/fa'

function Almacenes() {
  const [almacenes, setAlmacenes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    capacidadMaxima: '',
    activo: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    cargarAlmacenes();
  }, []);

  const cargarAlmacenes = async () => {
    try {
      setLoading(true);
      const data = await almacenesAPI.getAll();
      setAlmacenes(data);
    } catch (error) {
      console.error('Error cargando almacenes:', error);
      alert('Error al cargar almacenes');
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
        await almacenesAPI.update(editingId, formData);
        alert('Almacén actualizado');
      } else {
        await almacenesAPI.create(formData);
        alert('Almacén creado exitosamente');
      }
      await cargarAlmacenes();
      resetForm();
    } catch (error) {
      console.error('Error guardando almacén:', error);
      alert('Error al guardar el almacén');
    }
  };

  const handleEdit = (almacen) => {
    setFormData({
      nombre: almacen.nombre,
      ubicacion: almacen.ubicacion || '',
      capacidadMaxima: almacen.capacidadMaxima || '',
      activo: almacen.activo
    });
    setIsEditing(true);
    setEditingId(almacen._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (almacen) => {
    if (window.confirm(`¿Eliminar ${almacen.nombre}?`)) {
      try {
        await almacenesAPI.delete(almacen._id);
        await cargarAlmacenes();
        alert('Almacén eliminado');
      } catch (error) {
        console.error('Error eliminando almacén:', error);
        alert('Error al eliminar el almacén');
      }
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', ubicacion: '', capacidadMaxima: '', activo: true });
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
          <FaWarehouse style={{ color: 'var(--primary-color)' }} />
          <strong>{row.nombre}</strong>
        </div>
      )
    },
    { header: 'Dirección', accessor: 'direccion' },
    { header: 'Teléfono', accessor: 'telefono' },
    { header: 'Encargado', accessor: 'encargado' },
    {
      header: 'Ocupación',
      accessor: 'ocupacion',
      render: (row) => {
        const porcentaje = (row.ocupacion / row.capacidad * 100).toFixed(0);
        return (
          <div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              {row.ocupacion} / {row.capacidad}
            </div>
            <div style={{ width: '100%', background: 'var(--bg-tertiary)', borderRadius: '4px', height: '6px' }}>
              <div style={{ width: `${porcentaje}%`, background: porcentaje > 80 ? 'var(--error)' : 'var(--success)', height: '100%', borderRadius: '4px' }} />
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className='almacenes-container'>
      <Bar />
      <main className='almacenes-main'>
        <Nav />
        <div className='almacenes-content'>
          <div className='almacenes-header'>
            <div>
              <h1>Almacenes</h1>
              <p className='subtitle'>Gestión de almacenes y ubicaciones</p>
            </div>
            <Button
              variant="primary"
              icon={<IoIosAdd />}
              onClick={() => setIsModalOpen(true)}
            >
              Nuevo Almacén
            </Button>
          </div>

          <Card>
            <Table
              columns={columns}
              data={almacenes}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Card>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={isEditing ? 'Editar Almacén' : 'Nuevo Almacén'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Ubicación"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Capacidad Máxima"
            name="capacidadMaxima"
            type="number"
            value={formData.capacidadMaxima}
            onChange={handleInputChange}
            required
          />
          <div className="form-group">
            <label className="input-label">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({...formData, activo: e.target.checked})}
              />
              {' '}Almacén activo
            </label>
          </div>
          <div className="modal-actions">
            <Button variant="ghost" onClick={resetForm} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {isEditing ? 'Actualizar' : 'Crear'} Almacén
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Almacenes
