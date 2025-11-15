// models/Venta.js
const mongoose = require('mongoose');

const ItemVentaSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true }
});

const DatosTarjetaSchema = new mongoose.Schema({
  numeroTarjeta: { type: String }, // Últimos 4 dígitos
  titular: { type: String },
  fechaExpiracion: { type: String }
});

const VentaSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  items: [ItemVentaSchema],
  fechaVenta: { type: Date, default: Date.now },
  subtotal: { type: Number, required: true },
  impuesto: { type: Number, required: true },
  total: { type: Number, required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  metodoPago: { type: String, enum: ['efectivo', 'tarjeta'], required: true },
  datosTarjeta: DatosTarjetaSchema,
  numeroComprobante: { type: String },
  estado: { type: String, enum: ['completada', 'cancelada'], default: 'completada' }
});

module.exports = mongoose.model('Venta', VentaSchema);