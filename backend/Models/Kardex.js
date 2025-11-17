// models/Kardex.js
const mongoose = require('mongoose');

const KardexSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  almacen: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen', required: true },
  lote: { type: mongoose.Schema.Types.ObjectId, ref: 'Lote' },
  tipo: {
    type: String,
    enum: ['entrada', 'salida', 'ajuste', 'traslado_entrada', 'traslado_salida'],
    required: true
  },
  operacion: {
    type: String,
    enum: ['compra', 'venta', 'ajuste_positivo', 'ajuste_negativo', 'traslado', 'devolucion', 'merma', 'otro'],
    required: true
  },
  cantidad: { type: Number, required: true },
  costoUnitario: { type: Number, required: true },
  costoTotal: { type: Number, required: true },
  saldoCantidad: { type: Number, required: true },
  saldoValor: { type: Number, required: true },
  costoPromedio: { type: Number, required: true },
  referencia: { type: mongoose.Schema.Types.ObjectId },
  referenciaModelo: { type: String },
  numeroDocumento: { type: String },
  descripcion: { type: String },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  fecha: { type: Date, default: Date.now }
}, { timestamps: true });

// Índices para búsquedas rápidas
KardexSchema.index({ producto: 1, almacen: 1, fecha: -1 });
KardexSchema.index({ fecha: -1 });
KardexSchema.index({ tipo: 1, operacion: 1 });

module.exports = mongoose.model('Kardex', KardexSchema);
