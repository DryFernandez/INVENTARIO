const express = require('express');
const router = express.Router();
const ProductoAlmacen = require('../Models/ProductoAlmacen');
const Producto = require('../Models/Producto');
const Almacen = require('../Models/Almacen');
const InventarioLog = require('../Models/InventarioLog');
const { checkAuth, checkRol } = require('../Middlewares/auth');

// GET / - Obtener inventario de todos los almacenes
router.get('/', checkAuth, async (req, res) => {
  try {
    const { almacen, producto, stockBajo } = req.query;
    
    const query = { activo: true };
    
    if (almacen) query.almacen = almacen;
    if (producto) query.producto = producto;
    if (stockBajo === 'true') {
      query.$expr = { $lte: ['$stock', '$stockMinimo'] };
    }

    const inventario = await ProductoAlmacen.find(query)
      .populate('producto', 'sku nombre descripcion precio categoria')
      .populate('almacen', 'nombre ubicacion')
      .populate({
        path: 'producto',
        populate: {
          path: 'categoria',
          select: 'nombre'
        }
      })
      .sort({ 'almacen': 1, 'producto.nombre': 1 });

    res.status(200).json({
      success: true,
      data: inventario
    });

  } catch (error) {
    console.error('Error en GET /inventario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el inventario'
    });
  }
});

// GET /almacen/:almacenId - Obtener inventario de un almacén específico
router.get('/almacen/:almacenId', checkAuth, async (req, res) => {
  try {
    const { almacenId } = req.params;

    // Verificar que el almacén existe
    const almacen = await Almacen.findOne({ _id: almacenId, activo: true });
    if (!almacen) {
      return res.status(404).json({
        success: false,
        error: 'Almacén no encontrado'
      });
    }

    const inventario = await ProductoAlmacen.find({ 
      almacen: almacenId, 
      activo: true 
    })
      .populate('producto', 'sku nombre descripcion precio categoria')
      .populate({
        path: 'producto',
        populate: {
          path: 'categoria',
          select: 'nombre'
        }
      })
      .sort({ 'producto.nombre': 1 });

    // Calcular estadísticas del almacén
    const stats = {
      totalProductos: inventario.length,
      stockTotal: inventario.reduce((sum, item) => sum + item.stock, 0),
      valorTotal: inventario.reduce((sum, item) => {
        return sum + (item.stock * (item.producto?.precio || 0));
      }, 0),
      productosStockBajo: inventario.filter(item => item.stockBajo).length
    };

    res.status(200).json({
      success: true,
      data: {
        almacen,
        inventario,
        estadisticas: stats
      }
    });

  } catch (error) {
    console.error(`Error en GET /inventario/almacen/${req.params.almacenId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el inventario del almacén'
    });
  }
});

// POST / - Agregar producto a almacén
router.post('/', checkAuth, checkRol(['admin', 'almacenero']), async (req, res) => {
  const session = await ProductoAlmacen.startSession();
  session.startTransaction();

  try {
    const { 
      producto, 
      almacen, 
      stock, 
      stockMinimo, 
      stockMaximo,
      ubicacionFisica,
      lote
    } = req.body;

    // Verificar que el producto existe
    const productoExiste = await Producto.findOne({ _id: producto, activo: true });
    if (!productoExiste) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Verificar que el almacén existe
    const almacenExiste = await Almacen.findOne({ _id: almacen, activo: true });
    if (!almacenExiste) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        error: 'Almacén no encontrado'
      });
    }

    // Verificar si ya existe este producto en este almacén
    const existente = await ProductoAlmacen.findOne({ producto, almacen });
    if (existente) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: 'Este producto ya está registrado en este almacén',
        data: existente
      });
    }

    // Crear el registro de inventario
    const nuevoInventario = await ProductoAlmacen.create([{
      producto,
      almacen,
      stock: stock || 0,
      stockMinimo: stockMinimo || 5,
      stockMaximo,
      ubicacionFisica,
      lote
    }], { session });

    // Registrar en el log si hay stock inicial
    if (stock > 0) {
      await InventarioLog.create([{
        producto,
        cantidad: stock,
        tipo: 'ajuste',
        detalle: 'Stock inicial en almacén',
        usuario: req.user.id
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    const inventarioCreado = await ProductoAlmacen.findById(nuevoInventario[0]._id)
      .populate('producto', 'sku nombre precio')
      .populate('almacen', 'nombre ubicacion');

    res.status(201).json({
      success: true,
      data: inventarioCreado,
      message: 'Producto agregado al almacén exitosamente'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error en POST /inventario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al agregar producto al almacén'
    });
  }
});

// PUT /:id/stock - Ajustar stock de producto en almacén
router.put('/:id/stock', checkAuth, checkRol(['admin', 'almacenero']), async (req, res) => {
  const session = await ProductoAlmacen.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { cantidad, tipo, detalle } = req.body; // cantidad puede ser positiva (entrada) o negativa (salida)

    const inventario = await ProductoAlmacen.findById(id).session(session);
    if (!inventario) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        error: 'Registro de inventario no encontrado'
      });
    }

    const stockAnterior = inventario.stock;
    const nuevoStock = stockAnterior + cantidad;

    // Validar que no quede stock negativo
    if (nuevoStock < 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: 'No se puede ajustar el stock a un valor negativo',
        stockActual: stockAnterior,
        ajuste: cantidad,
        stockResultante: nuevoStock
      });
    }

    // Actualizar stock
    inventario.stock = nuevoStock;
    inventario.fechaUltimaActualizacion = Date.now();
    await inventario.save({ session });

    // Registrar movimiento en el log
    await InventarioLog.create([{
      producto: inventario.producto,
      cantidad,
      tipo: tipo || 'ajuste',
      detalle: detalle || `Ajuste de stock en almacén`,
      usuario: req.user.id
    }], { session });

    await session.commitTransaction();
    session.endSession();

    const inventarioActualizado = await ProductoAlmacen.findById(id)
      .populate('producto', 'sku nombre precio')
      .populate('almacen', 'nombre ubicacion');

    res.status(200).json({
      success: true,
      data: inventarioActualizado,
      cambio: {
        stockAnterior,
        ajuste: cantidad,
        stockNuevo: nuevoStock
      },
      message: 'Stock ajustado exitosamente'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(`Error en PUT /inventario/${req.params.id}/stock:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al ajustar el stock'
    });
  }
});

