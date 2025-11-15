// models/Cliente.js
const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  ruc: { type: String }, // Para facturación
  direccion: { type: String },
  email: { type: String },
  telefono: { type: String },
  fechaRegistro: { type: Date, default: Date.now },
  activo: { type: Boolean, default: true }
});

module.exports = mongoose.model('Cliente', ClienteSchema);