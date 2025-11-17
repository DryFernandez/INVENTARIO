// models/ConteoFisico.js
const mongoose = require('mongoose');

const ConteoFisicoSchema = new mongoose.Schema({
  numeroConteo: { type: String, required: true, unique: true },
  almacen: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen', required: true },
  tipo: {
    type: String,
    enum: ['completo', 'ciclico', 'aleatorio', 'categoria'],
    default: 'completo'
  },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' }, // Si es por categoría
  estado: {
    type: String,
    enum: ['planificado', 'en_proceso', 'completado', 'ajustado', 'cancelado'],
    default: 'planificado'
  },
  fechaPlanificada: { type: Date, required: true },
  fechaInicio: { type: Date },
  fechaFin: { type: Date },
  items: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    variante: { type: mongoose.Schema.Types.ObjectId, ref: 'VarianteProducto' },
    lote: { type: mongoose.Schema.Types.ObjectId, ref: 'Lote' },
    stockSistema: { type: Number, required: true },
    stockFisico: { type: Number },
    diferencia: { type: Number },
    valorDiferencia: { type: Number }, // Costo * diferencia
    motivoDiferencia: { type: String },
    contadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    verificadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    fechaConteo: { type: Date },
    observaciones: { type: String }
  }],
  totalDiferencias: { type: Number, default: 0 },
  totalValorDiferencias: { type: Number, default: 0 },
  ajusteRealizado: { type: Boolean, default: false },
  ajusteInventario: { type: mongoose.Schema.Types.ObjectId, ref: 'InventarioLog' },
  observaciones: { type: String },
  responsables: [{
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    rol: { type: String, enum: ['coordinador', 'contador', 'verificador'] }
  }],
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  aprobadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  fechaAprobacion: { type: Date }
}, { timestamps: true });

// Índices
ConteoFisicoSchema.index({ numeroConteo: 1 });
ConteoFisicoSchema.index({ almacen: 1, estado: 1 });
ConteoFisicoSchema.index({ fechaPlanificada: -1 });

module.exports = mongoose.model('ConteoFisico', ConteoFisicoSchema);
