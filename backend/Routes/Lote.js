// Routes/Lote.js
const express = require('express');
const router = express.Router();
const Lote = require('../Models/Lote');
const ProductoAlmacen = require('../Models/ProductoAlmacen');
const { checkAuth: auth } = require('../Middlewares/auth');

// Obtener todos los lotes
router.get('/', auth, async (req, res) => {
  try {
    const { almacen, producto, estado } = req.query;
    const filtros = {};
    
    if (almacen) filtros.almacen = almacen;
    if (producto) filtros.producto = producto;
    if (estado) filtros.estado = estado;

    const lotes = await Lote.find(filtros)
      .populate('producto', 'sku nombre')
      .populate('almacen', 'nombre')
      .populate('proveedor', 'nombre')
      .sort({ fechaVencimiento: 1 });
    
    res.json(lotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener lotes próximos a vencer (30 días)
router.get('/proximos-vencer', auth, async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 30;
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const lotes = await Lote.find({
      fechaVencimiento: { $lte: fechaLimite, $gte: new Date() },
      estado: 'activo',
      cantidadDisponible: { $gt: 0 }
    })
      .populate('producto', 'sku nombre')
      .populate('almacen', 'nombre')
      .sort({ fechaVencimiento: 1 });
    
    res.json(lotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo lote
router.post('/', auth, async (req, res) => {
  try {
    const lote = new Lote({
      ...req.body,
      cantidadDisponible: req.body.cantidad,
      creadoPor: req.usuario.id
    });
    await lote.save();
    
    res.status(201).json(lote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar lote
router.put('/:id', auth, async (req, res) => {
  try {
    const lote = await Lote.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!lote) return res.status(404).json({ error: 'Lote no encontrado' });
    res.json(lote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar lote (solo si no tiene movimientos)
router.delete('/:id', auth, async (req, res) => {
  try {
    const lote = await Lote.findById(req.params.id);
    if (!lote) return res.status(404).json({ error: 'Lote no encontrado' });
    
    if (lote.cantidadDisponible < lote.cantidad) {
      return res.status(400).json({ error: 'No se puede eliminar un lote con movimientos' });
    }
    
    await lote.deleteOne();
    res.json({ mensaje: 'Lote eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
