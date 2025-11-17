const express = require('express');
const router = express.Router();
const Producto = require('../Models/Producto');
const ProductoAlmacen = require('../Models/ProductoAlmacen');
const Almacen = require('../Models/Almacen');
const Categoria = require('../Models/Categorias');
const InventarioLog = require('../Models/InventarioLog');
const { validarProducto, manejarErroresValidacion } = require('../Validators/Producto');

// Función para generar SKU automático
const generarSKU = async (categoriaId) => {
  try {
    const categoria = await Categoria.findById(categoriaId);
    if (!categoria) return null;
    
    // Obtener las primeras 3 letras de la categoría en mayúsculas
    const prefijo = categoria.nombre.substring(0, 3).toUpperCase().replace(/\s/g, '');
    
    // Contar productos existentes en esta categoría
    const count = await Producto.countDocuments({ categoria: categoriaId });
    
    // Generar número secuencial de 4 dígitos
    const numero = String(count + 1).padStart(4, '0');
    
    return `${prefijo}-${numero}`;
  } catch (error) {
    console.error('Error generando SKU:', error);
    return null;
  }
};

// Middleware para limpiar campos vacíos
const limpiarCamposVacios = (req, res, next) => {
  const camposOpcionales = ['almacen', 'proveedor', 'descripcion', 'imagen', 'stockMinimo'];
  
  // Eliminar campos opcionales que estén vacíos
  camposOpcionales.forEach(campo => {
    if (req.body[campo] === '' || req.body[campo] === null || req.body[campo] === undefined) {
      delete req.body[campo];
    }
  });

  // Convertir campos numéricos solo si tienen valor
  if (req.body.precio && req.body.precio !== '') {
    req.body.precio = parseFloat(req.body.precio);
  }
  if (req.body.stock !== undefined && req.body.stock !== '' && req.body.stock !== null) {
    req.body.stock = parseInt(req.body.stock, 10);
  } else if (req.body.stock === '' || req.body.stock === null) {
    req.body.stock = 0; // Stock por defecto
  }
  if (req.body.stockMinimo && req.body.stockMinimo !== '') {
    req.body.stockMinimo = parseInt(req.body.stockMinimo, 10);
  }
  if (req.body.stockMaximo && req.body.stockMaximo !== '') {
    req.body.stockMaximo = parseInt(req.body.stockMaximo, 10);
  }
  
  next();
};

// GET / - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true })
      .populate('categoria', 'nombre')
      .populate('proveedor', 'nombre')
      .sort({ nombre: 1 });

    // Obtener el stock total y almacén de cada producto desde ProductoAlmacen
    const productosConStock = await Promise.all(
      productos.map(async (producto) => {
        const inventarios = await ProductoAlmacen.find({ 
          producto: producto._id,
          activo: true 
        }).populate('almacen', 'nombre');
        
        const stockTotal = inventarios.reduce((sum, inv) => sum + inv.stock, 0);
        const almacen = inventarios.length > 0 ? inventarios[0].almacen : null;
        
        return {
          ...producto.toObject(),
          stock: stockTotal,
          almacen: almacen
        };
      })
    );

    res.status(200).json(productosConStock);
  } catch (error) {
    console.error('Error en GET /productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /:id - Obtener un producto específico
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findOne({
      _id: req.params.id,
      activo: true
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
router.post('/', limpiarCamposVacios, validarProducto, manejarErroresValidacion, async (req, res) => {
  try {
    const { nombre, categoria, almacen, stock } = req.body;
    let { sku } = req.body;

    // Generar SKU automáticamente si no se proporciona
    if (!sku || sku === '') {
      sku = await generarSKU(categoria);
      if (!sku) {
        return res.status(400).json({
          success: false,
          error: 'No se pudo generar el SKU automáticamente'
        });
      }
    }

    // Verificar si el SKU ya existe en productos activos
    const existeSkuActivo = await Producto.findOne({ sku, activo: true });
    if (existeSkuActivo) {
      return res.status(400).json({
        success: false,
        error: 'El SKU de producto ya está en uso'
      });
    }

    // Si existe un producto inactivo con el mismo SKU, reactivarlo
    const productoInactivo = await Producto.findOne({ sku, activo: false });
    if (productoInactivo) {
      // Actualizar datos del producto inactivo
      Object.assign(productoInactivo, req.body);
      productoInactivo.sku = sku;
      productoInactivo.activo = true;
      await productoInactivo.save();

      // Si se especificó un almacén, actualizar o crear el registro en ProductoAlmacen
      if (almacen) {
        const existeEnAlmacen = await ProductoAlmacen.findOne({
          producto: productoInactivo._id,
          almacen: almacen
        });

        if (existeEnAlmacen) {
          existeEnAlmacen.stock = stock || 0;
          existeEnAlmacen.stockMinimo = req.body.stockMinimo || 0;
          existeEnAlmacen.stockMaximo = req.body.stockMaximo || 1000;
          await existeEnAlmacen.save();
        } else {
          await ProductoAlmacen.create({
            producto: productoInactivo._id,
            almacen: almacen,
            stock: stock || 0,
            stockMinimo: req.body.stockMinimo || 0,
            stockMaximo: req.body.stockMaximo || 1000
          });
        }

        // Registrar inventario inicial si hay stock
        if (stock > 0) {
          await InventarioLog.create({
            producto: productoInactivo._id,
            almacen: almacen,
            cantidad: stock,
            tipo: 'entrada',
            motivo: 'reactivacion_producto',
            stockAnterior: 0,
            stockNuevo: stock
          });
        }
      }

      return res.status(201).json({
        success: true,
        data: productoInactivo,
        message: 'Producto reactivado exitosamente'
      });
    }

    // Crear el producto con el SKU generado
    const nuevoProducto = await Producto.create({
      ...req.body,
      sku
    });

    // Si se especificó un almacén, crear el registro en ProductoAlmacen
    if (almacen) {
      await ProductoAlmacen.create({
        producto: nuevoProducto._id,
        almacen: almacen,
        stock: stock || 0,
        stockMinimo: req.body.stockMinimo || 0,
        stockMaximo: req.body.stockMaximo || 1000
      });

      // Registrar inventario inicial
      if (stock > 0) {
        await InventarioLog.create({
          producto: nuevoProducto._id,
          almacen: almacen,
          cantidad: stock,
          tipo: 'entrada',
          motivo: 'inventario_inicial',
          stockAnterior: 0,
          stockNuevo: stock
        });
      }
    }

    const productoCompleto = await Producto.findById(nuevoProducto._id)
      .populate('categoria', 'nombre')
      .populate('proveedor', 'nombre');

    res.status(201).json({
      success: true,
      data: productoCompleto,
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
router.put('/:id', limpiarCamposVacios, validarProducto, manejarErroresValidacion, async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, nombre } = req.body;

    // Verificar si el SKU ya existe en otro producto
    if (sku) {
      const existeSku = await Producto.findOne({ sku, _id: { $ne: id } });
      if (existeSku) {
        return res.status(400).json({
          success: false,
          error: 'El SKU de producto ya está en uso'
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

// DELETE /:id - Eliminar producto (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findById(id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Soft delete - marcar como inactivo
    producto.activo = false;
    await producto.save();

    // También marcar como inactivo en ProductoAlmacen
    await ProductoAlmacen.updateMany(
      { producto: id },
      { activo: false }
    );

    res.status(200).json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error(`Error en DELETE /productos/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de producto inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al eliminar el producto',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;