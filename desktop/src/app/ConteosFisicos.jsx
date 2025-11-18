import React, { useState, useEffect } from 'react';
import "../css/conteosFisicos.css";
import Nav from "../components/nav/Nav";
import Bar from "../components/bar/Bar";
import Table from "../components/common/Table";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";
import Card from "../components/common/Card";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { almacenesAPI, categoriasAPI, productosAPI } from "../services/api";
import conteosFisicosService from '../services/conteosFisicos';
import { IoIosAdd, IoMdSearch } from "react-icons/io";
import { FaEdit, FaTrash, FaEye, FaFileExport, FaPlay, FaCheck, FaCog } from "react-icons/fa";
import { useToast } from '../context/ToastContext';

function ConteosFisicos() {
  const [conteos, setConteos] = useState([]);
  const [filteredConteos, setFilteredConteos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [almacenes, setAlmacenes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [conteoSeleccionado, setConteoSeleccionado] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, conteo: null, action: null });
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    almacen: '',
    tipo: 'completo',
    categoria: '',
    fechaPlanificada: new Date().toISOString().split('T')[0],
    observaciones: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrar conteos cuando cambien los filtros o término de búsqueda
  useEffect(() => {
    aplicarFiltros();
  }, [conteos, searchTerm, filterEstado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [conteosData, almacenesData, categoriasData] = await Promise.all([
        conteosFisicosService.getAll(),
        almacenesAPI.getAll(),
        categoriasAPI.getAll()
      ]);
      
      console.log('✅ Conteos cargados:', conteosData);
      console.log('✅ Almacenes cargados:', almacenesData);
      console.log('✅ Categorías cargadas:', categoriasData);
      
      setConteos(conteosData);
      setAlmacenes(almacenesData);
      setCategorias(categoriasData);
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      error(err.message || 'Error al cargar los datos. Verifica que el servidor esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let filtered = [...conteos];

    // Filtrar por estado
    if (filterEstado !== 'todos') {
      filtered = filtered.filter(conteo => conteo.estado === filterEstado);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(conteo => 
        conteo.numeroConteo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conteo.almacen?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conteo.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredConteos(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si se cambia el tipo de conteo y no es 'categoria', limpiar el campo categoria
    if (name === 'tipo' && value !== 'categoria') {
      setFormData({
        ...formData,
        [name]: value,
        categoria: ''
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
      // Validar que si el tipo es 'categoria', se haya seleccionado una categoría
      if (formData.tipo === 'categoria' && !formData.categoria) {
        error('Debe seleccionar una categoría para un conteo por categoría');
        return;
      }
      
      // Preparar datos para envío
      const dataToSend = { ...formData };
      
      // Si el tipo no es 'categoria', no enviar el campo categoria
      if (formData.tipo !== 'categoria') {
        delete dataToSend.categoria;
      }
      
      // Limpiar campos vacíos opcionales
      const camposOpcionales = ['observaciones'];
      camposOpcionales.forEach(campo => {
        if (dataToSend[campo] === '' || dataToSend[campo] === null || dataToSend[campo] === undefined) {
          delete dataToSend[campo];
        }
      });
      
      await conteosFisicosService.create(dataToSend);
      success('Conteo físico planificado exitosamente');
      await cargarDatos();
      resetForm();
    } catch (err) {
      console.error('Error al crear conteo:', err);
      error(err.message || 'Error al planificar el conteo');
    }
  };

  const handleVerDetalle = async (conteo) => {
    try {
      const detalleConteo = await conteosFisicosService.getById(conteo._id);
      setConteoSeleccionado(detalleConteo);
      setIsDetalleModalOpen(true);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
      error('Error al cargar el detalle del conteo');
    }
  };

  const handleIniciar = (conteo) => {
    setConfirmDialog({
      isOpen: true,
      conteo,
      action: 'iniciar',
      title: 'Iniciar Conteo',
      message: `¿Iniciar el conteo físico "${conteo.numeroConteo}"?`
    });
  };

  const handleCompletar = (conteo) => {
    setConfirmDialog({
      isOpen: true,
      conteo,
      action: 'completar',
      title: 'Completar Conteo',
      message: `¿Marcar como completado el conteo "${conteo.numeroConteo}"? Asegúrate de que todos los productos hayan sido contados.`
    });
  };

  const handleAjustar = (conteo) => {
    setConfirmDialog({
      isOpen: true,
      conteo,
      action: 'ajustar',
      title: 'Aplicar Ajustes',
      message: `¿Aplicar los ajustes de inventario del conteo "${conteo.numeroConteo}"? Esta acción actualizará el stock de los productos y no se puede deshacer.`
    });
  };

  const confirmarAccion = async () => {
    const { conteo, action } = confirmDialog;
    try {
      switch (action) {
        case 'iniciar':
          await conteosFisicosService.iniciar(conteo._id);
          success('Conteo iniciado exitosamente');
          break;
        case 'completar':
          await conteosFisicosService.completar(conteo._id);
          success('Conteo completado exitosamente');
          break;
        case 'ajustar':
          const result = await conteosFisicosService.ajustar(conteo._id);
          success(`Ajustes aplicados exitosamente`);
          break;
        default:
          break;
      }
      await cargarDatos();
      setConfirmDialog({ isOpen: false, conteo: null, action: null });
    } catch (err) {
      console.error(`Error en ${action}:`, err);
      error(err.message || `Error al ${action} el conteo`);
    }
  };

  const resetForm = () => {
    setFormData({
      almacen: '',
      tipo: 'completo',
      categoria: '',
      fechaPlanificada: new Date().toISOString().split('T')[0],
      observaciones: ''
    });
    setIsModalOpen(false);
  };

  const exportarConteos = () => {
    try {
      if (filteredConteos.length === 0) {
        error('No hay conteos para exportar');
        return;
      }

      const datosExportar = filteredConteos.map(conteo => ({
        'Número Conteo': conteo.numeroConteo,
        'Almacén': conteo.almacen?.nombre || 'Sin almacén',
        'Tipo': conteo.tipo,
        'Estado': conteo.estado,
        'Fecha Planificada': new Date(conteo.fechaPlanificada).toLocaleDateString('es-ES'),
        'Fecha Inicio': conteo.fechaInicio ? new Date(conteo.fechaInicio).toLocaleDateString('es-ES') : 'No iniciado',
        'Fecha Fin': conteo.fechaFin ? new Date(conteo.fechaFin).toLocaleDateString('es-ES') : 'No finalizado',
        'Total Items': conteo.items?.length || 0,
        'Items Contados': conteo.items?.filter(i => i.stockFisico !== null).length || 0,
        'Total Diferencias': conteo.totalDiferencias || 0,
        'Valor Diferencias': conteo.totalValorDiferencias || 0,
        'Ajuste Realizado': conteo.ajusteRealizado ? 'Sí' : 'No',
        'Observaciones': conteo.observaciones || ''
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
      link.setAttribute('download', `conteos_fisicos_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      success(`${datosExportar.length} conteos exportados exitosamente`);
    } catch (err) {
      console.error('Error al exportar conteos:', err);
      error('Error al exportar los conteos');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      planificado: 'badge-secondary',
      en_proceso: 'badge-info',
      completado: 'badge-success',
      ajustado: 'badge-primary',
      cancelado: 'badge-danger'
    };
    return badges[estado] || 'badge-secondary';
  };

  const getTipoBadge = (tipo) => {
    const badges = {
      completo: 'badge-warning',
      ciclico: 'badge-info',
      aleatorio: 'badge-secondary',
      categoria: 'badge-primary'
    };
    return badges[tipo] || 'badge-secondary';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      planificado: 'Planificado',
      en_proceso: 'En Proceso',
      completado: 'Completado',
      ajustado: 'Ajustado',
      cancelado: 'Cancelado'
    };
    return textos[estado] || estado;
  };

  const getTipoTexto = (tipo) => {
    const textos = {
      completo: 'Completo',
      ciclico: 'Cíclico',
      aleatorio: 'Aleatorio',
      categoria: 'Por Categoría'
    };
    return textos[tipo] || tipo;
  };

  const columns = [
    { 
      header: "N° Conteo", 
      accessor: "numeroConteo",
      render: (row) => <strong>{row.numeroConteo}</strong>
    },
    {
      header: "Fecha Planificada",
      accessor: "fechaPlanificada",
      render: (row) => new Date(row.fechaPlanificada).toLocaleDateString('es-ES')
    },
    { 
      header: "Almacén", 
      accessor: "almacen",
      render: (row) => row.almacen?.nombre || 'Sin almacén'
    },
    {
      header: "Tipo",
      accessor: "tipo",
      render: (row) => (
        <span className={`badge ${getTipoBadge(row.tipo)}`}>
          {getTipoTexto(row.tipo)}
        </span>
      )
    },
    {
      header: "Items",
      accessor: "items",
      render: (row) => {
        const contados = row.items?.filter(i => i.stockFisico !== null && i.stockFisico !== undefined).length || 0;
        const total = row.items?.length || 0;
        return `${contados}/${total}`;
      }
    },
    {
      header: "Diferencias",
      accessor: "totalDiferencias",
      render: (row) => {
        if (row.totalDiferencias === undefined || row.totalDiferencias === null) return '-';
        return (
          <span className={row.totalDiferencias !== 0 ? 'text-warning' : 'text-success'}>
            {row.totalDiferencias}
          </span>
        );
      }
    },
    {
      header: "Estado",
      accessor: "estado",
      render: (row) => (
        <span className={`badge ${getEstadoBadge(row.estado)}`}>
          {getEstadoTexto(row.estado)}
        </span>
      )
    }
  ];

  const getAcciones = (conteo) => {
    const acciones = [];
    
    acciones.push({
      icon: <FaEye />,
      label: "Ver",
      onClick: () => handleVerDetalle(conteo),
      variant: "outline"
    });

    switch (conteo.estado) {
      case 'planificado':
        acciones.push({
          icon: <FaPlay />,
          label: "Iniciar",
          onClick: () => handleIniciar(conteo),
          variant: "info"
        });
        break;
      case 'en_proceso':
        acciones.push({
          icon: <FaCheck />,
          label: "Completar",
          onClick: () => handleCompletar(conteo),
          variant: "success"
        });
        break;
      case 'completado':
        acciones.push({
          icon: <FaCog />,
          label: "Aplicar Ajustes",
          onClick: () => handleAjustar(conteo),
          variant: "warning"
        });
        break;
    }

    return acciones;
  };

  if (loading) {
    return (
      <div className="conteos-container">
        <Bar />
        <main className="conteos-main">
          <Nav />
          <div className="conteos-content">
            <div className="loading">Cargando conteos físicos...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="conteos-container">
      <Bar />
      <main className="conteos-main">
        <Nav />
        <div className="conteos-content">
          <div className="conteos-header">
            <div>
              <h1>📋 Conteos Físicos</h1>
              <p className="subtitle">Control y auditoría de inventario físico</p>
            </div>
            <div className="header-actions">
              <Button
                variant="outline"
                icon={<FaFileExport />}
                onClick={exportarConteos}
              >
                Exportar
              </Button>
              <Button
                variant="primary"
                icon={<IoIosAdd />}
                onClick={() => setIsModalOpen(true)}
              >
                Planificar Conteo
              </Button>
            </div>
          </div>

          <Card>
            <div className="filters-section">
              <div className="search-box">
                <Input
                  placeholder="Buscar por número, almacén o tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<IoMdSearch />}
                />
              </div>
              <div className="filter-select">
                <select
                  className="input"
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="planificado">Planificados</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="completado">Completados</option>
                  <option value="ajustado">Ajustados</option>
                </select>
              </div>
            </div>

            <Table
              columns={columns}
              data={filteredConteos}
              renderActions={(row) => (
                <div className="acciones">
                  {getAcciones(row).map((accion, index) => (
                    <Button
                      key={index}
                      size="small"
                      variant={accion.variant}
                      icon={accion.icon}
                      onClick={accion.onClick}
                    >
                      {accion.label}
                    </Button>
                  ))}
                </div>
              )}
            />
          </Card>
        </div>
      </main>

      {/* Modal de Planificar Conteo */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title="Planificar Conteo Físico"
        size="medium"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
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
              <label className="input-label">Tipo de Conteo *</label>
              <select
                className="input"
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                required
              >
                <option value="completo">Conteo Completo</option>
                <option value="ciclico">Conteo Cíclico</option>
                <option value="aleatorio">Conteo Aleatorio</option>
                <option value="categoria">Por Categoría</option>
              </select>
            </div>
            {formData.tipo === 'categoria' && (
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
                {formData.tipo === 'categoria' && !formData.categoria && (
                  <small className="text-error">Debe seleccionar una categoría para este tipo de conteo</small>
                )}
              </div>
            )}
            <Input
              label="Fecha Planificada"
              name="fechaPlanificada"
              type="date"
              value={formData.fechaPlanificada}
              onChange={handleInputChange}
              required
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
              placeholder="Notas adicionales sobre el conteo..."
            />
          </div>
          <div className="modal-actions">
            <Button variant="ghost" onClick={resetForm} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Planificar Conteo
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Detalle del Conteo */}
      <Modal
        isOpen={isDetalleModalOpen}
        onClose={() => setIsDetalleModalOpen(false)}
        title={`Detalle del Conteo ${conteoSeleccionado?.numeroConteo}`}
        size="large"
      >
        {conteoSeleccionado && (
          <div className="conteo-detalle">
            <div className="detalle-header">
              <div className="info-grid">
                <div>
                  <strong>Almacén:</strong> {conteoSeleccionado.almacen?.nombre}
                </div>
                <div>
                  <strong>Tipo:</strong> {getTipoTexto(conteoSeleccionado.tipo)}
                </div>
                <div>
                  <strong>Estado:</strong> 
                  <span className={`badge ${getEstadoBadge(conteoSeleccionado.estado)}`}>
                    {getEstadoTexto(conteoSeleccionado.estado)}
                  </span>
                </div>
                <div>
                  <strong>Fecha Planificada:</strong> {new Date(conteoSeleccionado.fechaPlanificada).toLocaleDateString('es-ES')}
                </div>
                {conteoSeleccionado.fechaInicio && (
                  <div>
                    <strong>Fecha Inicio:</strong> {new Date(conteoSeleccionado.fechaInicio).toLocaleDateString('es-ES')}
                  </div>
                )}
                {conteoSeleccionado.fechaFin && (
                  <div>
                    <strong>Fecha Fin:</strong> {new Date(conteoSeleccionado.fechaFin).toLocaleDateString('es-ES')}
                  </div>
                )}
              </div>
            </div>
            
            <div className="items-resumen">
              <h3>Resumen de Items</h3>
              <div className="resumen-stats">
                <div className="stat">
                  <span className="stat-number">{conteoSeleccionado.items?.length || 0}</span>
                  <span className="stat-label">Total Items</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    {conteoSeleccionado.items?.filter(i => i.stockFisico !== null && i.stockFisico !== undefined).length || 0}
                  </span>
                  <span className="stat-label">Contados</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{conteoSeleccionado.totalDiferencias || 0}</span>
                  <span className="stat-label">Con Diferencias</span>
                </div>
                <div className="stat">
                  <span className="stat-number">${conteoSeleccionado.totalValorDiferencias || 0}</span>
                  <span className="stat-label">Valor Diferencias</span>
                </div>
              </div>
            </div>

            {conteoSeleccionado.observaciones && (
              <div className="observaciones">
                <h3>Observaciones</h3>
                <p>{conteoSeleccionado.observaciones}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmarAccion}
        onCancel={() => setConfirmDialog({ isOpen: false, conteo: null, action: null })}
        confirmText={confirmDialog.action === 'ajustar' ? 'Aplicar Ajustes' : 'Confirmar'}
        cancelText="Cancelar"
        type={confirmDialog.action === 'ajustar' ? 'warning' : 'info'}
      />
    </div>
  );
}

export default ConteosFisicos;
