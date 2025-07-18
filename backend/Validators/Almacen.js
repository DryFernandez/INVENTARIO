const { body } = require('express-validator');
const mongoose = require('mongoose');

exports.validarAlmacen = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('Debe ser texto')
    .trim()
    .custom(async (nombre, { req }) => {
      const almacen = await mongoose.model('Almacen').findOne({ nombre });
      if (almacen && almacen._id.toString() !== req.params?.id) {
        throw new Error('El nombre de almacén ya existe');
      }
      return true;
    }),
  body('ubicacion')
    .notEmpty().withMessage('La ubicación es requerida')
    .isString().withMessage('Debe ser texto'),
  body('responsable')
    .isMongoId().withMessage('ID de responsable inválido')
    .custom(async (id) => {
      const exists = await mongoose.model('Usuario').exists({ _id: id, activo: true });
      if (!exists) throw new Error('El responsable no existe o está inactivo');
      return true;
    })
];