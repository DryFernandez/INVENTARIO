// models/InventarioLog.js
const mongoose = require('mongoose');

const InventarioLogSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true }, // +50 (entrada) o -30 (salida)
  tipo: { type: String, enum: ['compra', 'venta', 'ajuste', 'traslado'], required: true },
  referencia: { type: mongoose.Schema.Types.ObjectId }, // ID de Compra/Venta/Ajuste/Traslado
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  fecha: { type: Date, default: Date.now },
  detalle: { type: String } // Ej: "Ajuste por pérdida física"
});

module.exports = mongoose.model('InventarioLog', InventarioLogSchema);