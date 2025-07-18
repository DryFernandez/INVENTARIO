const { body, query } = require('express-validator');
const mongoose = require('mongoose');

// Validación para crear/actualizar movimientos de inventario
exports.validarInventarioLog = [
  body('producto')
    .isMongoId().withMessage('ID de producto inválido')
    .custom(async (id) => {
      const exists = await mongoose.model('Producto').exists({ _id: id });
      if (!exists) throw new Error('El producto no existe');
      return true;
    }),
  body('cantidad')
    .isInt().withMessage('La cantidad debe ser un número entero')
    .not().equals(0).withMessage('La cantidad no puede ser cero'),
  body('tipo')
    .isIn(['compra', 'venta', 'ajuste', 'traslado', 'inicial']).withMessage('Tipo de movimiento inválido'),
  body('referencia')
    .optional()
    .isMongoId().withMessage('ID de referencia inválido'),
  body('detalle')
    .optional()
    .isString().withMessage('El detalle debe ser texto')
    .trim()
];

// Validación para filtrar movimientos de inventario
exports.validarFiltrosLog = [
  query('producto')
    .optional()
    .isMongoId().withMessage('ID de producto inválido'),
  query('tipo')
    .optional()
    .isIn(['compra', 'venta', 'ajuste', 'traslado', 'inicial']).withMessage('Tipo de movimiento inválido'),
  query('fechaDesde')
    .optional()
    .isISO8601().withMessage('Fecha desde debe ser una fecha válida (YYYY-MM-DD)'),
  query('fechaHasta')
    .optional()
    .isISO8601().withMessage('Fecha hasta debe ser una fecha válida (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (req.query.fechaDesde && new Date(value) < new Date(req.query.fechaDesde)) {
        throw new Error('Fecha hasta debe ser mayor o igual a fecha desde');
      }
      return true;
    }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un número mayor a 0')
];