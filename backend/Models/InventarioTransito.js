// models/InventarioTransito.js
const mongoose = require('mongoose');

const InventarioTransitoSchema = new mongoose.Schema({
  numeroTransito: { type: String, required: true, unique: true },
  traslado: { type: mongoose.Schema.Types.ObjectId, ref: 'Traslado', required: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  variante: { type: mongoose.Schema.Types.ObjectId, ref: 'VarianteProducto' },
  lote: { type: mongoose.Schema.Types.ObjectId, ref: 'Lote' },
  cantidad: { type: Number, required: true, min: 1 },
  almacenOrigen: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen', required: true },
  almacenDestino: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen', required: true },
  estado: {
    type: String,
    enum: ['en_preparacion', 'despachado', 'en_transito', 'recibido', 'cancelado'],
    default: 'en_preparacion'
  },
  fechaSalida: { type: Date },
  fechaLlegadaEstimada: { type: Date },
  fechaLlegadaReal: { type: Date },
  transportista: { type: String },
  numeroGuia: { type: String },
  vehiculo: { type: String },
  conductor: { type: String },
  observaciones: { type: String },
  despachadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  recibidoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  incidencias: [{
    tipo: { type: String, enum: ['retraso', 'merma', 'daño', 'otro'] },
    descripcion: { type: String },
    cantidadAfectada: { type: Number },
    fecha: { type: Date, default: Date.now },
    reportadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
  }]
}, { timestamps: true });

// Índices
InventarioTransitoSchema.index({ numeroTransito: 1 });
InventarioTransitoSchema.index({ traslado: 1 });
InventarioTransitoSchema.index({ almacenOrigen: 1, almacenDestino: 1, estado: 1 });
InventarioTransitoSchema.index({ estado: 1, fechaLlegadaEstimada: 1 });

module.exports = mongoose.model('InventarioTransito', InventarioTransitoSchema);
