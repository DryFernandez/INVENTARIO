// models/Proveedor.js
const mongoose = require('mongoose');

const ProveedorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  contacto: { type: String, required: true }, // Teléfono/Email
  direccion: { type: String },
  ruc: { type: String, unique: true },
  activo: { type: Boolean, default: true },
  fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Proveedor', ProveedorSchema);