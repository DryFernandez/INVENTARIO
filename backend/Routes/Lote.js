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
    
    console.log(`✅ ${lotes.length} lotes encontrados`);
    res.json(lotes);
  } catch (error) {
    console.error('❌ Error obteniendo lotes:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error al obtener los lotes'
    });
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
      .populate('proveedor', 'nombre')
      .sort({ fechaVencimiento: 1 });
    
    console.log(`✅ ${lotes.length} lotes próximos a vencer en ${dias} días`);
    res.json(lotes);
  } catch (error) {
    console.error('❌ Error obteniendo lotes próximos a vencer:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error al obtener lotes próximos a vencer'
    });
  }
});

// Función para generar número de lote automático
const generarNumeroLote = async () => {
  const fecha = new Date();
  const prefijo = `LT${fecha.getFullYear().toString().slice(-2)}${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  
  // Contar lotes del mes actual
  const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
  
  const count = await Lote.countDocuments({
    fechaCreacion: { $gte: inicioMes, $lte: finMes }
  });
  
  const numero = String(count + 1).padStart(3, '0');
  return `${prefijo}-${numero}`;
};

// Crear nuevo lote
router.post('/', auth, async (req, res) => {
  try {
    let { numeroLote } = req.body;
    
    // Generar número de lote automáticamente si no se proporciona
    if (!numeroLote || numeroLote === '') {
      numeroLote = await generarNumeroLote();
    }
    
    // Verificar que el número de lote no exista
    const existeLote = await Lote.findOne({ numeroLote });
    if (existeLote) {
      return res.status(400).json({ error: 'El número de lote ya existe' });
    }
    
    const lote = new Lote({
      ...req.body,
      numeroLote,
      cantidadDisponible: req.body.cantidad,
      creadoPor: req.usuario.id
    });
    
    await lote.save();
    
    // Poblar referencias para la respuesta
    await lote.populate([
      { path: 'producto', select: 'sku nombre' },
      { path: 'almacen', select: 'nombre' },
      { path: 'proveedor', select: 'nombre' }
    ]);
    
    res.status(201).json({
      success: true,
      data: lote,
      message: 'Lote creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando lote:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Error de validación',
        details: errors
      });
    }
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error al crear el lote'
    });
  }
});

// Actualizar lote
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { numeroLote } = req.body;
    
    // Verificar que el número de lote no exista en otro lote
    if (numeroLote) {
      const existeLote = await Lote.findOne({ numeroLote, _id: { $ne: id } });
      if (existeLote) {
        return res.status(400).json({
          success: false,
          error: 'El número de lote ya está en uso'
        });
      }
    }
    
    const lote = await Lote.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'producto', select: 'sku nombre' },
      { path: 'almacen', select: 'nombre' },
      { path: 'proveedor', select: 'nombre' }
    ]);
    
    if (!lote) {
      return res.status(404).json({
        success: false,
        error: 'Lote no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: lote,
      message: 'Lote actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando lote:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Error de validación',
        details: errors
      });
    }
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error al actualizar el lote'
    });
  }
});

// Eliminar lote (solo si no tiene movimientos)
router.delete('/:id', auth, async (req, res) => {
  try {
    const lote = await Lote.findById(req.params.id);
    if (!lote) {
      return res.status(404).json({
        success: false,
        error: 'Lote no encontrado'
      });
    }
    
    if (lote.cantidadDisponible < lote.cantidad) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un lote con movimientos. El lote tiene stock utilizado.'
      });
    }
    
    await lote.deleteOne();
    console.log(`✅ Lote ${lote.numeroLote} eliminado correctamente`);
    
    res.json({
      success: true,
      message: 'Lote eliminado correctamente'
    });
  } catch (error) {
    console.error('❌ Error eliminando lote:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error al eliminar el lote'
    });
  }
});

module.exports = router;
