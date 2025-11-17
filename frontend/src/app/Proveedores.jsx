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
    nombreComercial: '',
    ruc: '',
    contactoPrincipal: {
      nombre: '',
      telefono: '',
      email: '',
      cargo: ''
    },
    direccion: '',
    ciudad: '',
    observaciones: ''
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
    const { name, value } = e.target;
    
    // Si el campo es de contactoPrincipal (tiene punto en el nombre)
    if (name.startsWith('contactoPrincipal.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        contactoPrincipal: {
          ...formData.contactoPrincipal,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Limpiar campos vacíos del contactoPrincipal
      const dataToSend = {
        ...formData,
        contactoPrincipal: {
          nombre: formData.contactoPrincipal.nombre || undefined,
          telefono: formData.contactoPrincipal.telefono || undefined,
          email: formData.contactoPrincipal.email || undefined,
          cargo: formData.contactoPrincipal.cargo || undefined
        }
      };

      // Remover campos undefined del nivel superior
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === '' || dataToSend[key] === undefined) {
          delete dataToSend[key];
        }
      });

      // Remover campos undefined de contactoPrincipal
      Object.keys(dataToSend.contactoPrincipal).forEach(key => {
        if (dataToSend.contactoPrincipal[key] === '' || dataToSend.contactoPrincipal[key] === undefined) {
          delete dataToSend.contactoPrincipal[key];
        }
      });

      console.log('Enviando datos:', dataToSend);

      if (isEditing) {
        await proveedoresAPI.update(editingId, dataToSend);
        alert('Proveedor actualizado');
      } else {
        await proveedoresAPI.create(dataToSend);
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
      nombre: proveedor.nombre || '',
      nombreComercial: proveedor.nombreComercial || '',
      ruc: proveedor.ruc || '',
      contactoPrincipal: {
        nombre: proveedor.contactoPrincipal?.nombre || '',
        telefono: proveedor.contactoPrincipal?.telefono || '',
        email: proveedor.contactoPrincipal?.email || '',
        cargo: proveedor.contactoPrincipal?.cargo || ''
      },
      direccion: proveedor.direccion || '',
      ciudad: proveedor.ciudad || '',
      observaciones: proveedor.observaciones || ''
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
    setFormData({
      nombre: '',
      nombreComercial: '',
      ruc: '',
      contactoPrincipal: {
        nombre: '',
        telefono: '',
        email: '',
        cargo: ''
      },
      direccion: '',
      ciudad: '',
      observaciones: ''
    });
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
    { 
      header: 'Contacto', 
      accessor: 'contactoPrincipal',
      render: (row) => (
        <div>
          <div>{row.contactoPrincipal?.nombre || '-'}</div>
          <small style={{ color: 'var(--text-secondary)' }}>
            {row.contactoPrincipal?.telefono || '-'}
          </small>
        </div>
      )
    },
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
              label="Nombre Completo"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Nombre Comercial"
              name="nombreComercial"
              value={formData.nombreComercial}
              onChange={handleInputChange}
            />
            <Input
              label="RUC"
              name="ruc"
              value={formData.ruc}
              onChange={handleInputChange}
              placeholder="20123456789"
            />
          </div>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>
            Contacto Principal
          </h3>
          <div className="form-grid">
            <Input
              label="Nombre del Contacto"
              name="contactoPrincipal.nombre"
              value={formData.contactoPrincipal.nombre}
              onChange={handleInputChange}
            />
            <Input
              label="Teléfono"
              name="contactoPrincipal.telefono"
              value={formData.contactoPrincipal.telefono}
              onChange={handleInputChange}
              required
              placeholder="987654321"
            />
            <Input
              label="Email"
              name="contactoPrincipal.email"
              type="email"
              value={formData.contactoPrincipal.email}
              onChange={handleInputChange}
              placeholder="contacto@empresa.com"
            />
            <Input
              label="Cargo"
              name="contactoPrincipal.cargo"
              value={formData.contactoPrincipal.cargo}
              onChange={handleInputChange}
              placeholder="Gerente de Ventas"
            />
          </div>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>
            Información Adicional
          </h3>
          <div className="form-grid">
            <Input
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
            />
            <Input
              label="Ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label className="input-label">Observaciones</label>
            <textarea
              className="input"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              rows="3"
              placeholder="Notas o comentarios adicionales..."
            />
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
