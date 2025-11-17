// models/Producto.js
const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  descripcion: { type: String },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
  precio: { type: Number, required: true, min: 0 },
  precioMayoreo: { type: Number, min: 0 },
  cantidadMayoreo: { type: Number, default: 10 }, // A partir de cuántas unidades
  costo: { type: Number, min: 0 }, // Costo del producto
  stock: { type: Number, default: 0, min: 0 },
  stockMinimo: { type: Number, default: 5 },
  stockMaximo: { type: Number, default: 100 },
  almacen: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen', required: true },
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor' },
  imagenes: [{ type: String }], // Array de URLs de imágenes
  imagenPrincipal: { type: String }, // URL de imagen principal
  codigoBarras: { type: String, unique: true, sparse: true },
  unidadMedida: { 
    type: String, 
    enum: ['unidad', 'caja', 'paquete', 'kg', 'litro', 'metro', 'otro'],
    default: 'unidad'
  },
  tieneVariantes: { type: Boolean, default: false },
  manejaLotes: { type: Boolean, default: false },
  manejaSeries: { type: Boolean, default: false },
  ubicacion: {
    pasillo: { type: String },
    estante: { type: String },
    nivel: { type: String }
  },
  perecedero: { type: Boolean, default: false },
  diasVencimiento: { type: Number }, // Días típicos de vencimiento
  observaciones: { type: String },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

// Índices para búsquedas rápidas
ProductoSchema.index({ sku: 1 });
ProductoSchema.index({ categoria: 1, activo: 1 });
ProductoSchema.index({ nombre: 'text', descripcion: 'text' });

module.exports = mongoose.model('Producto', ProductoSchema);