const { body } = require('express-validator');
const mongoose = require('mongoose');

exports.validarTraslado = [
  body('producto')
    .isMongoId().withMessage('ID de producto inválido')
    .custom(async (id) => {
      const exists = await mongoose.model('Producto').exists({ _id: id, activo: true });
      if (!exists) throw new Error('El producto no existe o está inactivo');
      return true;
    }),
  body('cantidad')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
  body('desdeAlmacen')
    .isMongoId().withMessage('ID de almacén origen inválido')
    .custom(async (id, { req }) => {
      const producto = await mongoose.model('Producto').findOne({
        _id: req.body.producto,
        almacen: id,
        activo: true
      });
      if (!producto) throw new Error('El producto no está en el almacén origen');
      if (producto.stock < req.body.cantidad) {
        throw new Error('Stock insuficiente en almacén origen');
      }
      return true;
    }),
  body('haciaAlmacen')
    .isMongoId().withMessage('ID de almacén destino inválido')
    .custom((id, { req }) => {
      if (id === req.body.desdeAlmacen) {
        throw new Error('El almacén destino no puede ser el mismo que el origen');
      }
      return true;
    })
];