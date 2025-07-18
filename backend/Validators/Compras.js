const { body } = require('express-validator');
const mongoose = require('mongoose');

exports.validarCompra = [
  body('proveedor')
    .isMongoId().withMessage('ID de proveedor inválido')
    .custom(async (id) => {
      const exists = await mongoose.model('Proveedor').exists({ _id: id, activo: true });
      if (!exists) throw new Error('El proveedor no existe o está inactivo');
      return true;
    }),
  body('items')
    .isArray({ min: 1 }).withMessage('Debe tener al menos un item'),
  body('items.*.producto')
    .isMongoId().withMessage('ID de producto inválido')
    .custom(async (id) => {
      const exists = await mongoose.model('Producto').exists({ _id: id, activo: true });
      if (!exists) throw new Error(`El producto ${id} no existe o está inactivo`);
      return true;
    }),
  body('items.*.cantidad')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
  body('items.*.precioUnitario')
    .isFloat({ gt: 0 }).withMessage('El precio unitario debe ser mayor a 0'),
  body('numeroFactura')
    .optional()
    .isString().withMessage('El número de factura debe ser texto')
    .trim(),
  body('estado')
    .optional()
    .isIn(['pendiente', 'completada', 'cancelada']).withMessage('Estado inválido')
];