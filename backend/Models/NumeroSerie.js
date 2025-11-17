// models/NumeroSerie.js
const mongoose = require('mongoose');

const NumeroSerieSchema = new mongoose.Schema({
  numeroSerie: { type: String, required: true, unique: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  lote: { type: mongoose.Schema.Types.ObjectId, ref: 'Lote' },
  almacen: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen', required: true },
  estado: { 
    type: String, 
    enum: ['disponible', 'vendido', 'defectuoso', 'en_garantia', 'devuelto'], 
    default: 'disponible' 
  },
  fechaIngreso: { type: Date, default: Date.now },
  fechaSalida: { type: Date },
  venta: { type: mongoose.Schema.Types.ObjectId, ref: 'Venta' },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
  observaciones: { type: String },
  garantiaMeses: { type: Number, default: 12 },
  fechaVencimientoGarantia: { type: Date }
}, { timestamps: true });

// Índices
NumeroSerieSchema.index({ producto: 1, estado: 1 });
NumeroSerieSchema.index({ numeroSerie: 1 });

module.exports = mongoose.model('NumeroSerie', NumeroSerieSchema);