// PUT /:id - Actualizar configuración de producto en almacén
router.put('/:id', checkAuth, checkRol(['admin', 'almacenero']), async (req, res) => {
  try {
    const { id } = req.params;
    const { stockMinimo, stockMaximo, ubicacionFisica, lote } = req.body;

    const inventario = await ProductoAlmacen.findByIdAndUpdate(
      id,
      {
        stockMinimo,
        stockMaximo,
        ubicacionFisica,
        lote,
        fechaUltimaActualizacion: Date.now()
      },
      { new: true, runValidators: true }
    )
      .populate('producto', 'sku nombre precio')
      .populate('almacen', 'nombre ubicacion');

    if (!inventario) {
      return res.status(404).json({
        success: false,
        error: 'Registro de inventario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: inventario,
      message: 'Configuración actualizada exitosamente'
    });

  } catch (error) {
    console.error(`Error en PUT /inventario/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar la configuración'
    });
  }
});

// DELETE /:id - Eliminar producto del almacén (borrado lógico)
router.delete('/:id', checkAuth, checkRol(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const inventario = await ProductoAlmacen.findByIdAndUpdate(
      id,
      { activo: false, fechaUltimaActualizacion: Date.now() },
      { new: true }
    );

    if (!inventario) {
      return res.status(404).json({
        success: false,
        error: 'Registro de inventario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: inventario,
      message: 'Producto removido del almacén exitosamente'
    });

  } catch (error) {
    console.error(`Error en DELETE /inventario/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al remover el producto del almacén'
    });
  }
});

// GET /estadisticas - Estadísticas generales de inventario
router.get('/estadisticas/general', checkAuth, async (req, res) => {
  try {
    const inventarioTotal = await ProductoAlmacen.find({ activo: true })
      .populate('producto', 'precio')
      .populate('almacen', 'nombre');

    // Agrupar por almacén
    const porAlmacen = {};
    
    inventarioTotal.forEach(item => {
      const almacenNombre = item.almacen?.nombre || 'Sin almacén';
      
      if (!porAlmacen[almacenNombre]) {
        porAlmacen[almacenNombre] = {
          almacen: almacenNombre,
          totalProductos: 0,
          stockTotal: 0,
          valorTotal: 0,
          productosStockBajo: 0
        };
      }
      
      porAlmacen[almacenNombre].totalProductos++;
      porAlmacen[almacenNombre].stockTotal += item.stock;
      porAlmacen[almacenNombre].valorTotal += item.stock * (item.producto?.precio || 0);
      if (item.stockBajo) {
        porAlmacen[almacenNombre].productosStockBajo++;
      }
    });

    const estadisticas = {
      global: {
        totalProductos: inventarioTotal.length,
        stockTotal: inventarioTotal.reduce((sum, item) => sum + item.stock, 0),
        valorTotal: inventarioTotal.reduce((sum, item) => {
          return sum + (item.stock * (item.producto?.precio || 0));
        }, 0),
        productosStockBajo: inventarioTotal.filter(item => item.stockBajo).length
      },
      porAlmacen: Object.values(porAlmacen)
    };

    res.status(200).json({
      success: true,
      data: estadisticas
    });

  } catch (error) {
    console.error('Error en GET /inventario/estadisticas/general:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

module.exports = router;
