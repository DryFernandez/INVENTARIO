// Routes/Cotizacion.js
const express = require('express');
const router = express.Router();
const Cotizacion = require('../Models/Cotizacion');
const Venta = require('../Models/Venta');
const { checkAuth: auth } = require('../Middlewares/auth');

// Obtener todas las cotizaciones
router.get('/', auth, async (req, res) => {
  try {
    console.log('📋 GET /cotizaciones - Usuario:', req.usuario?.id);
    const { estado, cliente } = req.query;
    const filtros = {};
    
    if (estado) filtros.estado = estado;
    if (cliente) filtros.cliente = cliente;

    console.log('🔍 Filtros aplicados:', filtros);

    const cotizaciones = await Cotizacion.find(filtros)
      .populate('cliente', 'nombre ruc email')
      .populate('productos.producto', 'sku nombre')
      .populate('creadoPor', 'nombre')
      .sort({ fechaCotizacion: -1 });
    
    console.log('✅ Cotizaciones encontradas:', cotizaciones.length);
    console.log('📋 Primera cotización (si existe):', cotizaciones[0] ? {
      id: cotizaciones[0]._id,
      numero: cotizaciones[0].numeroCotizacion,
      cliente: cotizaciones[0].cliente?.nombre,
      total: cotizaciones[0].total
    } : 'No hay cotizaciones');
    
    res.json(cotizaciones);
  } catch (error) {
    console.error('❌ Error en GET /cotizaciones:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener cotizaciones vencidas
router.get('/vencidas', auth, async (req, res) => {
  try {
    const cotizaciones = await Cotizacion.find({
      fechaVencimiento: { $lt: new Date() },
      estado: { $in: ['enviada', 'borrador'] }
    })
      .populate('cliente', 'nombre')
      .sort({ fechaVencimiento: 1 });
    
    // Actualizar estado a vencidas
    for (const cot of cotizaciones) {
      cot.estado = 'vencida';
      await cot.save();
    }
    
    res.json(cotizaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una cotización
router.get('/:id', auth, async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id)
      .populate('cliente')
      .populate('productos.producto')
      .populate('productos.variante')
      .populate('creadoPor', 'nombre')
      .populate('aprobadaPor', 'nombre');
    
    if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' });
    res.json(cotizacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear cotización
router.post('/', auth, async (req, res) => {
  try {
    console.log('📝 Datos recibidos para crear cotización:', JSON.stringify(req.body, null, 2));
    
    // Validar campos obligatorios mínimos
    if (!req.body.cliente) {
      return res.status(400).json({ error: 'El cliente es requerido' });
    }

    // Generar número de cotización
    const ultimaCotizacion = await Cotizacion.findOne().sort({ numeroCotizacion: -1 });
    const numeroCotizacion = ultimaCotizacion 
      ? `COT-${String(parseInt(ultimaCotizacion.numeroCotizacion.split('-')[1]) + 1).padStart(6, '0')}`
      : 'COT-000001';

    // Calcular fecha de vencimiento
    const validezDias = req.body.validezDias || 15;
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + validezDias);

    // Preparar datos de la cotización con valores por defecto
    const datoscotizacion = {
      numeroCotizacion,
      cliente: req.body.cliente,
      productos: req.body.productos || [], // Array vacío si no hay productos
      subtotal: req.body.subtotal || 0,
      impuestos: req.body.impuestos || 0,
      descuentoGlobal: req.body.descuentoGlobal || 0,
      total: req.body.total || 0,
      fechaVencimiento,
      validezDias,
      condicionesPago: req.body.condicionesPago || '',
      tiempoEntrega: req.body.tiempoEntrega || '',
      observaciones: req.body.observaciones || '',
      estado: 'borrador',
      creadoPor: req.usuario.id
    };

    const cotizacion = new Cotizacion(datoscotizacion);
    await cotizacion.save();
    
    console.log('✅ Cotización creada exitosamente:', cotizacion.numeroCotizacion);
    res.status(201).json(cotizacion);
  } catch (error) {
    console.error('❌ Error creando cotización:', error);
    res.status(500).json({ error: error.message });
  }
});

// Aprobar cotización
router.put('/:id/aprobar', auth, async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id);
    if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' });
    
    cotizacion.estado = 'aprobada';
    cotizacion.aprobadaPor = req.usuario.id;
    cotizacion.fechaAprobacion = new Date();
    await cotizacion.save();
    
    res.json(cotizacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convertir cotización en venta
router.post('/:id/convertir-venta', auth, async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id).populate('productos.producto');
    if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' });
    
    if (cotizacion.estado === 'convertida') {
      return res.status(400).json({ error: 'Esta cotización ya fue convertida en venta' });
    }

    if (cotizacion.estado === 'vencida') {
      return res.status(400).json({ error: 'No se puede convertir una cotización vencida' });
    }

    // Crear venta basada en la cotización
    const venta = new Venta({
      cliente: cotizacion.cliente,
      productos: cotizacion.productos.map(p => ({
        producto: p.producto._id,
        variante: p.variante,
        cantidad: p.cantidad,
        precioUnitario: p.precioUnitario,
        descuento: p.descuento,
        subtotal: p.subtotal
      })),
      subtotal: cotizacion.subtotal,
      impuestos: cotizacion.impuestos,
      descuento: cotizacion.descuentoGlobal,
      total: cotizacion.total,
      metodoPago: req.body.metodoPago || 'efectivo',
      creadoPor: req.usuario.id
    });

    await venta.save();
    
    // Actualizar cotización
    cotizacion.estado = 'convertida';
    cotizacion.ventaGenerada = venta._id;
    await cotizacion.save();

    res.json({ venta, cotizacion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar cotización
router.put('/:id', auth, async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id);
    if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' });
    
    if (cotizacion.estado === 'convertida') {
      return res.status(400).json({ error: 'No se puede editar una cotización ya convertida' });
    }

    Object.assign(cotizacion, req.body);
    await cotizacion.save();
    
    res.json(cotizacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rechazar cotización
router.put('/:id/rechazar', auth, async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id);
    if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' });
    
    cotizacion.estado = 'rechazada';
    cotizacion.observaciones = req.body.motivo || cotizacion.observaciones;
    await cotizacion.save();
    
    res.json(cotizacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
