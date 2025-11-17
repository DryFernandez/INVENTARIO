// models/Alerta.js
const mongoose = require('mongoose');

const AlertaSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: [
      'stock_minimo', 'stock_agotado', 'stock_maximo',
      'producto_vencido', 'producto_por_vencer',
      'reposicion_automatica', 'orden_compra_sugerida',
      'producto_rotacion_lenta', 'producto_sin_movimiento',
      'reserva_vencida', 'conteo_fisico_pendiente',
      'diferencia_inventario', 'costo_elevado'
    ],
    required: true
  },
  prioridad: {
    type: String,
    enum: ['critica', 'alta', 'media', 'baja'],
    default: 'media'
  },
  titulo: { type: String, required: true },
  mensaje: { type: String, required: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  almacen: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen' },
  lote: { type: mongoose.Schema.Types.ObjectId, ref: 'Lote' },
  referencia: { type: mongoose.Schema.Types.ObjectId }, // ID de documento relacionado
  referenciaModelo: { type: String }, // Modelo de la referencia
  datos: { type: mongoose.Schema.Types.Mixed }, // Datos adicionales en JSON
  estado: {
    type: String,
    enum: ['activa', 'leida', 'resuelta', 'ignorada'],
    default: 'activa'
  },
  fechaCreacion: { type: Date, default: Date.now },
  fechaResolucion: { type: Date },
  resueltoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  accionTomada: { type: String },
  notificadoA: [{
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    fechaNotificacion: { type: Date, default: Date.now },
    leido: { type: Boolean, default: false },
    fechaLectura: { type: Date }
  }],
  automatica: { type: Boolean, default: true }, // Si fue generada automáticamente
  recurrente: { type: Boolean, default: false } // Si se repite periódicamente
}, { timestamps: true });

// Índices
AlertaSchema.index({ tipo: 1, estado: 1 });
AlertaSchema.index({ prioridad: 1, estado: 1 });
AlertaSchema.index({ producto: 1, almacen: 1 });
AlertaSchema.index({ fechaCreacion: -1 });
AlertaSchema.index({ 'notificadoA.usuario': 1, 'notificadoA.leido': 1 });

module.exports = mongoose.model('Alerta', AlertaSchema);
