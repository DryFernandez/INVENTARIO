// models/Producto.js
const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  descripcion: { type: String },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
  precio: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  stockMinimo: { type: Number, default: 5 }, // Alerta cuando el stock sea menor
  almacen: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen', required: true },
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor' },
  imagen: { type: String }, // Ej: "uploads/productos/sku123.jpg"
  fechaCaducidad: { type: Date }, // Opcional para perecederos
  activo: { type: Boolean, default: true } // Eliminación lógica
});

module.exports = mongoose.model('Producto', ProductoSchema);