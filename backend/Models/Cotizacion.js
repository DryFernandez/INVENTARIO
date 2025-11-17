// models/Cotizacion.js
const mongoose = require('mongoose');

const CotizacionSchema = new mongoose.Schema({
  numeroCotizacion: { type: String, required: true, unique: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    variante: { type: mongoose.Schema.Types.ObjectId, ref: 'VarianteProducto' },
    cantidad: { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true, min: 0 },
    descuento: { type: Number, default: 0, min: 0, max: 100 }, // Porcentaje
    subtotal: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true, min: 0 },
  impuestos: { type: Number, default: 0, min: 0 },
  descuentoGlobal: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  estado: {
    type: String,
    enum: ['borrador', 'enviada', 'aprobada', 'rechazada', 'vencida', 'convertida'],
    default: 'borrador'
  },
  fechaCotizacion: { type: Date, default: Date.now },
  fechaVencimiento: { type: Date, required: true },
  validezDias: { type: Number, default: 15 },
  condicionesPago: { type: String },
  tiempoEntrega: { type: String }, // Ej: "3-5 días hábiles"
  observaciones: { type: String },
  notasInternas: { type: String },
  ventaGenerada: { type: mongoose.Schema.Types.ObjectId, ref: 'Venta' },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  aprobadaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  fechaAprobacion: { type: Date }
}, { timestamps: true });

// Índices
CotizacionSchema.index({ numeroCotizacion: 1 });
CotizacionSchema.index({ cliente: 1, estado: 1 });
CotizacionSchema.index({ fechaCotizacion: -1 });
CotizacionSchema.index({ fechaVencimiento: 1 });

module.exports = mongoose.model('Cotizacion', CotizacionSchema);
