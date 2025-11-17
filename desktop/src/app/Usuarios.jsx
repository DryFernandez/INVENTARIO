import React, { useState, useEffect } from 'react'
import '../css/usuarios.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Modal from '../components/common/Modal'
import { FaUser, FaEnvelope, FaLock, FaEdit, FaTrash, FaPlus, FaSearch, FaUserShield } from 'react-icons/fa'
import * as usuariosAPI from '../services/usuarios'

function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroRol, setFiltroRol] = useState('todos')

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'empleado'
  })

  const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'gestor_ventas', label: 'Gestor de Ventas' },
    { value: 'gestor_compras', label: 'Gestor de Compras' },
    { value: 'admin_inventario', label: 'Administrador de Inventario' },
    { value: 'empleado', label: 'Empleado' }
  ]

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      const response = await usuariosAPI.getAll()
      setUsuarios(response.data || [])
    } catch (error) {
      console.error('Error cargando usuarios:', error)
      alert('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editMode) {
        await usuariosAPI.update(formData._id, formData)
        alert('Usuario actualizado exitosamente')
      } else {
        await usuariosAPI.create(formData)
        alert('Usuario creado exitosamente')
      }
      handleCloseModal()
      cargarUsuarios()
    } catch (error) {
      console.error('Error guardando usuario:', error)
      alert(error.response?.data?.error || 'Error al guardar usuario')
    }
  }

  const handleEdit = (usuario) => {
    setFormData({
      ...usuario,
      password: '' // No mostrar password actual
    })
    setEditMode(true)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de desactivar este usuario?')) return
    
    try {
      await usuariosAPI.remove(id)
      alert('Usuario desactivado exitosamente')
      cargarUsuarios()
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      const errorMsg = error.message || 'Error al desactivar usuario'
      alert(errorMsg)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditMode(false)
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'empleado'
    })
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchSearch = usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchRol = filtroRol === 'todos' || usuario.rol === filtroRol
    return matchSearch && matchRol
  })

  const getRolLabel = (rol) => {
    const roleObj = roles.find(r => r.value === rol)
    return roleObj ? roleObj.label : rol
  }

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'rol', label: 'Rol' },
    { key: 'fechaCreacion', label: 'Fecha Creación' },
    { key: 'activo', label: 'Estado' }
  ]

  return (
    <div className='usuarios-container'>
      <Bar />
      <main className='usuarios-main'>
        <Nav />
        <div className='usuarios-content'>
          <div className='usuarios-header'>
            <div>
              <h1>Gestión de Usuarios</h1>
              <p className='subtitle'>Administra los usuarios del sistema</p>
            </div>
            <Button onClick={() => setModalOpen(true)} icon={<FaPlus />}>
              Nuevo Usuario
            </Button>
          </div>

          <Card>
            <div className='usuarios-filters'>
              <div className='search-box'>
                <FaSearch className='search-icon' />
                <input
                  type='text'
                  placeholder='Buscar por nombre o email...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='search-input'
                />
              </div>
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                className='filter-select'
              >
                <option value='todos'>Todos los roles</option>
                {roles.map(rol => (
                  <option key={rol.value} value={rol.value}>{rol.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className='loading'>Cargando usuarios...</div>
            ) : (
              <div className='table-container'>
                <table className='usuarios-table'>
                  <thead>
                    <tr>
                      {columns.map(col => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map(usuario => (
                      <tr key={usuario._id}>
                        <td>{usuario.nombre}</td>
                        <td>{usuario.email}</td>
                        <td>
                          <span className={`rol-badge rol-${usuario.rol}`}>
                            {getRolLabel(usuario.rol)}
                          </span>
                        </td>
                        <td>{new Date(usuario.fechaCreacion).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${usuario.activo !== false ? 'active' : 'inactive'}`}>
                            {usuario.activo !== false ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>
                          <div className='action-buttons'>
                            <button
                              className='btn-icon edit'
                              onClick={() => handleEdit(usuario)}
                              title='Editar'
                            >
                              <FaEdit />
                            </button>
                            <button
                              className='btn-icon delete'
                              onClick={() => handleDelete(usuario._id)}
                              title='Desactivar'
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {usuariosFiltrados.length === 0 && (
                  <div className='no-results'>
                    No se encontraron usuarios
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editMode ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit} className='usuario-form'>
          <Input
            label='Nombre Completo'
            name='nombre'
            value={formData.nombre}
            onChange={handleInputChange}
            icon={<FaUser />}
            required
          />
          <Input
            label='Email'
            name='email'
            type='email'
            value={formData.email}
            onChange={handleInputChange}
            icon={<FaEnvelope />}
            required
          />
          <Input
            label={editMode ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            name='password'
            type='password'
            value={formData.password}
            onChange={handleInputChange}
            icon={<FaLock />}
            required={!editMode}
          />
          <div className='form-group'>
            <label>
              <FaUserShield className='input-icon' />
              Rol
            </label>
            <select
              name='rol'
              value={formData.rol}
              onChange={handleInputChange}
              className='form-select'
              required
            >
              {roles.map(rol => (
                <option key={rol.value} value={rol.value}>{rol.label}</option>
              ))}
            </select>
          </div>
          <div className='modal-actions'>
            <Button type='button' variant='secondary' onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type='submit' variant='primary'>
              {editMode ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Usuarios
