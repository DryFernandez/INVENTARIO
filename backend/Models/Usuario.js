// models/Usuario.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, match: /^\S+@\S+\.\S+$/ },
  password: { type: String, required: true },
  rol: { 
    type: String, 
    enum: ['admin', 'gestor_ventas', 'gestor_compras', 'admin_inventario', 'empleado', 'auditor'], 
    default: 'empleado' 
  },
  nombre: { type: String, required: true },
  apellido: { type: String },
  telefono: { type: String },
  cargo: { type: String },
  almacenAsignado: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen' },
  permisos: { type: mongoose.Schema.Types.ObjectId, ref: 'Permiso' },
  ultimoAcceso: { type: Date },
  intentosFallidos: { type: Number, default: 0 },
  bloqueado: { type: Boolean, default: false },
  fechaBloqueo: { type: Date },
  fechaCreacion: { type: Date, default: Date.now },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

// Hash de contraseña antes de guardar
UsuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);