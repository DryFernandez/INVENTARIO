// routes/Kardex.js
const express = require('express');
const router = express.Router();
const Kardex = require('../Models/Kardex');
const Producto = require('../Models/Producto');

// GET /producto/:productoId - Obtener kardex de un producto
router.get('/producto/:productoId', async (req, res) => {
  try {
    const { almacen, fechaInicio, fechaFin, limite = 100 } = req.query;

    const query = { producto: req.params.productoId };
    
    if (almacen) {
      query.almacen = almacen;
    }

    if (fechaInicio || fechaFin) {
      query.fecha = {};
      if (fechaInicio) query.fecha.$gte = new Date(fechaInicio);
      if (fechaFin) query.fecha.$lte = new Date(fechaFin);
    }

    const movimientos = await Kardex.find(query)
      .populate('producto', 'nombre sku')
      .populate('almacen', 'nombre')
      .populate('lote', 'numeroLote')
      .populate('usuario', 'nombre email')
      .sort({ fecha: -1 })
      .limit(parseInt(limite));

    // Calcular resumen
    const resumen = {
      totalMovimientos: movimientos.length,
      totalEntradas: movimientos.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.cantidad, 0),
      totalSalidas: movimientos.filter(m => m.tipo === 'salida').reduce((sum, m) => sum + m.cantidad, 0),
      saldoActual: movimientos.length > 0 ? movimientos[0].saldoCantidad : 0,
      valorActual: movimientos.length > 0 ? movimientos[0].saldoValor : 0,
      costoPromedioActual: movimientos.length > 0 ? movimientos[0].costoPromedio : 0
    };

    res.status(200).json({
      success: true,
      data: {
        movimientos,
        resumen
      }
    });

  } catch (error) {
    console.error('Error en GET /kardex/producto/:productoId:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener kardex del producto'
    });
  }
});

// GET /almacen/:almacenId - Obtener kardex de un almacén
router.get('/almacen/:almacenId', async (req, res) => {
  try {
    const { producto, tipo, fechaInicio, fechaFin, limite = 100 } = req.query;

    const query = { almacen: req.params.almacenId };
    
    if (producto) {
      query.producto = producto;
    }

    if (tipo) {
      query.tipo = tipo;
    }

    if (fechaInicio || fechaFin) {
      query.fecha = {};
      if (fechaInicio) query.fecha.$gte = new Date(fechaInicio);
      if (fechaFin) query.fecha.$lte = new Date(fechaFin);
    }

    const movimientos = await Kardex.find(query)
      .populate('producto', 'nombre sku')
      .populate('almacen', 'nombre')
      .populate('usuario', 'nombre email')
      .sort({ fecha: -1 })
      .limit(parseInt(limite));

    res.status(200).json({
      success: true,
      data: movimientos
    });

  } catch (error) {
    console.error('Error en GET /kardex/almacen/:almacenId:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener kardex del almacén'
    });
  }
});

// POST / - Registrar movimiento de kardex
router.post('/', async (req, res) => {
  try {
    const { 
      producto, 
      almacen, 
      tipo, 
      operacion, 
      cantidad, 
      costoUnitario,
      lote,
      referencia,
      referenciaModelo,
      numeroDocumento,
      descripcion,
      usuario
    } = req.body;

    // Obtener último movimiento para calcular saldos
    const ultimoMovimiento = await Kardex.findOne({ producto, almacen })
      .sort({ fecha: -1 });

    let saldoCantidad = ultimoMovimiento ? ultimoMovimiento.saldoCantidad : 0;
    let saldoValor = ultimoMovimiento ? ultimoMovimiento.saldoValor : 0;
    let costoPromedio = ultimoMovimiento ? ultimoMovimiento.costoPromedio : costoUnitario;

    // Calcular nuevos saldos según tipo de movimiento
    if (tipo === 'entrada' || tipo === 'traslado_entrada') {
      saldoCantidad += cantidad;
      saldoValor += cantidad * costoUnitario;
      costoPromedio = saldoCantidad > 0 ? saldoValor / saldoCantidad : costoUnitario;
    } else if (tipo === 'salida' || tipo === 'traslado_salida') {
      saldoCantidad -= cantidad;
      saldoValor -= cantidad * costoPromedio;
      if (saldoCantidad < 0) saldoCantidad = 0;
      if (saldoValor < 0) saldoValor = 0;
    } else if (tipo === 'ajuste') {
      if (operacion === 'ajuste_positivo') {
        saldoCantidad += cantidad;
        saldoValor += cantidad * costoUnitario;
      } else {
        saldoCantidad -= cantidad;
        saldoValor -= cantidad * costoPromedio;
      }
      costoPromedio = saldoCantidad > 0 ? saldoValor / saldoCantidad : costoUnitario;
    }

    const nuevoMovimiento = await Kardex.create({
      producto,
      almacen,
      lote,
      tipo,
      operacion,
      cantidad,
      costoUnitario,
      costoTotal: cantidad * costoUnitario,
      saldoCantidad,
      saldoValor,
      costoPromedio,
      referencia,
      referenciaModelo,
      numeroDocumento,
      descripcion,
      usuario
    });

    // Actualizar stock del producto
    await Producto.findByIdAndUpdate(producto, { stock: saldoCantidad });

    res.status(201).json({
      success: true,
      data: nuevoMovimiento,
      message: 'Movimiento registrado en kardex'
    });

  } catch (error) {
    console.error('Error en POST /kardex:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar movimiento en kardex'
    });
  }
});

module.exports = router;
