// models/ReservaStock.js
const mongoose = require('mongoose');

const ReservaStockSchema = new mongoose.Schema({
  numeroReserva: { type: String, required: true, unique: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  variante: { type: mongoose.Schema.Types.ObjectId, ref: 'VarianteProducto' },
  almacen: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen', required: true },
  lote: { type: mongoose.Schema.Types.ObjectId, ref: 'Lote' },
  cantidad: { type: Number, required: true, min: 1 },
  cantidadUtilizada: { type: Number, default: 0, min: 0 },
  cantidadDisponible: { type: Number, required: true },
  tipo: {
    type: String,
    enum: ['cotizacion', 'venta', 'orden_produccion', 'otro'],
    required: true
  },
  referencia: { type: mongoose.Schema.Types.ObjectId }, // ID de cotización, venta, etc.
  referenciaModelo: { type: String }, // Modelo de la referencia
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
  estado: {
    type: String,
    enum: ['activa', 'parcial', 'completada', 'cancelada', 'vencida'],
    default: 'activa'
  },
  fechaReserva: { type: Date, default: Date.now },
  fechaVencimiento: { type: Date, required: true },
  prioridad: {
    type: String,
    enum: ['alta', 'media', 'baja'],
    default: 'media'
  },
  observaciones: { type: String },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  canceladoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  fechaCancelacion: { type: Date },
  motivoCancelacion: { type: String }
}, { timestamps: true });

// Índices
ReservaStockSchema.index({ numeroReserva: 1 });
ReservaStockSchema.index({ producto: 1, almacen: 1, estado: 1 });
ReservaStockSchema.index({ fechaVencimiento: 1 });
ReservaStockSchema.index({ estado: 1 });

module.exports = mongoose.model('ReservaStock', ReservaStockSchema);
