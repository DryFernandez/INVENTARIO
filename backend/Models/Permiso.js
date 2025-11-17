// models/Permiso.js
const mongoose = require('mongoose');

const PermisoSchema = new mongoose.Schema({
  rol: { 
    type: String, 
    enum: ['admin', 'gestor_ventas', 'gestor_compras', 'admin_inventario', 'empleado', 'auditor'], 
    required: true,
    unique: true
  },
  modulos: {
    productos: {
      ver: { type: Boolean, default: false },
      crear: { type: Boolean, default: false },
      editar: { type: Boolean, default: false },
      eliminar: { type: Boolean, default: false }
    },
    inventario: {
      ver: { type: Boolean, default: false },
      ajustar: { type: Boolean, default: false },
      transferir: { type: Boolean, default: false },
      conteo: { type: Boolean, default: false }
    },
    compras: {
      ver: { type: Boolean, default: false },
      crear: { type: Boolean, default: false },
      aprobar: { type: Boolean, default: false },
      cancelar: { type: Boolean, default: false }
    },
    ventas: {
      ver: { type: Boolean, default: false },
      crear: { type: Boolean, default: false },
      editar: { type: Boolean, default: false },
      cancelar: { type: Boolean, default: false }
    },
    cotizaciones: {
      ver: { type: Boolean, default: false },
      crear: { type: Boolean, default: false },
      aprobar: { type: Boolean, default: false },
      convertir: { type: Boolean, default: false }
    },
    clientes: {
      ver: { type: Boolean, default: false },
      crear: { type: Boolean, default: false },
      editar: { type: Boolean, default: false },
      eliminar: { type: Boolean, default: false }
    },
    proveedores: {
      ver: { type: Boolean, default: false },
      crear: { type: Boolean, default: false },
      editar: { type: Boolean, default: false },
      eliminar: { type: Boolean, default: false }
    },
    usuarios: {
      ver: { type: Boolean, default: false },
      crear: { type: Boolean, default: false },
      editar: { type: Boolean, default: false },
      eliminar: { type: Boolean, default: false }
    },
    reportes: {
      inventario: { type: Boolean, default: false },
      ventas: { type: Boolean, default: false },
      compras: { type: Boolean, default: false },
      financiero: { type: Boolean, default: false },
      auditoria: { type: Boolean, default: false }
    },
    configuracion: {
      almacenes: { type: Boolean, default: false },
      categorias: { type: Boolean, default: false },
      permisos: { type: Boolean, default: false },
      sistema: { type: Boolean, default: false }
    }
  },
  descripcion: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Permiso', PermisoSchema);
