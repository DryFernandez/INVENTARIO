// Routes/Reportes.js
const express = require('express');
const router = express.Router();
const Producto = require('../Models/Producto');
const Venta = require('../Models/Venta');
const Compra = require('../Models/Compras');
const InventarioLog = require('../Models/InventarioLog');
const Lote = require('../Models/Lote');
const { checkAuth: auth } = require('../Middlewares/auth');

// Reporte de valorización de inventario
router.get('/valorizacion', auth, async (req, res) => {
  try {
    const { almacen, categoria } = req.query;
    const filtros = { activo: true };
    
    if (almacen) filtros.almacen = almacen;
    if (categoria) filtros.categoria = categoria;

    const productos = await Producto.find(filtros)
      .populate('categoria', 'nombre')
      .populate('almacen', 'nombre');

    const valorizacion = productos.map(p => ({
      sku: p.sku,
      nombre: p.nombre,
      categoria: p.categoria?.nombre,
      almacen: p.almacen?.nombre,
      stock: p.stock,
      costo: p.costo || 0,
      valorTotal: p.stock * (p.costo || 0),
      precio: p.precio,
      valorVenta: p.stock * p.precio,
      margen: p.precio - (p.costo || 0),
      porcentajeMargen: p.costo ? ((p.precio - p.costo) / p.costo * 100).toFixed(2) : 0
    }));

    const totales = {
      totalCosto: valorizacion.reduce((sum, p) => sum + p.valorTotal, 0),
      totalVenta: valorizacion.reduce((sum, p) => sum + p.valorVenta, 0),
      totalProductos: productos.length,
      totalUnidades: valorizacion.reduce((sum, p) => sum + p.stock, 0)
    };

    res.json({ productos: valorizacion, totales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporte de productos más vendidos
router.get('/mas-vendidos', auth, async (req, res) => {
  try {
    const { fechaInicio, fechaFin, limit = 10 } = req.query;
    const filtroFecha = {};
    
    if (fechaInicio) filtroFecha.$gte = new Date(fechaInicio);
    if (fechaFin) filtroFecha.$lte = new Date(fechaFin);
    
    const matchStage = Object.keys(filtroFecha).length > 0 
      ? { fechaVenta: filtroFecha } 
      : {};

    const masVendidos = await Venta.aggregate([
      { $match: matchStage },
      { $unwind: '$productos' },
      {
        $group: {
          _id: '$productos.producto',
          totalVendido: { $sum: '$productos.cantidad' },
          totalIngresos: { $sum: '$productos.subtotal' },
          numeroVentas: { $sum: 1 }
        }
      },
      { $sort: { totalVendido: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'productos',
          localField: '_id',
          foreignField: '_id',
          as: 'producto'
        }
      },
      { $unwind: '$producto' }
    ]);

    res.json(masVendidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporte de rotación de inventario
router.get('/rotacion', auth, async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const diasPeriodo = fechaInicio && fechaFin 
      ? Math.ceil((new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24))
      : 30;

    const filtroFecha = {};
    if (fechaInicio) filtroFecha.$gte = new Date(fechaInicio);
    if (fechaFin) filtroFecha.$lte = new Date(fechaFin);

    const matchStage = Object.keys(filtroFecha).length > 0 
      ? { fechaVenta: filtroFecha } 
      : {};

    const ventasPorProducto = await Venta.aggregate([
      { $match: matchStage },
      { $unwind: '$productos' },
      {
        $group: {
          _id: '$productos.producto',
          cantidadVendida: { $sum: '$productos.cantidad' }
        }
      }
    ]);

    const productos = await Producto.find({ activo: true });
    
    const rotacion = productos.map(p => {
      const venta = ventasPorProducto.find(v => v._id.toString() === p._id.toString());
      const cantidadVendida = venta?.cantidadVendida || 0;
      const stockPromedio = (p.stock + cantidadVendida) / 2;
      const indiceRotacion = stockPromedio > 0 ? (cantidadVendida / stockPromedio).toFixed(2) : 0;
      const diasInventario = indiceRotacion > 0 ? (diasPeriodo / indiceRotacion).toFixed(0) : 0;

      return {
        sku: p.sku,
        nombre: p.nombre,
        stockActual: p.stock,
        cantidadVendida,
        indiceRotacion: parseFloat(indiceRotacion),
        diasInventario: parseInt(diasInventario),
        clasificacion: indiceRotacion > 2 ? 'Alta' : indiceRotacion > 1 ? 'Media' : 'Baja'
      };
    });

    rotacion.sort((a, b) => b.indiceRotacion - a.indiceRotacion);

    res.json(rotacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporte de productos con rotación lenta
router.get('/rotacion-lenta', auth, async (req, res) => {
  try {
    const diasSinMovimiento = parseInt(req.query.dias) || 90;
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasSinMovimiento);

    const productos = await Producto.find({ 
      activo: true,
      stock: { $gt: 0 }
    });

    const productosLentos = [];

    for (const producto of productos) {
      const ultimaVenta = await Venta.findOne({
        'productos.producto': producto._id,
        fechaVenta: { $gte: fechaLimite }
      }).sort({ fechaVenta: -1 });

      const ultimaCompra = await Compra.findOne({
        'productos.producto': producto._id,
        fechaCompra: { $gte: fechaLimite }
      }).sort({ fechaCompra: -1 });

      if (!ultimaVenta && !ultimaCompra) {
        const valorInmovilizado = producto.stock * (producto.costo || 0);
        productosLentos.push({
          sku: producto.sku,
          nombre: producto.nombre,
          stock: producto.stock,
          costo: producto.costo,
          valorInmovilizado,
          diasSinMovimiento
        });
      }
    }

    productosLentos.sort((a, b) => b.valorInmovilizado - a.valorInmovilizado);

    res.json({
      productos: productosLentos,
      total: productosLentos.length,
      valorTotal: productosLentos.reduce((sum, p) => sum + p.valorInmovilizado, 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporte de márgenes de ganancia
router.get('/margenes', auth, async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const filtroFecha = {};
    
    if (fechaInicio) filtroFecha.$gte = new Date(fechaInicio);
    if (fechaFin) filtroFecha.$lte = new Date(fechaFin);
    
    const matchStage = Object.keys(filtroFecha).length > 0 
      ? { fechaVenta: filtroFecha } 
      : {};

    const ventas = await Venta.find(matchStage).populate('productos.producto');
    
    let totalVentas = 0;
    let totalCostos = 0;
    const margenPorProducto = [];

    for (const venta of ventas) {
      for (const item of venta.productos) {
        const producto = item.producto;
        const precioVenta = item.precioUnitario;
        const costoProducto = producto.costo || 0;
        const cantidad = item.cantidad;
        
        const ingresoTotal = precioVenta * cantidad;
        const costoTotal = costoProducto * cantidad;
        const margen = ingresoTotal - costoTotal;
        const porcentajeMargen = costoTotal > 0 ? ((margen / costoTotal) * 100).toFixed(2) : 0;

        totalVentas += ingresoTotal;
        totalCostos += costoTotal;

        const existente = margenPorProducto.find(p => p.sku === producto.sku);
        if (existente) {
          existente.ingresoTotal += ingresoTotal;
          existente.costoTotal += costoTotal;
          existente.margen += margen;
          existente.cantidadVendida += cantidad;
        } else {
          margenPorProducto.push({
            sku: producto.sku,
            nombre: producto.nombre,
            cantidadVendida: cantidad,
            precioVenta,
            costo: costoProducto,
            ingresoTotal,
            costoTotal,
            margen,
            porcentajeMargen: parseFloat(porcentajeMargen)
          });
        }
      }
    }

    margenPorProducto.sort((a, b) => b.margen - a.margen);

    res.json({
      productos: margenPorProducto,
      totales: {
        totalVentas,
        totalCostos,
        margenTotal: totalVentas - totalCostos,
        porcentajeMargenGlobal: totalCostos > 0 
          ? ((totalVentas - totalCostos) / totalCostos * 100).toFixed(2) 
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proyección de compras
router.get('/proyeccion-compras', auth, async (req, res) => {
  try {
    const diasProyeccion = parseInt(req.query.dias) || 30;
    const diasHistorico = parseInt(req.query.diasHistorico) || 90;

    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - diasHistorico);

    const ventas = await Venta.find({
      fechaVenta: { $gte: fechaInicio }
    });

    const consumoPorProducto = {};

    for (const venta of ventas) {
      for (const item of venta.productos) {
        const productoId = item.producto.toString();
        if (!consumoPorProducto[productoId]) {
          consumoPorProducto[productoId] = 0;
        }
        consumoPorProducto[productoId] += item.cantidad;
      }
    }

    const proyecciones = [];

    for (const [productoId, cantidadVendida] of Object.entries(consumoPorProducto)) {
      const producto = await Producto.findById(productoId);
      if (!producto) continue;

      const consumoDiario = cantidadVendida / diasHistorico;
      const consumoProyectado = Math.ceil(consumoDiario * diasProyeccion);
      const stockFuturo = producto.stock - consumoProyectado;
      const necesidadCompra = stockFuturo < producto.stockMinimo 
        ? Math.ceil(producto.stockMaximo - stockFuturo)
        : 0;

      if (necesidadCompra > 0) {
        proyecciones.push({
          sku: producto.sku,
          nombre: producto.nombre,
          stockActual: producto.stock,
          consumoDiario: consumoDiario.toFixed(2),
          consumoProyectado,
          stockFuturo,
          stockMinimo: producto.stockMinimo,
          stockMaximo: producto.stockMaximo,
          cantidadSugerida: necesidadCompra,
          costoEstimado: necesidadCompra * (producto.costo || 0),
          prioridad: stockFuturo <= 0 ? 'Urgente' : stockFuturo < producto.stockMinimo ? 'Alta' : 'Media'
        });
      }
    }

    proyecciones.sort((a, b) => {
      const prioridades = { 'Urgente': 3, 'Alta': 2, 'Media': 1 };
      return prioridades[b.prioridad] - prioridades[a.prioridad];
    });

    res.json({
      proyecciones,
      total: proyecciones.length,
      inversionEstimada: proyecciones.reduce((sum, p) => sum + p.costoEstimado, 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
