const express = require('express');
const router = express.Router();
const InventarioLog = require('../Models/InventarioLog');
const Producto = require('../Models/Producto');
const { validarInventarioLog, validarFiltrosLog } = require('../Validators/InventarioLog');

// Tipos de movimiento permitidos
const TIPOS_MOVIMIENTO = [
  'compra',
  'venta',
  'ajuste',
  'transferencia_entrada',
  'transferencia_salida',
  'devolucion',
  'inventario_inicial'
];

// GET / - Obtener movimientos con filtros avanzados
router.get('/', validarFiltrosLog, async (req, res) => {
  try {
    const { 
      limit = 20,
      page = 1,
      producto,
      tipo,
      usuario,
      fechaDesde,
      fechaHasta,
      sort = '-fecha'
    } = req.query;

    // Construir query de filtrado
    const query = {};

    if (producto) query.producto = producto;
    if (tipo) query.tipo = { $in: tipo.split(',') };
    if (usuario) query.usuario = usuario;

    // Filtro por rango de fechas
    if (fechaDesde || fechaHasta) {
      query.fecha = {};
      if (fechaDesde) query.fecha.$gte = new Date(fechaDesde);
      if (fechaHasta) query.fecha.$lte = new Date(fechaHasta);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'producto', select: 'codigo nombre' },
        { path: 'usuario', select: 'nombre email rol' }
      ]
    };

    const movimientos = await InventarioLog.paginate(query, options);

    res.status(200).json({
      success: true,
      data: movimientos.docs,
      pagination: {
        total: movimientos.totalDocs,
        limit: movimientos.limit,
        page: movimientos.page,
        pages: movimientos.totalPages
      },
      filters: {
        tiposDisponibles: TIPOS_MOVIMIENTO
      }
    });

  } catch (error) {
    console.error('Error en GET /inventario-log:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los movimientos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /producto/:id - Obtener movimientos por producto
router.get('/producto/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, fechaDesde, fechaHasta } = req.query;

    // Verificar si el producto existe
    const productoExists = await Producto.exists({ _id: id });
    if (!productoExists) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Construir query
    const query = { producto: id };

    // Filtro por fecha si se especifica
    if (fechaDesde || fechaHasta) {
      query.fecha = {};
      if (fechaDesde) query.fecha.$gte = new Date(fechaDesde);
      if (fechaHasta) query.fecha.$lte = new Date(fechaHasta);
    }

    const movimientos = await InventarioLog.find(query)
      .sort('-fecha')
      .limit(parseInt(limit))
      .populate('usuario', 'nombre rol')
      .lean();

    // Calcular stock actual (suma de cantidades)
    const stockResult = await InventarioLog.aggregate([
      { $match: { producto: id } },
      { $group: { _id: null, stockActual: { $sum: '$cantidad' } } }
    ]);

    const stockActual = stockResult.length > 0 ? stockResult[0].stockActual : 0;

    res.status(200).json({
      success: true,
      data: {
        producto: id,
        stockActual,
        movimientos
      }
    });

  } catch (error) {
    console.error(`Error en GET /inventario-log/producto/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de producto inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener los movimientos del producto'
    });
  }
});

// POST /ajuste - Registrar ajuste manual de inventario
router.post('/ajuste', validarInventarioLog, async (req, res) => {
  const session = await InventarioLog.startSession();
  session.startTransaction();

  try {
    const { producto, cantidad, motivo, notas, usuario } = req.body;

    // 1. Verificar que el producto existe
    const productoObj = await Producto.findById(producto).session(session);
    if (!productoObj) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // 2. Crear registro en el log
    const movimiento = new InventarioLog({
      producto,
      cantidad,
      tipo: 'ajuste',
      motivo,
      notas,
      usuario,
      stockAnterior: productoObj.stock,
      stockNuevo: productoObj.stock + cantidad
    });

    await movimiento.save({ session });

    // 3. Actualizar stock del producto
    productoObj.stock += cantidad;
    await productoObj.save({ session });

    await session.commitTransaction();
    session.endSession();

    // 4. Responder con el movimiento creado
    const movimientoCreado = await InventarioLog.findById(movimiento._id)
      .populate('producto', 'codigo nombre stock')
      .populate('usuario', 'nombre rol');

    res.status(201).json({
      success: true,
      data: movimientoCreado,
      message: 'Ajuste de inventario registrado correctamente'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error en POST /inventario-log/ajuste:', error);
    
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
      error: 'Error al registrar el ajuste de inventario',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;