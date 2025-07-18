const express = require('express');
const router = express.Router();
const Producto = require('../Models/Producto');
const InventarioLog = require('../Models/InventarioLog');
const { validarProducto } = require('../Validators/Producto');

// GET / - Obtener productos con filtros avanzados
router.get('/', async (req, res) => {
  try {
    const { 
      limit = 20,
      page = 1,
      search = '',
      categoria,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      sort = 'nombre',
      order = 'asc'
    } = req.query;

    // Construir query de búsqueda
    const query = {
      estado: true,
      $or: [
        { codigo: { $regex: search, $options: 'i' } },
        { nombre: { $regex: search, $options: 'i' } },
        { descripcion: { $regex: search, $options: 'i' } }
      ]
    };

    // Filtros adicionales
    if (categoria) query.categoria = categoria;
    if (minPrice || maxPrice) {
      query.precio = {};
      if (minPrice) query.precio.$gte = parseFloat(minPrice);
      if (maxPrice) query.precio.$lte = parseFloat(maxPrice);
    }
    if (minStock || maxStock) {
      query.stock = {};
      if (minStock) query.stock.$gte = parseInt(minStock);
      if (maxStock) query.stock.$lte = parseInt(maxStock);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort]: order === 'asc' ? 1 : -1 },
      collation: { locale: 'es' }
    };

    const productos = await Producto.paginate(query, options);

    res.status(200).json({
      success: true,
      data: productos.docs,
      pagination: {
        total: productos.totalDocs,
        limit: productos.limit,
        page: productos.page,
        pages: productos.totalPages
      }
    });

  } catch (error) {
    console.error('Error en GET /productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los productos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /:id - Obtener un producto específico
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findOne({
      _id: req.params.id,
      estado: true
    }).populate('categoria', 'nombre');

    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Obtener historial de movimientos recientes
    const movimientos = await InventarioLog.find({ producto: req.params.id })
      .sort('-fecha')
      .limit(5)
      .select('tipo cantidad fecha usuario')
      .populate('usuario', 'nombre rol');

    res.status(200).json({
      success: true,
      data: {
        ...producto.toObject(),
        movimientosRecientes: movimientos
      }
    });

  } catch (error) {
    console.error(`Error en GET /productos/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de producto inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener el producto'
    });
  }
});

// POST / - Crear nuevo producto
router.post('/', validarProducto, async (req, res) => {
  try {
    const { codigo, nombre } = req.body;

    // Verificar si el código ya existe
    const existeCodigo = await Producto.findOne({ codigo });
    if (existeCodigo) {
      return res.status(400).json({
        success: false,
        error: 'El código de producto ya está en uso'
      });
    }

    // Verificar si el nombre ya existe
    const existeNombre = await Producto.findOne({ nombre });
    if (existeNombre) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de producto ya está en uso'
      });
    }

    const nuevoProducto = await Producto.create(req.body);

    // Registrar inventario inicial
    if (nuevoProducto.stock > 0) {
      await InventarioLog.create({
        producto: nuevoProducto._id,
        cantidad: nuevoProducto.stock,
        tipo: 'inventario_inicial',
        stockAnterior: 0,
        stockNuevo: nuevoProducto.stock,
        usuario: req.user?.id || 'sistema'
      });
    }

    res.status(201).json({
      success: true,
      data: nuevoProducto,
      message: 'Producto creado exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /productos:', error);
    
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
      error: 'Error al crear el producto',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /:id - Actualizar producto existente
router.put('/:id', validarProducto, async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre } = req.body;

    // Verificar si el código ya existe en otro producto
    if (codigo) {
      const existeCodigo = await Producto.findOne({ codigo, _id: { $ne: id } });
      if (existeCodigo) {
        return res.status(400).json({
          success: false,
          error: 'El código de producto ya está en uso'
        });
      }
    }

    // Verificar si el nombre ya existe en otro producto
    if (nombre) {
      const existeNombre = await Producto.findOne({ nombre, _id: { $ne: id } });
      if (existeNombre) {
        return res.status(400).json({
          success: false,
          error: 'El nombre de producto ya está en uso'
        });
      }
    }

    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!productoActualizado || !productoActualizado.estado) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: productoActualizado,
      message: 'Producto actualizado exitosamente'
    });

  } catch (error) {
    console.error(`Error en PUT /productos/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de producto inválido'
      });
    }
    
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
      error: 'Error al actualizar el producto'
    });
  }
});

// PATCH /:id/stock - Ajustar stock de producto
router.patch('/:id/stock', async (req, res) => {
  const session = await Producto.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { cantidad, motivo, notas, usuario } = req.body;

    // 1. Verificar que el producto existe
    const producto = await Producto.findById(id).session(session);
    if (!producto || !producto.estado) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // 2. Validar que la cantidad no deje stock negativo
    const nuevoStock = producto.stock + cantidad;
    if (nuevoStock < 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: 'No se puede ajustar el stock a un valor negativo',
        stockActual: producto.stock,
        intentoAjuste: cantidad,
        resultado: nuevoStock
      });
    }

    // 3. Registrar el movimiento en el log
    const movimiento = new InventarioLog({
      producto: id,
      cantidad,
      tipo: 'ajuste',
      motivo,
      notas,
      usuario,
      stockAnterior: producto.stock,
      stockNuevo: nuevoStock
    });

    await movimiento.save({ session });

    // 4. Actualizar el stock del producto
    producto.stock = nuevoStock;
    await producto.save({ session });

    await session.commitTransaction();
    session.endSession();

    // 5. Responder con el producto actualizado
    const productoActualizado = await Producto.findById(id)
      .populate('categoria', 'nombre');

    res.status(200).json({
      success: true,
      data: productoActualizado,
      movimiento: movimiento,
      message: 'Stock ajustado correctamente'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(`Error en PATCH /productos/${req.params.id}/stock:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de producto inválido'
      });
    }
    
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
      error: 'Error al ajustar el stock del producto',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;