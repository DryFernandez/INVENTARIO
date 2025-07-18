const { body } = require('express-validator');
const Categoria = require('../Models/Categorias');

exports.validarCategoria = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isString().withMessage('Debe ser texto')
    .trim()
    .custom(async (nombre, { req }) => {
      const categoria = await Categoria.findOne({ nombre });
      if (categoria && categoria._id.toString() !== req.params?.id) {
        throw new Error('El nombre de categoría ya existe');
      }
      return true;
    }),
  body('descripcion')
    .optional()
    .isString().withMessage('La descripción debe ser texto')
    .trim()
];