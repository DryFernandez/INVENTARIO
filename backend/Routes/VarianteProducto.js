// Routes/VarianteProducto.js
const express = require('express');
const router = express.Router();
const VarianteProducto = require('../Models/VarianteProducto');
const { checkAuth: auth } = require('../Middlewares/auth');

// Obtener todas las variantes
router.get('/', auth, async (req, res) => {
  try {
    const { producto } = req.query;
    const filtros = {};
    
    if (producto) filtros.producto = producto;

    const variantes = await VarianteProducto.find(filtros)
      .populate('producto', 'nombre sku')
      .sort({ nombre: 1 });
    
    res.json(variantes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener variantes de un producto
router.get('/producto/:productoId', auth, async (req, res) => {
  try {
    const variantes = await VarianteProducto.find({ 
      producto: req.params.productoId,
      activo: true 
    });
    
    res.json(variantes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear variante
router.post('/', auth, async (req, res) => {
  try {
    const variante = new VarianteProducto(req.body);
    await variante.save();
    res.status(201).json(variante);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar variante
router.put('/:id', auth, async (req, res) => {
  try {
    const variante = await VarianteProducto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!variante) return res.status(404).json({ error: 'Variante no encontrada' });
    res.json(variante);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar variante
router.delete('/:id', auth, async (req, res) => {
  try {
    const variante = await VarianteProducto.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    
    if (!variante) return res.status(404).json({ error: 'Variante no encontrada' });
    res.json({ mensaje: 'Variante desactivada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
