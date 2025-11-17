// models/DevolucionCliente.js
const mongoose = require('mongoose');

const DevolucionClienteSchema = new mongoose.Schema({
  numeroDevolucion: { type: String, required: true, unique: true },
  venta: { type: mongoose.Schema.Types.ObjectId, ref: 'Venta', required: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  almacen: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen', required: true },
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    cantidad: { type: Number, required: true, min: 1 },
    precio: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    motivo: { 
      type: String, 
      enum: ['defectuoso', 'equivocado', 'no_satisface', 'garantia', 'otro'],
      required: true 
    },
    descripcionMotivo: { type: String }
  }],
  total: { type: Number, required: true },
  estado: {
    type: String,
    enum: ['pendiente', 'aprobada', 'rechazada', 'procesada'],
    default: 'pendiente'
  },
  tipoDevolucion: {
    type: String,
    enum: ['reembolso', 'cambio', 'nota_credito'],
    required: true
  },
  fechaDevolucion: { type: Date, default: Date.now },
  fechaAprobacion: { type: Date },
  fechaProcesado: { type: Date },
  observaciones: { type: String },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  aprobadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  procesadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true });

// Generar número de devolución automáticamente
DevolucionClienteSchema.pre('save', async function(next) {
  if (!this.numeroDevolucion) {
    const count = await mongoose.model('DevolucionCliente').countDocuments();
    this.numeroDevolucion = `DEV-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DevolucionCliente', DevolucionClienteSchema);
