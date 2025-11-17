// Routes/OrdenCompra.js
const express = require('express');
const router = express.Router();
const OrdenCompra = require('../Models/OrdenCompra');
const Compra = require('../Models/Compras');
const Lote = require('../Models/Lote');
const { checkAuth: auth } = require('../Middlewares/auth');

// Obtener todas las órdenes de compra
router.get('/', auth, async (req, res) => {
  try {
    const { estado, proveedor } = req.query;
    const filtros = {};
    
    if (estado) filtros.estado = estado;
    if (proveedor) filtros.proveedor = proveedor;

    const ordenes = await OrdenCompra.find(filtros)
      .populate('proveedor', 'nombre ruc')
      .populate('almacen', 'nombre')
      .populate('productos.producto', 'sku nombre')
      .populate('creadoPor', 'nombre email')
      .sort({ fechaOrden: -1 });
    
    res.json(ordenes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una orden de compra
router.get('/:id', auth, async (req, res) => {
  try {
    const orden = await OrdenCompra.findById(req.params.id)
      .populate('proveedor')
      .populate('almacen')
      .populate('productos.producto')
      .populate('recepciones.recibidoPor', 'nombre')
      .populate('creadoPor', 'nombre');
    
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(orden);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear orden de compra
router.post('/', auth, async (req, res) => {
  try {
    // Generar número de orden
    const ultimaOrden = await OrdenCompra.findOne().sort({ numeroOrden: -1 });
    const numeroOrden = ultimaOrden 
      ? `OC-${String(parseInt(ultimaOrden.numeroOrden.split('-')[1]) + 1).padStart(6, '0')}`
      : 'OC-000001';

    // Calcular cantidades pendientes
    const productos = req.body.productos.map(p => ({
      ...p,
      cantidadPendiente: p.cantidad
    }));

    const orden = new OrdenCompra({
      ...req.body,
      numeroOrden,
      productos,
      creadoPor: req.usuario.id
    });
    
    await orden.save();
    res.status(201).json(orden);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recibir mercancía (recepción parcial o completa)
router.post('/:id/recepciones', auth, async (req, res) => {
  try {
    const orden = await OrdenCompra.findById(req.params.id);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

    const { productos, observaciones } = req.body;
    
    // Agregar recepción
    orden.recepciones.push({
      productos,
      recibidoPor: req.usuario.id,
      observaciones
    });

    // Actualizar cantidades recibidas y pendientes
    productos.forEach(prodRecibido => {
      const prodOrden = orden.productos.find(p => 
        p.producto.toString() === prodRecibido.producto.toString()
      );
      if (prodOrden) {
        prodOrden.cantidadRecibida += prodRecibido.cantidadRecibida;
        prodOrden.cantidadPendiente = prodOrden.cantidad - prodOrden.cantidadRecibida;
      }
    });

    // Actualizar estado
    const todasCompletas = orden.productos.every(p => p.cantidadPendiente === 0);
    const algunaRecibida = orden.productos.some(p => p.cantidadRecibida > 0);
    
    if (todasCompletas) {
      orden.estado = 'completa';
      orden.fechaEntregaReal = new Date();
    } else if (algunaRecibida) {
      orden.estado = 'parcial';
    }

    await orden.save();
    res.json(orden);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convertir orden de compra en compra (cuando está completa)
router.post('/:id/convertir-compra', auth, async (req, res) => {
  try {
    const orden = await OrdenCompra.findById(req.params.id).populate('productos.producto');
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
    
    if (orden.estado !== 'completa') {
      return res.status(400).json({ error: 'La orden debe estar completa para convertirse en compra' });
    }

    // Crear compra
    const compra = new Compra({
      proveedor: orden.proveedor,
      almacen: orden.almacen,
      productos: orden.productos.map(p => ({
        producto: p.producto._id,
        cantidad: p.cantidad,
        precioUnitario: p.precioUnitario,
        subtotal: p.subtotal
      })),
      subtotal: orden.subtotal,
      impuestos: orden.impuestos,
      descuento: orden.descuento,
      total: orden.total,
      creadoPor: req.usuario.id
    });

    await compra.save();
    
    // Actualizar orden
    orden.compraGenerada = compra._id;
    await orden.save();

    res.json({ compra, orden });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar orden de compra
router.put('/:id', auth, async (req, res) => {
  try {
    const orden = await OrdenCompra.findById(req.params.id);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
    
    if (orden.estado !== 'borrador') {
      return res.status(400).json({ error: 'Solo se pueden editar órdenes en borrador' });
    }

    Object.assign(orden, req.body);
    orden.modificadoPor = req.usuario.id;
    await orden.save();
    
    res.json(orden);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancelar orden de compra
router.put('/:id/cancelar', auth, async (req, res) => {
  try {
    const orden = await OrdenCompra.findById(req.params.id);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
    
    orden.estado = 'cancelada';
    orden.modificadoPor = req.usuario.id;
    await orden.save();
    
    res.json(orden);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
