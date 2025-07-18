// models/Categoria.js
const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: { type: String },
  fechaCreacion: { type: Date, default: Date.now },
  activa: { type: Boolean, default: true }
});

module.exports = mongoose.model('Categoria', CategoriaSchema);