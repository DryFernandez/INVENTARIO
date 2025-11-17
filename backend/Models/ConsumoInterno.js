// models/ConsumoInterno.js
const mongoose = require('mongoose');

const ConsumoInternoSchema = new mongoose.Schema({
  numeroConsumo: { type: String, required: true, unique: true },
  almacen: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen', required: true },
  departamento: { 
    type: String, 
    enum: ['produccion', 'mantenimiento', 'limpieza', 'administracion', 'ventas', 'otro'],
    required: true 
  },
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    cantidad: { type: Number, required: true, min: 1 },
    lote: { type: mongoose.Schema.Types.ObjectId, ref: 'Lote' },
    costo: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  motivo: {
    type: String,
    enum: ['uso_interno', 'muestras', 'promocion', 'merma', 'vencido', 'dañado', 'otro'],
    required: true
  },
  descripcion: { type: String, required: true },
  solicitadoPor: { type: String, required: true },
  estado: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado', 'entregado'],
    default: 'pendiente'
  },
  fechaSolicitud: { type: Date, default: Date.now },
  fechaAprobacion: { type: Date },
  fechaEntrega: { type: Date },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  aprobadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  entregadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true });

// Generar número de consumo automáticamente
ConsumoInternoSchema.pre('save', async function(next) {
  if (!this.numeroConsumo) {
    const count = await mongoose.model('ConsumoInterno').countDocuments();
    this.numeroConsumo = `CON-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('ConsumoInterno', ConsumoInternoSchema);
