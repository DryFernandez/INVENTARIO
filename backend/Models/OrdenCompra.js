// models/OrdenCompra.js
const mongoose = require('mongoose');

const OrdenCompraSchema = new mongoose.Schema({
  numeroOrden: { type: String, required: true, unique: true },
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', required: true },
  almacen: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen', required: true },
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    cantidad: { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true },
    cantidadRecibida: { type: Number, default: 0, min: 0 },
    cantidadPendiente: { type: Number }
  }],
  subtotal: { type: Number, required: true, min: 0 },
  impuestos: { type: Number, default: 0, min: 0 },
  descuento: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  estado: {
    type: String,
    enum: ['borrador', 'enviada', 'parcial', 'completa', 'cancelada'],
    default: 'borrador'
  },
  fechaOrden: { type: Date, default: Date.now },
  fechaEntregaEstimada: { type: Date },
  fechaEntregaReal: { type: Date },
  condicionesPago: { type: String }, // Ej: "30 días", "Contado"
  diasCredito: { type: Number, default: 0 },
  observaciones: { type: String },
  recepciones: [{
    fecha: { type: Date, default: Date.now },
    productos: [{
      producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
      cantidadRecibida: { type: Number },
      cantidadRechazada: { type: Number, default: 0 },
      motivoRechazo: { type: String },
      lote: { type: mongoose.Schema.Types.ObjectId, ref: 'Lote' }
    }],
    recibidoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    observaciones: { type: String }
  }],
  compraGenerada: { type: mongoose.Schema.Types.ObjectId, ref: 'Compra' },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  modificadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true });

// Índices
OrdenCompraSchema.index({ numeroOrden: 1 });
OrdenCompraSchema.index({ proveedor: 1, estado: 1 });
OrdenCompraSchema.index({ fechaOrden: -1 });

module.exports = mongoose.model('OrdenCompra', OrdenCompraSchema);
