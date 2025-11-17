import React, { useState, useEffect } from 'react'
import '../css/clientes.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Table from '../components/common/Table'
import { clientesAPI } from '../services/api'
import { IoIosAdd, IoMdSearch } from 'react-icons/io'
import { FaUser, FaIdCard, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa'

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    ruc: '',
    direccion: '',
    email: '',
    telefono: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.ruc && cliente.ruc.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cliente.telefono && cliente.telefono.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredClientes(filtered);
    } else {
      setFilteredClientes(clientes);
    }
  }, [searchTerm, clientes]);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const data = await clientesAPI.getAll();
      setClientes(data);
      setFilteredClientes(data);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      alert('Error al cargar clientes');
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
        await clientesAPI.update(editingId, formData);
        alert('Cliente actualizado exitosamente');
      } else {
        await clientesAPI.create(formData);
        alert('Cliente creado exitosamente');
      }
      await cargarClientes();
      resetForm();
    } catch (error) {
      console.error('Error guardando cliente:', error);
      alert(error.message || 'Error al guardar el cliente');
    }
  };

  const handleEdit = (cliente) => {
    setFormData({
      nombre: cliente.nombre,
      ruc: cliente.ruc || '',
      direccion: cliente.direccion || '',
      email: cliente.email || '',
      telefono: cliente.telefono || ''
    });
    setIsEditing(true);
    setEditingId(cliente._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (cliente) => {
    if (window.confirm(`¿Eliminar cliente ${cliente.nombre}?`)) {
      try {
        await clientesAPI.delete(cliente._id);
        await cargarClientes();
        alert('Cliente eliminado exitosamente');
      } catch (error) {
        console.error('Error eliminando cliente:', error);
        alert('Error al eliminar el cliente');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      ruc: '',
      direccion: '',
      email: '',
      telefono: ''
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
          <FaUser style={{ color: 'var(--primary-color)' }} />
          <strong>{row.nombre}</strong>
        </div>
      )
    },
    {
      header: 'RUC/DNI',
      accessor: 'ruc',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaIdCard style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }} />
          <span>{row.ruc || 'No especificado'}</span>
        </div>
      )
    },
    {
      header: 'Dirección',
      accessor: 'direccion',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaMapMarkerAlt style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }} />
          <span>{row.direccion || 'No especificada'}</span>
        </div>
      )
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaEnvelope style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }} />
          <span>{row.email || 'No especificado'}</span>
        </div>
      )
    },
    {
      header: 'Teléfono',
      accessor: 'telefono',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaPhone style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }} />
          <span>{row.telefono || 'No especificado'}</span>
        </div>
      )
    },
    {
      header: 'Fecha Registro',
      accessor: 'fechaRegistro',
      render: (row) => new Date(row.fechaRegistro).toLocaleDateString('es-ES')
    }
  ];

  if (loading) {
    return (
      <div className='clientes-container'>
        <Bar />
        <main className='clientes-main'>
          <Nav />
          <div className='clientes-content'>
            <div className='loading'>Cargando clientes...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='clientes-container'>
      <Bar />
      <main className='clientes-main'>
        <Nav />
        <div className='clientes-content'>
          <div className='clientes-header'>
            <div>
              <h1>Clientes</h1>
              <p className='subtitle'>Gestión de clientes y contactos</p>
            </div>
            <Button
              variant="primary"
              icon={<IoIosAdd />}
              onClick={() => setIsModalOpen(true)}
            >
              Nuevo Cliente
            </Button>
          </div>

          <Card>
            <div className='filters-section'>
              <div className='search-box'>
                <Input
                  placeholder="Buscar por nombre, RUC, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<IoMdSearch />}
                />
              </div>
              <div className='stats-info'>
                <span className='stat-item'>
                  <strong>{filteredClientes.length}</strong> clientes
                </span>
              </div>
            </div>

            <Table
              columns={columns}
              data={filteredClientes}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Card>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Input
              label="Nombre Completo"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              icon={<FaUser />}
              required
            />
            <Input
              label="RUC / DNI"
              name="ruc"
              value={formData.ruc}
              onChange={handleInputChange}
              icon={<FaIdCard />}
              placeholder="Opcional"
            />
          </div>

          <Input
            label="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
            icon={<FaMapMarkerAlt />}
            placeholder="Opcional"
          />

          <div className="form-grid">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              icon={<FaEnvelope />}
              placeholder="ejemplo@email.com"
            />
            <Input
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              icon={<FaPhone />}
              placeholder="+51 999 999 999"
            />
          </div>

          <div className="modal-actions">
            <Button variant="ghost" onClick={resetForm} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {isEditing ? 'Actualizar' : 'Crear'} Cliente
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Clientes
