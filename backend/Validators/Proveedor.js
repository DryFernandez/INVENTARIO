const { body, validationResult } = require('express-validator');

exports.validarProveedor = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('Debe ser texto')
    .trim(),
  body('contacto')
    .optional()
    .isString().withMessage('El contacto debe ser texto')
    .trim(),
  body('ruc')
    .optional()
    .isString().withMessage('Debe ser texto')
    .trim(),
  body('direccion')
    .optional()
    .isString().withMessage('La dirección debe ser texto')
    .trim(),
  body('activo')
    .optional()
    .isBoolean().withMessage('Activo debe ser verdadero o falso'),
  
  // Middleware para manejar errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Error de validación',
        details: errors.array().map(err => err.msg)
      });
    }
    next();
  }
];