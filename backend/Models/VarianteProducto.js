// models/VarianteProducto.js
const mongoose = require('mongoose');

const VarianteProductoSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  sku: { type: String, required: true, unique: true },
  nombre: { type: String, required: true }, // Ej: "Camiseta Roja M"
  atributos: [{
    tipo: { type: String, required: true }, // Ej: "color", "talla"
    valor: { type: String, required: true } // Ej: "rojo", "M"
  }],
  precio: { type: Number, required: true, min: 0 },
  precioMayoreo: { type: Number, min: 0 },
  cantidadMayoreo: { type: Number, default: 10 }, // A partir de cuántas unidades aplica mayoreo
  stock: { type: Number, default: 0, min: 0 },
  stockMinimo: { type: Number, default: 5 },
  stockMaximo: { type: Number, default: 100 },
  imagen: { type: String },
  codigoBarras: { type: String },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

// Índices
VarianteProductoSchema.index({ producto: 1, activo: 1 });
VarianteProductoSchema.index({ sku: 1 });

module.exports = mongoose.model('VarianteProducto', VarianteProductoSchema);
