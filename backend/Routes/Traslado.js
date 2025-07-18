const express = require('express');
const router = express.Router();
const Traslado = require('../Models/Traslado');
const Producto = require('../Models/Producto');
const InventarioLog = require('../Models/InventarioLog');
const { validarTraslado } = require('../Validators/Traslado');

// Estados de traslado
const ESTADOS_TRASLADO = {
  PENDIENTE: 'pendiente',
  EN_PROCESO: 'en_proceso',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado'
};

// GET / - Obtener todos los traslados con filtros
router.get('/', async (req, res) => {
  try {
    const { 
      limit = 20, 
      page = 1, 
      estado,
      almacenOrigen,
      almacenDestino,
      fechaDesde,
      fechaHasta,
      sort = '-fechaCreacion'
    } = req.query;

    // Construir query de filtrado
    const query = {};

    if (estado) query.estado = estado;
    if (almacenOrigen) query.almacenOrigen = almacenOrigen;
    if (almacenDestino) query.almacenDestino = almacenDestino;

    // Filtro por rango de fechas
    if (fechaDesde || fechaHasta) {
      query.fechaCreacion = {};
      if (fechaDesde) query.fechaCreacion.$gte = new Date(fechaDesde);
      if (fechaHasta) query.fechaCreacion.$lte = new Date(fechaHasta);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'almacenOrigen', select: 'nombre ubicacion' },
        { path: 'almacenDestino', select: 'nombre ubicacion' },
        { path: 'usuario', select: 'nombre email' },
        { path: 'productos.producto', select: 'nombre codigo' }
      ]
    };

    const traslados = await Traslado.paginate(query, options);

    res.status(200).json({
      success: true,
      data: traslados.docs,
      pagination: {
        total: traslados.totalDocs,
        limit: traslados.limit,
        page: traslados.page,
        pages: traslados.totalPages
      },
      estadosDisponibles: ESTADOS_TRASLADO
    });

  } catch (error) {
    console.error('Error en GET /traslados:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los traslados',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST / - Crear nuevo traslado
router.post('/', validarTraslado, async (req, res) => {
  const session = await Traslado.startSession();
  session.startTransaction();

  try {
    const { almacenOrigen, almacenDestino, productos, usuario } = req.body;

    // 1. Verificar que los almacenes sean diferentes
    if (almacenOrigen.toString() === almacenDestino.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: 'El almacén de origen y destino no pueden ser el mismo'
      });
    }

    // 2. Verificar stock en almacén origen para cada producto
    const productosVerificados = [];
    for (const item of productos) {
      const producto = await Producto.findOne({
        _id: item.producto,
        almacen: almacenOrigen,
        stock: { $gte: item.cantidad }
      }).session(session);

      if (!producto) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          error: `Stock insuficiente o producto no encontrado en almacén origen (ID: ${item.producto})`,
          producto: item.producto,
          almacenOrigen
        });
      }
      productosVerificados.push(item);
    }

    // 3. Crear el traslado
    const nuevoTraslado = new Traslado({
      almacenOrigen,
      almacenDestino,
      productos: productosVerificados,
      usuario,
      estado: ESTADOS_TRASLADO.PENDIENTE
    });

    await nuevoTraslado.save({ session });

    // 4. Registrar movimientos de salida en el log (se completarán al confirmar el traslado)
    for (const item of productosVerificados) {
      await InventarioLog.create([{
        producto: item.producto,
        cantidad: -item.cantidad, // Salida negativa
        tipo: 'transferencia_salida',
        referencia: nuevoTraslado._id,
        almacen: almacenOrigen,
        usuario,
        estado: 'pendiente'
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    // 5. Responder con el traslado creado
    const trasladoCreado = await Traslado.findById(nuevoTraslado._id)
      .populate('almacenOrigen', 'nombre')
      .populate('almacenDestino', 'nombre')
      .populate('productos.producto', 'nombre codigo');

    res.status(201).json({
      success: true,
      data: trasladoCreado,
      message: 'Traslado creado exitosamente. Pendiente de completar.'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error en POST /traslados:', error);
    
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
      error: 'Error al crear el traslado',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /:id/completar - Completar un traslado
router.put('/:id/completar', async (req, res) => {
  const session = await Traslado.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { usuario } = req.body;

    // 1. Obtener y validar el traslado
    const traslado = await Traslado.findById(id).session(session);
    
    if (!traslado) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        error: 'Traslado no encontrado'
      });
    }

    if (traslado.estado !== ESTADOS_TRASLADO.PENDIENTE) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: `El traslado no puede ser completado en estado ${traslado.estado}`,
        estadoActual: traslado.estado,
        estadoRequerido: ESTADOS_TRASLADO.PENDIENTE
      });
    }

    // 2. Actualizar estado del traslado
    traslado.estado = ESTADOS_TRASLADO.COMPLETADO;
    traslado.fechaCompletado = new Date();
    await traslado.save({ session });

    // 3. Procesar cada producto del traslado
    for (const item of traslado.productos) {
      // 3.1. Restar stock del almacén origen
      await Producto.findByIdAndUpdate(
        item.producto,
        { $inc: { stock: -item.cantidad } },
        { session }
      );

      // 3.2. Sumar stock al almacén destino
      await Producto.findOneAndUpdate(
        { _id: item.producto, almacen: traslado.almacenDestino },
        { $inc: { stock: item.cantidad } },
        { upsert: true, session } // Crear registro si no existe
      );

      // 3.3. Actualizar logs de inventario
      // Marcar salida como completada
      await InventarioLog.updateMany(
        {
          referencia: traslado._id,
          producto: item.producto,
          estado: 'pendiente'
        },
        { estado: 'completado' },
        { session }
      );

      // Registrar entrada en destino
      await InventarioLog.create([{
        producto: item.producto,
        cantidad: item.cantidad,
        tipo: 'transferencia_entrada',
        referencia: traslado._id,
        almacen: traslado.almacenDestino,
        usuario,
        estado: 'completado'
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    // 4. Responder con el traslado completado
    const trasladoCompletado = await Traslado.findById(id)
      .populate('almacenOrigen', 'nombre')
      .populate('almacenDestino', 'nombre')
      .populate('productos.producto', 'nombre codigo');

    res.status(200).json({
      success: true,
      data: trasladoCompletado,
      message: 'Traslado completado exitosamente'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(`Error en PUT /traslados/${req.params.id}/completar:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de traslado inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al completar el traslado',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;