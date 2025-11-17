// models/Auditoria.js
const mongoose = require('mongoose');

const AuditoriaSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  accion: { 
    type: String, 
    required: true,
    enum: [
      'crear', 'editar', 'eliminar', 'activar', 'desactivar',
      'compra', 'venta', 'ajuste', 'traslado', 'devolucion',
      'login', 'logout', 'cambio_password', 'cambio_permisos',
      'aprobar', 'rechazar', 'cancelar'
    ]
  },
  modulo: {
    type: String,
    required: true,
    enum: [
      'productos', 'categorias', 'almacenes', 'proveedores', 'clientes',
      'compras', 'ventas', 'traslados', 'inventario', 'usuarios',
      'cotizaciones', 'ordenes_compra', 'conteos_fisicos', 'auth', 'permisos'
    ]
  },
  entidad: { type: String, required: true }, // ID del documento afectado
  entidadTipo: { type: String, required: true }, // Nombre del modelo
  datosAnteriores: { type: mongoose.Schema.Types.Mixed }, // JSON con datos antes del cambio
  datosNuevos: { type: mongoose.Schema.Types.Mixed }, // JSON con datos después del cambio
  ip: { type: String },
  userAgent: { type: String },
  descripcion: { type: String }, // Descripción legible de la acción
  exitoso: { type: Boolean, default: true },
  mensajeError: { type: String },
  fechaHora: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

// Índices para búsquedas rápidas
AuditoriaSchema.index({ usuario: 1, fechaHora: -1 });
AuditoriaSchema.index({ modulo: 1, accion: 1 });
AuditoriaSchema.index({ entidad: 1, entidadTipo: 1 });
AuditoriaSchema.index({ fechaHora: -1 });

module.exports = mongoose.model('Auditoria', AuditoriaSchema);
