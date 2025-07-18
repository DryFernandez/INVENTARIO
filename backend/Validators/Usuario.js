const { body } = require('express-validator');
const Usuario = require('../Models/Usuario');

module.exports = {
  validarUsuario: [
    body('email')
      .isEmail().withMessage('Debe ser un email válido')
      .custom(async email => {
        const usuario = await Usuario.findOne({ email });
        if (usuario) throw new Error('Email ya registrado');
      }),
    
    body('password')
      .isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
      
    body('nombre')
      .notEmpty().withMessage('Nombre es requerido')
      .isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),
      
    body('rol')
      .optional()
      .isIn(['admin', 'empleado']).withMessage('Rol inválido')
  ]
};