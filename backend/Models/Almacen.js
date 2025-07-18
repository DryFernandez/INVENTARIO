// models/Almacen.js
const mongoose = require('mongoose');

const AlmacenSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  ubicacion: { type: String, required: true },
  capacidadMaxima: { type: Number }, // En unidades o metros cuadrados
  responsable: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  activo: { type: Boolean, default: true }
});

module.exports = mongoose.model('Almacen', AlmacenSchema);