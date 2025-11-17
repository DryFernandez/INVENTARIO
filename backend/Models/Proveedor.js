// models/Proveedor.js
const mongoose = require('mongoose');

const ProveedorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  nombreComercial: { type: String },
  ruc: { type: String, unique: true, sparse: true },
  tipoDocumento: { type: String, enum: ['RUC', 'DNI', 'CE', 'PASAPORTE'], default: 'RUC' },
  contactoPrincipal: {
    nombre: { type: String },
    telefono: { type: String },
    email: { type: String },
    cargo: { type: String }
  },
  contactosAdicionales: [{
    nombre: { type: String },
    telefono: { type: String },
    email: { type: String },
    cargo: { type: String }
  }],
  direccion: { type: String },
  ciudad: { type: String },
  pais: { type: String, default: 'Perú' },
  condicionesPago: {
    tipo: { type: String, enum: ['contado', 'credito'], default: 'contado' },
    diasCredito: { type: Number, default: 0 },
    descripcion: { type: String }
  },
  cuentasPorPagar: { type: Number, default: 0, min: 0 },
  limiteCredito: { type: Number, default: 0, min: 0 },
  categorias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' }],
  calificacion: { type: Number, min: 1, max: 5 },
  observaciones: { type: String },
  activo: { type: Boolean, default: true },
  fechaRegistro: { type: Date, default: Date.now }
}, { timestamps: true });

ProveedorSchema.index({ nombre: 'text', nombreComercial: 'text' });

module.exports = mongoose.model('Proveedor', ProveedorSchema);