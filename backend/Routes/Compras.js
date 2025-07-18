const express = require('express');
const router = express.Router();
const Compra = require('../Models/Compras');
const Producto = require('../Models/Producto');
const { validarCompra } = require('../Validators/Compras');

// Estados permitidos para las compras
const ESTADOS_COMPRA = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

// GET / - Obtener todas las compras con filtros avanzados
router.get('/', async (req, res) => {
  try {
    const { 
      limit = 10, 
      page = 1, 
      usuario, 
      estado, 
      fechaDesde, 
      fechaHasta,
      sort = '-fechaCreacion'
    } = req.query;

    // Construir query de filtrado
    const query = {};
    
    if (usuario) query.usuario = usuario;
    if (estado) query.estado = estado;
    
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
        { path: 'usuario', select: 'nombre email' },
        { path: 'productos.producto', select: 'nombre precio' }
      ]
    };

    const compras = await Compra.paginate(query, options);

    res.status(200).json({
      success: true,
      data: compras.docs,
      pagination: {
        total: compras.totalDocs,
        limit: compras.limit,
        page: compras.page,
        pages: compras.totalPages
      }
    });

  } catch (error) {
    console.error('Error en GET /compras:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las compras',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /:id - Obtener una compra específica con detalles completos
router.get('/:id', async (req, res) => {
  try {
    const compra = await Compra.findById(req.params.id)
      .populate('usuario', 'nombre email direccion')
      .populate('productos.producto', 'nombre precio imagen');

    if (!compra) {
      return res.status(404).json({
        success: false,
        error: 'Compra no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: compra
    });

  } catch (error) {
    console.error(`Error en GET /compras/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de compra inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener la compra'
    });
  }
});

// POST / - Crear nueva compra
router.post('/', validarCompra, async (req, res) => {
  const session = await Compra.startSession();
  session.startTransaction();
  
  try {
    const { usuario, productos, direccionEnvio } = req.body;

    // 1. Verificar stock y calcular total
    let total = 0;
    const productosActualizados = [];
    
    for (const item of productos) {
      const producto = await Producto.findById(item.producto).session(session);
      
      if (!producto) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          error: `Producto ${item.producto} no encontrado`
        });
      }
      
      if (producto.stock < item.cantidad) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          error: `Stock insuficiente para el producto ${producto.nombre}`,
          producto: producto._id,
          stockDisponible: producto.stock,
          cantidadSolicitada: item.cantidad
        });
      }
      
      // Actualizar stock (en memoria)
      producto.stock -= item.cantidad;
      productosActualizados.push(producto);
      
      total += producto.precio * item.cantidad;
    }

    // 2. Crear la compra
    const nuevaCompra = new Compra({
      usuario,
      productos,
      direccionEnvio,
      total,
      estado: 'pendiente'
    });

    await nuevaCompra.save({ session });

    // 3. Actualizar stock en la base de datos
    for (const producto of productosActualizados) {
      await producto.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // 4. Responder con la compra creada
    const compraCreada = await Compra.findById(nuevaCompra._id)
      .populate('usuario', 'nombre email')
      .populate('productos.producto', 'nombre precio');

    res.status(201).json({
      success: true,
      data: compraCreada,
      message: 'Compra creada exitosamente'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error en POST /compras:', error);
    
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
      error: 'Error al crear la compra',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /:id/estado - Actualizar estado de una compra
router.put('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const { id } = req.params;

    // Validar estado
    if (!ESTADOS_COMPRA.includes(estado)) {
      return res.status(400).json({
        success: false,
        error: 'Estado no válido',
        estadosPermitidos: ESTADOS_COMPRA
      });
    }

    // Actualizar estado
    const compra = await Compra.findByIdAndUpdate(
      id,
      { estado },
      { new: true, runValidators: true }
    );

    if (!compra) {
      return res.status(404).json({
        success: false,
        error: 'Compra no encontrada'
      });
    }

    // Si se cancela la compra, devolver el stock
    if (estado === 'cancelado') {
      const session = await Compra.startSession();
      session.startTransaction();
      
      try {
        for (const item of compra.productos) {
          await Producto.findByIdAndUpdate(
            item.producto,
            { $inc: { stock: item.cantidad } },
            { session }
          );
        }
        
        await session.commitTransaction();
        session.endSession();
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error al devolver stock:', error);
      }
    }

    res.status(200).json({
      success: true,
      data: compra,
      message: `Estado de compra actualizado a ${estado}`
    });

  } catch (error) {
    console.error(`Error en PUT /compras/${req.params.id}/estado:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de compra inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el estado de la compra'
    });
  }
});

module.exports = router;