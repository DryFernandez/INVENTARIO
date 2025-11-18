import React, { useState, useEffect } from 'react';
import "../css/lotes.css";
import Nav from "../components/nav/Nav";
import Bar from "../components/bar/Bar";
import Table from "../components/common/Table";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";
import Card from "../components/common/Card";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { productosAPI, almacenesAPI, proveedoresAPI } from "../services/api";
import lotesService from '../services/lotes';
import { IoIosAdd, IoMdSearch } from "react-icons/io";
import { FaEdit, FaTrash, FaEye, FaFileExport } from "react-icons/fa";
import { useToast } from '../context/ToastContext';

function Lotes() {
  const [lotes, setLotes] = useState([]);
  const [filteredLotes, setFilteredLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [productos, setProductos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, lote: null });
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    numeroLote: '',
    producto: '',
    almacen: '',
    cantidad: '',
    costoUnitario: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    proveedor: '',
    ubicacion: {
      pasillo: '',
      estante: '',
      nivel: ''
    },
    observaciones: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrar lotes cuando cambie el filtro o término de búsqueda
  useEffect(() => {
    aplicarFiltros();
  }, [lotes, filtro, searchTerm]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [lotesData, productosData, almacenesData, proveedoresData] = await Promise.all([
        lotesService.getAll(),
        productosAPI.getAll(),
        almacenesAPI.getAll(),
        proveedoresAPI.getAll()
      ]);
      
      console.log('✅ Lotes cargados:', lotesData);
      console.log('✅ Productos cargados:', productosData);
      console.log('✅ Almacenes cargados:', almacenesData);
      console.log('✅ Proveedores cargados:', proveedoresData);
      
      setLotes(lotesData);
      setProductos(productosData);
      setAlmacenes(almacenesData);
      setProveedores(proveedoresData);
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      error(err.message || 'Error al cargar los datos. Verifica que el servidor esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    try {
      let filtered = [...lotes];

      // Aplicar filtro de estado
      if (filtro === 'proximos-vencer') {
        const proximosData = await lotesService.getProximosVencer(30);
        filtered = proximosData;
      }

      // Aplicar búsqueda por término
      if (searchTerm) {
        filtered = filtered.filter(lote => 
          lote.numeroLote.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lote.producto?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lote.almacen?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredLotes(filtered);
    } catch (err) {
      console.error('Error aplicando filtros:', err);
      setFilteredLotes(lotes);
    }
  };

  const getDiasRestantes = (fechaVencimiento) => {
    if (!fechaVencimiento) return null;
    const dias = Math.ceil((new Date(fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24));
    return dias;
  };

  const getEstadoBadge = (fechaVencimiento) => {
    if (!fechaVencimiento) return { class: 'badge-info', text: 'Sin fecha' };
    const dias = getDiasRestantes(fechaVencimiento);
    if (dias < 0) return { class: 'badge-danger', text: 'Vencido' };
    if (dias <= 7) return { class: 'badge-danger', text: `${dias} días` };
    if (dias <= 30) return { class: 'badge-warning', text: `${dias} días` };
    return { class: 'badge-success', text: `${dias} días` };
  };

  const columns = [
    { header: "N° Lote", accessor: "numeroLote" },
    { 
      header: "Producto", 
      accessor: "producto",
      render: (row) => row.producto?.nombre || 'Sin producto'
    },
    { header: "Cantidad", accessor: "cantidad" },
    { 
      header: "Disponible",
      accessor: "cantidadDisponible",
      render: (row) => row.cantidadDisponible || row.cantidad
    },
    { 
      header: "Almacén", 
      accessor: "almacen",
      render: (row) => row.almacen?.nombre || 'Sin almacén'
    },
    {
      header: "Ubicación",
      accessor: "ubicacion",
      render: (row) => {
        if (row.ubicacion?.pasillo) {
          return (
            <span className="ubicacion">
              P:{row.ubicacion.pasillo} E:{row.ubicacion.estante} N:{row.ubicacion.nivel}
            </span>
          );
        }
        return 'Sin ubicación';
      }
    },
    {
      header: "F. Ingreso",
      accessor: "fechaIngreso",
      render: (row) => new Date(row.fechaIngreso).toLocaleDateString('es-ES')
    },
    {
      header: "F. Vencimiento",
      accessor: "fechaVencimiento", 
      render: (row) => row.fechaVencimiento ? new Date(row.fechaVencimiento).toLocaleDateString('es-ES') : 'Sin fecha'
    },
    {
      header: "Estado",
      accessor: "estado",
      render: (row) => {
        const estado = getEstadoBadge(row.fechaVencimiento);
        return (
          <span className={`badge ${estado.class}`}>
            {estado.text}
          </span>
        );
      }
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('ubicacion.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        ubicacion: {
          ...formData.ubicacion,
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
      if (isEditing) {
        await lotesService.update(editingId, formData);
        success('Lote actualizado exitosamente');
      } else {
        await lotesService.create(formData);
        success('Lote creado exitosamente');
      }
      await cargarDatos();
      resetForm();
    } catch (err) {
      console.error('Error al guardar lote:', err);
      error(err.message || 'Error al guardar el lote');
    }
  };

  const handleEdit = (lote) => {
    setFormData({
      numeroLote: lote.numeroLote,
      producto: lote.producto?._id || lote.producto,
      almacen: lote.almacen?._id || lote.almacen,
      cantidad: lote.cantidad,
      costoUnitario: lote.costoUnitario,
      fechaIngreso: new Date(lote.fechaIngreso).toISOString().split('T')[0],
      fechaVencimiento: lote.fechaVencimiento ? new Date(lote.fechaVencimiento).toISOString().split('T')[0] : '',
      proveedor: lote.proveedor?._id || lote.proveedor || '',
      ubicacion: {
        pasillo: lote.ubicacion?.pasillo || '',
        estante: lote.ubicacion?.estante || '',
        nivel: lote.ubicacion?.nivel || ''
      },
      observaciones: lote.observaciones || ''
    });
    setIsEditing(true);
    setEditingId(lote._id);
    setIsModalOpen(true);
  };

  const handleDelete = (lote) => {
    setConfirmDialog({ isOpen: true, lote });
  };

  const confirmDelete = async () => {
    try {
      await lotesService.delete(confirmDialog.lote._id);
      await cargarDatos();
      success('Lote eliminado exitosamente');
      setConfirmDialog({ isOpen: false, lote: null });
    } catch (err) {
      console.error('Error al eliminar lote:', err);
      error(err.message || 'Error al eliminar el lote');
    }
  };

  const resetForm = () => {
    setFormData({
      numeroLote: '',
      producto: '',
      almacen: '',
      cantidad: '',
      costoUnitario: '',
      fechaIngreso: new Date().toISOString().split('T')[0],
      fechaVencimiento: '',
      proveedor: '',
      ubicacion: {
        pasillo: '',
        estante: '',
        nivel: ''
      },
      observaciones: ''
    });
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const exportarLotes = () => {
    try {
      if (filteredLotes.length === 0) {
        error('No hay lotes para exportar');
        return;
      }

      const datosExportar = filteredLotes.map(lote => ({
        'Número Lote': lote.numeroLote,
        'Producto': lote.producto?.nombre || 'Sin producto',
        'Cantidad': lote.cantidad,
        'Cantidad Disponible': lote.cantidadDisponible || lote.cantidad,
        'Almacén': lote.almacen?.nombre || 'Sin almacén',
        'Ubicación': lote.ubicacion?.pasillo ? `P:${lote.ubicacion.pasillo} E:${lote.ubicacion.estante} N:${lote.ubicacion.nivel}` : 'Sin ubicación',
        'Fecha Ingreso': new Date(lote.fechaIngreso).toLocaleDateString('es-ES'),
        'Fecha Vencimiento': lote.fechaVencimiento ? new Date(lote.fechaVencimiento).toLocaleDateString('es-ES') : 'Sin fecha',
        'Costo Unitario': lote.costoUnitario || 0,
        'Estado': lote.estado || 'activo',
        'Proveedor': lote.proveedor?.nombre || 'Sin proveedor',
        'Observaciones': lote.observaciones || ''
      }));

      const headers = Object.keys(datosExportar[0]);
      const csvContent = [
        headers.join(','),
        ...datosExportar.map(row => 
          headers.map(header => {
            const value = row[header]?.toString() || '';
            return value.includes(',') || value.includes('"') 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `lotes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      success(`${datosExportar.length} lotes exportados exitosamente`);
    } catch (err) {
      console.error('Error al exportar lotes:', err);
      error('Error al exportar los lotes');
    }
  };

  if (loading) {
    return (
      <div className="lotes-container">
        <Bar />
        <main className="lotes-main">
          <Nav />
          <div className="lotes-content">
            <div className="loading">Cargando lotes...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="lotes-container">
      <Bar />
      <main className="lotes-main">
        <Nav />
        <div className="lotes-content">
          <div className="lotes-header">
            <div>
              <h1>📦 Gestión de Lotes</h1>
              <p className="subtitle">Control y seguimiento de lotes de productos</p>
            </div>
            <div className="header-actions">
              <Button
                variant="outline"
                icon={<FaFileExport />}
                onClick={exportarLotes}
              >
                Exportar
              </Button>
              <Button
                variant="primary"
                icon={<IoIosAdd />}
                onClick={() => setIsModalOpen(true)}
              >
                Nuevo Lote
              </Button>
            </div>
          </div>

          <Card>
            <div className="filters-section">
              <div className="search-box">
                <Input
                  placeholder="Buscar por lote, producto o almacén..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<IoMdSearch />}
                />
              </div>
              <div className="filter-buttons">
                <button 
                  className={filtro === 'todos' ? 'active' : ''} 
                  onClick={() => setFiltro('todos')}
                >
                  Todos los Lotes
                </button>
                <button 
                  className={filtro === 'proximos-vencer' ? 'active' : ''} 
                  onClick={() => setFiltro('proximos-vencer')}
                >
                  Próximos a Vencer (30 días)
                </button>
              </div>
            </div>

            <Table
              columns={columns}
              data={filteredLotes}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Card>
        </div>
      </main>

      {/* Modal de Crear/Editar Lote */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={isEditing ? "Editar Lote" : "Nuevo Lote"}
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Input
              label="Número de Lote"
              name="numeroLote"
              value={formData.numeroLote}
              onChange={handleInputChange}
              placeholder={isEditing ? "Requerido" : "Se generará automáticamente si se deja vacío"}
              disabled={!isEditing && formData.numeroLote === ''}
            />
            <div className="form-group">
              <label className="input-label">Producto *</label>
              <select
                className="input"
                name="producto"
                value={formData.producto}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar producto</option>
                {productos.map(prod => (
                  <option key={prod._id} value={prod._id}>{prod.nombre}</option>
                ))}
              </select>
            </div>
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
            <Input
              label="Cantidad"
              name="cantidad"
              type="number"
              value={formData.cantidad}
              onChange={handleInputChange}
              required
              min="1"
            />
            <Input
              label="Costo Unitario"
              name="costoUnitario"
              type="number"
              step="0.01"
              value={formData.costoUnitario}
              onChange={handleInputChange}
              required
              min="0"
            />
            <Input
              label="Fecha de Ingreso"
              name="fechaIngreso"
              type="date"
              value={formData.fechaIngreso}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Fecha de Vencimiento"
              name="fechaVencimiento"
              type="date"
              value={formData.fechaVencimiento}
              onChange={handleInputChange}
            />
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

          <div className="ubicacion-section">
            <h3>Ubicación en Almacén</h3>
            <div className="form-grid-3">
              <Input
                label="Pasillo"
                name="ubicacion.pasillo"
                value={formData.ubicacion.pasillo}
                onChange={handleInputChange}
                placeholder="Ej: A"
              />
              <Input
                label="Estante"
                name="ubicacion.estante"
                value={formData.ubicacion.estante}
                onChange={handleInputChange}
                placeholder="Ej: 1"
              />
              <Input
                label="Nivel"
                name="ubicacion.nivel"
                value={formData.ubicacion.nivel}
                onChange={handleInputChange}
                placeholder="Ej: 2"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Observaciones</label>
            <textarea
              className="input"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              rows="3"
              placeholder="Notas adicionales sobre el lote..."
            />
          </div>

          <div className="modal-actions">
            <Button variant="ghost" onClick={resetForm} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {isEditing ? "Actualizar" : "Crear"} Lote
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Confirmar eliminación"
        message={`¿Eliminar el lote "${confirmDialog.lote?.numeroLote}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, lote: null })}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}

export default Lotes;
