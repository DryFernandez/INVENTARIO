const express = require('express');
const router = express.Router();
const Compra = require('../Models/Compras');
const Producto = require('../Models/Producto');
const ProductoAlmacen = require('../Models/ProductoAlmacen');
const Proveedor = require('../Models/Proveedor');
const InventarioLog = require('../Models/InventarioLog');
const { validarCompra } = require('../Validators/Compras');
const { checkAuth } = require('../Middlewares/auth');

// GET / - Obtener todas las compras
router.get('/', checkAuth, async (req, res) => {
  try {
    const compras = await Compra.find({ estado: { $ne: 'cancelada' } })
      .populate('proveedor', 'nombre ruc telefono email')
      .populate('usuario', 'nombre email')
      .populate('items.producto', 'nombre sku')
      .sort('-fechaCompra');

    res.status(200).json({
      success: true,
      data: compras
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
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const compra = await Compra.findById(req.params.id)
      .populate('proveedor', 'nombre ruc telefono email direccion')
      .populate('usuario', 'nombre email')
      .populate('items.producto', 'nombre sku precio');

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
router.post('/', checkAuth, async (req, res) => {
  try {
    const { proveedor, items, almacen, pagado } = req.body;
    const usuario = req.usuario?._id || req.user?._id;

    // 1. Verificar que el proveedor existe
    const proveedorExiste = await Proveedor.findById(proveedor);
    if (!proveedorExiste || !proveedorExiste.activo) {
      return res.status(400).json({
        success: false,
        error: 'Proveedor no válido o inactivo'
      });
    }

    // 2. Calcular total y preparar items
    let total = 0;
    const itemsCompra = [];
    
    for (const item of items) {
      const producto = await Producto.findById(item.producto);
      
      if (!producto || !producto.activo) {
        return res.status(400).json({
          success: false,
          error: `Producto ${item.producto} no encontrado o inactivo`
        });
      }

      itemsCompra.push({
        producto: producto._id,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario
      });

      total += item.cantidad * item.precioUnitario;
    }

    // 3. Generar número de factura
    const totalCompras = await Compra.countDocuments();
    const numeroFactura = `C-${String(totalCompras + 1).padStart(6, '0')}`;

    // 4. Crear la compra
    const nuevaCompra = new Compra({
      proveedor,
      items: itemsCompra,
      total,
      numeroFactura,
      usuario,
      pagado: pagado === true,
      estado: 'completada'
    });

    await nuevaCompra.save();

    // 5. Actualizar inventario (aumentar stock)
    for (const item of items) {
      // Buscar o crear ProductoAlmacen
      let productoAlmacen = await ProductoAlmacen.findOne({
        producto: item.producto,
        almacen: almacen || await Almacen.findOne({ activo: true }).select('_id')
      });

      if (!productoAlmacen) {
        // Crear nuevo registro si no existe
        productoAlmacen = await ProductoAlmacen.create({
          producto: item.producto,
          almacen: almacen || await Almacen.findOne({ activo: true }).select('_id'),
          stock: item.cantidad,
          stockMinimo: 5,
          stockMaximo: 1000
        });
      } else {
        // Actualizar stock existente
        const stockAnterior = productoAlmacen.stock;
        productoAlmacen.stock += item.cantidad;
        await productoAlmacen.save();

        // Registrar movimiento de inventario
        await InventarioLog.create({
          producto: item.producto,
          almacen: productoAlmacen.almacen,
          cantidad: item.cantidad,
          tipo: 'entrada',
          motivo: 'compra',
          referencia: nuevaCompra._id,
          stockAnterior: stockAnterior,
          stockNuevo: productoAlmacen.stock,
          usuario: usuario
        });
      }
    }

    // 6. Responder con la compra creada
    const compraCreada = await Compra.findById(nuevaCompra._id)
      .populate('proveedor', 'nombre ruc telefono email')
      .populate('usuario', 'nombre email')
      .populate('items.producto', 'nombre sku');

    res.status(201).json({
      success: true,
      data: compraCreada,
      message: 'Compra registrada exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /compras:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Error de validación',
        details: errors
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
      error: 'Error al registrar la compra',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;