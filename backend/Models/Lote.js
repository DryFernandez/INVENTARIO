// models/Lote.js
const mongoose = require('mongoose');

const LoteSchema = new mongoose.Schema({
  numeroLote: { type: String, required: true, unique: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  almacen: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen', required: true },
  cantidad: { type: Number, required: true, min: 0 },
  cantidadDisponible: { type: Number, required: true, min: 0 },
  costoUnitario: { type: Number, required: true, min: 0 },
  fechaIngreso: { type: Date, default: Date.now },
  fechaVencimiento: { type: Date },
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor' },
  compra: { type: mongoose.Schema.Types.ObjectId, ref: 'Compra' },
  numerosSerieInicio: { type: String }, // Rango de series
  numeroserieFin: { type: String },
  estado: { 
    type: String, 
    enum: ['activo', 'vencido', 'agotado', 'retirado'], 
    default: 'activo' 
  },
  ubicacion: {
    pasillo: { type: String },
    estante: { type: String },
    nivel: { type: String }
  },
  observaciones: { type: String },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  fechaCreacion: { type: Date, default: Date.now }
}, { timestamps: true });

// Índices para búsquedas rápidas
LoteSchema.index({ producto: 1, almacen: 1, estado: 1 });
LoteSchema.index({ fechaVencimiento: 1 });

module.exports = mongoose.model('Lote', LoteSchema);
