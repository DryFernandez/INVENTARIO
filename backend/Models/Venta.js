// models/Venta.js
const mongoose = require('mongoose');

const ItemVentaSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true }
});

const VentaSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true }, // Actualizado
  items: [ItemVentaSchema],
  fechaVenta: { type: Date, default: Date.now },
  total: { type: Number, required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  metodoPago: { type: String, enum: ['efectivo', 'tarjeta', 'transferencia'], required: true },
  numeroComprobante: { type: String } // Nuevo campo
});

module.exports = mongoose.model('Venta', VentaSchema);