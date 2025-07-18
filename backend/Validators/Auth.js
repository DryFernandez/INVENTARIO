const { body } = require('express-validator');
const Usuario = require('../models/Usuario');

exports.validarRegistro = [
  body('email')
    .isEmail().withMessage('Debe ser un email válido')
    .custom(async (email) => {
      const usuario = await Usuario.findOne({ email });
      if (usuario) throw new Error('El email ya está registrado');
      return true;
    }),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),
  body('rol')
    .optional()
    .isIn(['admin', 'empleado']).withMessage('Rol inválido')
];