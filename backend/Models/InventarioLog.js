// models/InventarioLog.js
const mongoose = require('mongoose');

const InventarioLogSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  almacen: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen' },
  cantidad: { type: Number, required: true }, // +50 (entrada) o -30 (salida)
  tipo: { type: String, enum: ['entrada', 'salida', 'compra', 'venta', 'ajuste', 'traslado'], required: true },
  motivo: { type: String }, // Ej: "inventario_inicial", "venta", "compra", etc.
  referencia: { type: mongoose.Schema.Types.ObjectId }, // ID de Compra/Venta/Ajuste/Traslado
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  stockAnterior: { type: Number },
  stockNuevo: { type: Number },
  fecha: { type: Date, default: Date.now },
  detalle: { type: String } // Ej: "Ajuste por pérdida física"
});

module.exports = mongoose.model('InventarioLog', InventarioLogSchema);