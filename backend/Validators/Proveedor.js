const { body } = require('express-validator');

exports.validarProveedor = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('Debe ser texto')
    .trim(),
  body('ruc')
    .optional()
    .isString().withMessage('Debe ser texto')
    .isLength({ min: 11, max: 11 }).withMessage('El RUC debe tener 11 dígitos')
    .matches(/^[0-9]+$/).withMessage('El RUC solo debe contener números'),
  body('contactoPrincipal.telefono')
    .optional()
    .isString().withMessage('Debe ser texto')
    .trim(),
  body('contactoPrincipal.email')
    .optional()
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('contactoPrincipal.nombre')
    .optional()
    .isString().withMessage('Debe ser texto')
    .trim(),
  body('contactoPrincipal.cargo')
    .optional()
    .isString().withMessage('Debe ser texto')
    .trim(),
  body('direccion')
    .optional()
    .isString().withMessage('La dirección debe ser texto'),
  body('ciudad')
    .optional()
    .isString().withMessage('La ciudad debe ser texto'),
  body('nombreComercial')
    .optional()
    .isString().withMessage('Debe ser texto')
    .trim()
];