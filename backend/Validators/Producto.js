const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Middleware para manejar errores de validación
exports.manejarErroresValidacion = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: errors.array().map(err => err.msg)
    });
  }
  next();
};

exports.validarProducto = [
  body('sku')
    .optional()
    .isString().withMessage('El SKU debe ser texto')
    .custom(async (sku, { req }) => {
      if (!sku) return true; // Si no hay SKU, se generará automáticamente
      const producto = await mongoose.model('Producto').findOne({ sku });
      if (producto && producto._id.toString() !== req.params?.id) {
        throw new Error('El SKU ya está en uso');
      }
      return true;
    }),
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('Debe ser texto'),
  body('precio')
    .isFloat({ gt: 0 }).withMessage('El precio debe ser mayor a 0'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock no puede ser negativo'),
  body('stockMinimo')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock mínimo no puede ser negativo'),
  body('categoria')
    .isMongoId().withMessage('ID de categoría inválido')
    .custom(async (id) => {
      const exists = await mongoose.model('Categoria').exists({ _id: id, activa: true });
      if (!exists) throw new Error('La categoría no existe o está inactiva');
      return true;
    }),
  body('almacen')
    .optional()
    .isMongoId().withMessage('ID de almacén inválido')
    .custom(async (id) => {
      if (!id) return true;
      const exists = await mongoose.model('Almacen').exists({ _id: id, activo: true });
      if (!exists) throw new Error('El almacén no existe o está inactivo');
      return true;
    }),
  body('proveedor')
    .optional()
    .isMongoId().withMessage('ID de proveedor inválido')
    .custom(async (id) => {
      if (!id) return true;
      const exists = await mongoose.model('Proveedor').exists({ _id: id, activo: true });
      if (!exists) throw new Error('El proveedor no existe o está inactivo');
      return true;
    })
];