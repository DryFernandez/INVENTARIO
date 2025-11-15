import React, { useState, useEffect } from 'react'
import '../css/proveedores.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Table from '../components/common/Table'
import { proveedoresAPI } from '../services/api'
import { IoIosAdd } from 'react-icons/io'
import { FaBoxesStacked } from 'react-icons/fa6'

function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    direccion: '',
    ruc: '',
    activo: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const data = await proveedoresAPI.getAll();
      setProveedores(data);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
      alert('Error al cargar proveedores');
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
        await proveedoresAPI.update(editingId, formData);
        alert('Proveedor actualizado');
      } else {
        await proveedoresAPI.create(formData);
        alert('Proveedor creado exitosamente');
      }
      await cargarProveedores();
      resetForm();
    } catch (error) {
      console.error('Error guardando proveedor:', error);
      alert('Error al guardar el proveedor');
    }
  };

  const handleEdit = (proveedor) => {
    setFormData({
      nombre: proveedor.nombre,
      contacto: proveedor.contacto || '',
      direccion: proveedor.direccion || '',
      ruc: proveedor.ruc || '',
      activo: proveedor.activo
    });
    setIsEditing(true);
    setEditingId(proveedor._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (proveedor) => {
    if (window.confirm(`¿Eliminar ${proveedor.nombre}?`)) {
      try {
        await proveedoresAPI.delete(proveedor._id);
        await cargarProveedores();
        alert('Proveedor eliminado');
      } catch (error) {
        console.error('Error eliminando proveedor:', error);
        alert('Error al eliminar el proveedor');
      }
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', contacto: '', direccion: '', ruc: '', activo: true });
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
          <FaBoxesStacked style={{ color: 'var(--primary-color)' }} />
          <strong>{row.nombre}</strong>
        </div>
      )
    },
    { header: 'Contacto', accessor: 'contacto' },
    { header: 'RUC', accessor: 'ruc' },
    { header: 'Dirección', accessor: 'direccion' },
  ];

  return (
    <div className='proveedores-container'>
      <Bar />
      <main className='proveedores-main'>
        <Nav />
        <div className='proveedores-content'>
          <div className='proveedores-header'>
            <div>
              <h1>Proveedores</h1>
              <p className='subtitle'>Gestión de proveedores</p>
            </div>
            <Button
              variant="primary"
              icon={<IoIosAdd />}
              onClick={() => setIsModalOpen(true)}
            >
              Nuevo Proveedor
            </Button>
          </div>

          <Card>
            <Table
              columns={columns}
              data={proveedores}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Card>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Input
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Contacto (Tel/Email)"
              name="contacto"
              value={formData.contacto}
              onChange={handleInputChange}
              required
              placeholder="555-1234 - email@example.com"
            />
            <Input
              label="RUC"
              name="ruc"
              value={formData.ruc}
              onChange={handleInputChange}
            />
          </div>
          <Input
            label="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
          />
          <div className="form-group">
            <label className="input-label">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({...formData, activo: e.target.checked})}
              />
              {' '}Proveedor activo
            </label>
          </div>
          <div className="modal-actions">
            <Button variant="ghost" onClick={resetForm} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {isEditing ? 'Actualizar' : 'Crear'} Proveedor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Proveedores
