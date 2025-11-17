// Routes/Alerta.js
const express = require('express');
const router = express.Router();
const Alerta = require('../Models/Alerta');
const Producto = require('../Models/Producto');
const Lote = require('../Models/Lote');
const { checkAuth: auth } = require('../Middlewares/auth');

// Obtener alertas
router.get('/', auth, async (req, res) => {
  try {
    const { tipo, prioridad, estado, usuario } = req.query;
    const filtros = {};
    
    if (tipo) filtros.tipo = tipo;
    if (prioridad) filtros.prioridad = prioridad;
    if (estado) filtros.estado = estado;
    if (usuario) filtros['notificadoA.usuario'] = usuario;

    const alertas = await Alerta.find(filtros)
      .populate('producto', 'sku nombre')
      .populate('almacen', 'nombre')
      .populate('lote', 'numeroLote')
      .populate('notificadoA.usuario', 'nombre email')
      .sort({ prioridad: 1, fechaCreacion: -1 });
    
    res.json(alertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener alertas de un usuario
router.get('/usuario/:id', auth, async (req, res) => {
  try {
    const alertas = await Alerta.find({
      'notificadoA.usuario': req.params.id,
      estado: { $in: ['activa', 'leida'] }
    })
      .populate('producto', 'sku nombre')
      .populate('almacen', 'nombre')
      .sort({ prioridad: 1, fechaCreacion: -1 });
    
    res.json(alertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generar alertas automáticas
router.post('/generar-automaticas', auth, async (req, res) => {
  try {
    const alertasCreadas = [];

    // Alerta de stock mínimo
    const productosStockBajo = await Producto.find({
      $expr: { $lte: ['$stock', '$stockMinimo'] },
      activo: true
    });

    for (const producto of productosStockBajo) {
      const alertaExistente = await Alerta.findOne({
        tipo: 'stock_minimo',
        producto: producto._id,
        estado: 'activa'
      });

      if (!alertaExistente) {
        const alerta = await Alerta.create({
          tipo: 'stock_minimo',
          prioridad: producto.stock === 0 ? 'critica' : 'alta',
          titulo: `Stock bajo: ${producto.nombre}`,
          mensaje: `El producto ${producto.sku} tiene ${producto.stock} unidades (mínimo: ${producto.stockMinimo})`,
          producto: producto._id,
          almacen: producto.almacen
        });
        alertasCreadas.push(alerta);
      }
    }

    // Alerta de productos próximos a vencer (15 días)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 15);

    const lotesPorVencer = await Lote.find({
      fechaVencimiento: { $lte: fechaLimite, $gte: new Date() },
      estado: 'activo',
      cantidadDisponible: { $gt: 0 }
    }).populate('producto');

    for (const lote of lotesPorVencer) {
      const alertaExistente = await Alerta.findOne({
        tipo: 'producto_por_vencer',
        lote: lote._id,
        estado: 'activa'
      });

      if (!alertaExistente) {
        const diasRestantes = Math.ceil((lote.fechaVencimiento - new Date()) / (1000 * 60 * 60 * 24));
        const alerta = await Alerta.create({
          tipo: 'producto_por_vencer',
          prioridad: diasRestantes <= 7 ? 'alta' : 'media',
          titulo: `Lote próximo a vencer: ${lote.producto.nombre}`,
          mensaje: `El lote ${lote.numeroLote} vence en ${diasRestantes} días`,
          producto: lote.producto._id,
          almacen: lote.almacen,
          lote: lote._id
        });
        alertasCreadas.push(alerta);
      }
    }

    res.json({ 
      mensaje: 'Alertas generadas',
      cantidad: alertasCreadas.length,
      alertas: alertasCreadas 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marcar alerta como leída
router.put('/:id/leer', auth, async (req, res) => {
  try {
    const alerta = await Alerta.findById(req.params.id);
    if (!alerta) return res.status(404).json({ error: 'Alerta no encontrada' });
    
    const notificacion = alerta.notificadoA.find(n => 
      n.usuario.toString() === req.usuario.id
    );
    
    if (notificacion) {
      notificacion.leido = true;
      notificacion.fechaLectura = new Date();
    }
    
    alerta.estado = 'leida';
    await alerta.save();
    
    res.json(alerta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolver alerta
router.put('/:id/resolver', auth, async (req, res) => {
  try {
    const alerta = await Alerta.findById(req.params.id);
    if (!alerta) return res.status(404).json({ error: 'Alerta no encontrada' });
    
    alerta.estado = 'resuelta';
    alerta.fechaResolucion = new Date();
    alerta.resueltoPor = req.usuario.id;
    alerta.accionTomada = req.body.accionTomada;
    await alerta.save();
    
    res.json(alerta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ignorar alerta
router.put('/:id/ignorar', auth, async (req, res) => {
  try {
    const alerta = await Alerta.findById(req.params.id);
    if (!alerta) return res.status(404).json({ error: 'Alerta no encontrada' });
    
    alerta.estado = 'ignorada';
    await alerta.save();
    
    res.json(alerta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
