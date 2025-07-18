const { body } = require('express-validator');
const mongoose = require('mongoose');

exports.validarVenta = [
  body('cliente')
    .isMongoId().withMessage('ID de cliente inválido')
    .custom(async (id) => {
      const exists = await mongoose.model('Cliente').exists({ _id: id, activo: true });
      if (!exists) throw new Error('El cliente no existe o está inactivo');
      return true;
    }),
  body('items')
    .isArray({ min: 1 }).withMessage('Debe tener al menos un item'),
  body('items.*.producto')
    .isMongoId().withMessage('ID de producto inválido')
    .custom(async (id, { req }) => {
      const producto = await mongoose.model('Producto').findOne({ _id: id, activo: true });
      if (!producto) throw new Error(`El producto ${id} no existe o está inactivo`);
      
      const item = req.body.items.find(i => i.producto === id);
      if (producto.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${producto.nombre}`);
      }
      return true;
    }),
  body('items.*.cantidad')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
  body('metodoPago')
    .isIn(['efectivo', 'tarjeta', 'transferencia']).withMessage('Método de pago inválido'),
  body('numeroComprobante')
    .optional()
    .isString().withMessage('El comprobante debe ser texto')
];