// models/Compra.js
const mongoose = require('mongoose');

const ItemCompraSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true }
});

const CompraSchema = new mongoose.Schema({
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', required: true },
  items: [ItemCompraSchema],
  fechaCompra: { type: Date, default: Date.now },
  total: { type: Number, required: true },
  numeroFactura: { type: String, unique: true }, // Nuevo campo
  pagado: { type: Boolean, default: false }, // Nuevo campo
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  estado: { type: String, enum: ['pendiente', 'completada', 'cancelada'], default: 'pendiente' }
});

module.exports = mongoose.model('Compra', CompraSchema);