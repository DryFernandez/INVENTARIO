const { body } = require('express-validator');

exports.validarCliente = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('Debe ser texto')
    .trim(),
  body('ruc')
    .optional()
    .isString().withMessage('El RUC debe ser texto')
    .isLength({ min: 11, max: 11 }).withMessage('El RUC debe tener 11 dígitos')
    .matches(/^[0-9]+$/).withMessage('El RUC solo debe contener números'),
  body('contacto')
    .notEmpty().withMessage('El contacto es requerido')
    .isString().withMessage('Debe ser texto'),
  body('direccion')
    .optional()
    .isString().withMessage('La dirección debe ser texto')
];