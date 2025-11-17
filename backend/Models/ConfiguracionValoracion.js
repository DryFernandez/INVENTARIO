// models/ConfiguracionValoracion.js
const mongoose = require('mongoose');

const ConfiguracionValoracionSchema = new mongoose.Schema({
  metodo: {
    type: String,
    enum: ['FIFO', 'LIFO', 'PROMEDIO_PONDERADO', 'PRECIO_ESPECIFICO'],
    default: 'PROMEDIO_PONDERADO',
    required: true
  },
  aplicarPor: {
    type: String,
    enum: ['global', 'categoria', 'producto'],
    default: 'global'
  },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' }, // Si es por categoría
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' }, // Si es por producto
  redondeo: {
    decimales: { type: Number, default: 2, min: 0, max: 4 },
    metodo: { type: String, enum: ['normal', 'arriba', 'abajo'], default: 'normal' }
  },
  ajusteAutomatico: { type: Boolean, default: true }, // Actualizar costos automáticamente
  descripcion: { type: String },
  activo: { type: Boolean, default: true },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  modificadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true });

// Índices
ConfiguracionValoracionSchema.index({ aplicarPor: 1, activo: 1 });
ConfiguracionValoracionSchema.index({ categoria: 1 });
ConfiguracionValoracionSchema.index({ producto: 1 });

module.exports = mongoose.model('ConfiguracionValoracion', ConfiguracionValoracionSchema);
