const express = require('express');
const router = express.Router();
const Venta = require('../Models/Venta');
const Producto = require('../Models/Producto');
const ProductoAlmacen = require('../Models/ProductoAlmacen');
const Cliente = require('../Models/Clientes');
const InventarioLog = require('../Models/InventarioLog');
const { validarVenta } = require('../Validators/Venta');
const { checkAuth, checkRol } = require('../Middlewares/auth');

// GET /ventas - Obtener todas las ventas
router.get('/', checkAuth, async (req, res) => {
  try {
    const ventas = await Venta.find({ estado: 'completada' })
      .populate('cliente', 'nombre ruc email telefono')
      .populate('usuario', 'nombre email')
      .populate('items.producto', 'nombre sku')
      .sort('-fechaVenta');

    res.status(200).json({
      success: true,
      data: ventas
    });

  } catch (error) {
    console.error('Error en GET /ventas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las ventas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /ventas/:id - Obtener una venta específica
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('cliente', 'nombre ruc email telefono direccion')
      .populate('usuario', 'nombre email')
      .populate('items.producto', 'nombre sku precio');

    if (!venta) {
      return res.status(404).json({
        success: false,
        error: 'Venta no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: venta
    });

  } catch (error) {
    console.error(`Error en GET /ventas/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de venta inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener la venta'
    });
  }
});

// POST /ventas - Crear nueva venta
router.post('/', checkAuth, async (req, res) => {
  try {
    const { cliente, items, subtotal, impuesto, total, metodoPago, datosTarjeta, almacen } = req.body;
    const usuario = req.usuario?._id || req.user?._id;

    // 1. Verificar que el cliente existe
    const clienteExiste = await Cliente.findById(cliente);
    if (!clienteExiste || !clienteExiste.activo) {
      return res.status(400).json({
        success: false,
        error: 'Cliente no válido o inactivo'
      });
    }

    // 2. Verificar stock y actualizar inventario
    const itemsActualizados = [];
    
    for (const item of items) {
      const producto = await Producto.findById(item.producto);
      
      if (!producto || !producto.activo) {
        return res.status(400).json({
          success: false,
          error: `Producto ${item.producto} no encontrado o inactivo`
        });
      }

      // Buscar el stock en el almacén específico o usar el primero disponible
      let productoAlmacen;
      if (almacen) {
        productoAlmacen = await ProductoAlmacen.findOne({
          producto: item.producto,
          almacen: almacen
        });
      } else {
        productoAlmacen = await ProductoAlmacen.findOne({
          producto: item.producto
        }).sort('-stock');
      }

      if (!productoAlmacen) {
        return res.status(400).json({
          success: false,
          error: `No hay stock disponible para el producto ${producto.nombre}`
        });
      }
      
      if (productoAlmacen.stock < item.cantidad) {
        return res.status(400).json({
          success: false,
          error: `Stock insuficiente para el producto ${producto.nombre}`,
          stockDisponible: productoAlmacen.stock,
          cantidadSolicitada: item.cantidad
        });
      }
      
      // Actualizar stock
      const stockAnterior = productoAlmacen.stock;
      productoAlmacen.stock -= item.cantidad;
      await productoAlmacen.save();
      
      // Registrar movimiento de inventario
      await InventarioLog.create({
        producto: producto._id,
        almacen: productoAlmacen.almacen,
        cantidad: -item.cantidad,
        tipo: 'salida',
        motivo: 'venta',
        stockAnterior: stockAnterior,
        stockNuevo: productoAlmacen.stock,
        usuario: usuario
      });

      itemsActualizados.push({
        producto: producto._id,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario || producto.precio
      });
    }

    // 3. Generar número de comprobante
    const totalVentas = await Venta.countDocuments();
    const numeroComprobante = `V-${String(totalVentas + 1).padStart(6, '0')}`;

    // 4. Preparar datos de tarjeta (solo últimos 4 dígitos)
    let datosTarjetaSegura = null;
    if (metodoPago === 'tarjeta' && datosTarjeta) {
      datosTarjetaSegura = {
        numeroTarjeta: datosTarjeta.numeroTarjeta ? `****${datosTarjeta.numeroTarjeta.slice(-4)}` : null,
        titular: datosTarjeta.titular,
        fechaExpiracion: datosTarjeta.fechaExpiracion
      };
    }

    // 5. Crear la venta
    const nuevaVenta = new Venta({
      cliente,
      items: itemsActualizados,
      subtotal,
      impuesto,
      total,
      usuario,
      metodoPago,
      datosTarjeta: datosTarjetaSegura,
      numeroComprobante,
      estado: 'completada'
    });

    await nuevaVenta.save();

    // 6. Responder con la venta creada
    const ventaCreada = await Venta.findById(nuevaVenta._id)
      .populate('cliente', 'nombre ruc email telefono')
      .populate('usuario', 'nombre email')
      .populate('items.producto', 'nombre sku');

    res.status(201).json({
      success: true,
      data: ventaCreada,
      message: 'Venta registrada exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /ventas:', error);
    
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
      error: 'Error al registrar la venta',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


module.exports = router;