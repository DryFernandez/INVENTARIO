// models/Traslado.js
const mongoose = require('mongoose');

const TrasladoSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true, min: 1 },
  desdeAlmacen: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen', required: true },
  haciaAlmacen: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen', required: true },
  fecha: { type: Date, default: Date.now },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  estado: { type: String, enum: ['pendiente', 'completado', 'cancelado'], default: 'pendiente' }
});

module.exports = mongoose.model('Traslado', TrasladoSchema);