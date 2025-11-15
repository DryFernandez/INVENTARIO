// models/ProductoAlmacen.js
const mongoose = require('mongoose');

const ProductoAlmacenSchema = new mongoose.Schema({
  producto: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Producto', 
    required: true 
  },
  almacen: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Almacen', 
    required: true 
  },
  stock: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  stockMinimo: { 
    type: Number, 
    default: 5 
  },
  stockMaximo: { 
    type: Number 
  },
  ubicacionFisica: { 
    type: String // Ej: "Pasillo 3, Estante A, Nivel 2"
  },
  lote: { 
    type: String 
  },
  fechaIngreso: { 
    type: Date, 
    default: Date.now 
  },
  fechaUltimaActualizacion: { 
    type: Date, 
    default: Date.now 
  },
  activo: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

// Índice compuesto único para evitar duplicados de producto-almacén
ProductoAlmacenSchema.index({ producto: 1, almacen: 1 }, { unique: true });

// Método virtual para verificar si está bajo en stock
ProductoAlmacenSchema.virtual('stockBajo').get(function() {
  return this.stock <= this.stockMinimo;
});

// Método virtual para calcular el porcentaje de ocupación
ProductoAlmacenSchema.virtual('porcentajeOcupacion').get(function() {
  if (!this.stockMaximo) return null;
  return ((this.stock / this.stockMaximo) * 100).toFixed(2);
});

ProductoAlmacenSchema.set('toJSON', { virtuals: true });
ProductoAlmacenSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ProductoAlmacen', ProductoAlmacenSchema);
