// Routes/ReservaStock.js
const express = require('express');
const router = express.Router();
const ReservaStock = require('../Models/ReservaStock');
const Producto = require('../Models/Producto');
const { checkAuth: auth } = require('../Middlewares/auth');

// Obtener todas las reservas
router.get('/', auth, async (req, res) => {
  try {
    const { estado, producto, almacen, tipo } = req.query;
    const filtros = {};
    
    if (estado) filtros.estado = estado;
    if (producto) filtros.producto = producto;
    if (almacen) filtros.almacen = almacen;
    if (tipo) filtros.tipo = tipo;

    const reservas = await ReservaStock.find(filtros)
      .populate('producto', 'sku nombre')
      .populate('almacen', 'nombre')
      .populate('cliente', 'nombre')
      .populate('creadoPor', 'nombre')
      .sort({ fechaReserva: -1 });
    
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener reservas activas por producto
router.get('/producto/:productoId', auth, async (req, res) => {
  try {
    const reservas = await ReservaStock.find({
      producto: req.params.productoId,
      estado: { $in: ['activa', 'parcial'] }
    })
      .populate('almacen', 'nombre')
      .populate('cliente', 'nombre');
    
    const totalReservado = reservas.reduce((sum, r) => sum + r.cantidadDisponible, 0);
    
    res.json({ reservas, totalReservado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear reserva
router.post('/', auth, async (req, res) => {
  try {
    // Generar número de reserva
    const ultimaReserva = await ReservaStock.findOne().sort({ numeroReserva: -1 });
    const numeroReserva = ultimaReserva 
      ? `RES-${String(parseInt(ultimaReserva.numeroReserva.split('-')[1]) + 1).padStart(6, '0')}`
      : 'RES-000001';

    // Verificar disponibilidad
    const producto = await Producto.findById(req.body.producto);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    // Calcular stock reservado actual
    const reservasActivas = await ReservaStock.find({
      producto: req.body.producto,
      almacen: req.body.almacen,
      estado: { $in: ['activa', 'parcial'] }
    });
    const stockReservado = reservasActivas.reduce((sum, r) => sum + r.cantidadDisponible, 0);
    const stockDisponible = producto.stock - stockReservado;

    if (stockDisponible < req.body.cantidad) {
      return res.status(400).json({ 
        error: 'Stock insuficiente',
        stockDisponible,
        stockReservado 
      });
    }

    const reserva = new ReservaStock({
      ...req.body,
      numeroReserva,
      cantidadDisponible: req.body.cantidad,
      creadoPor: req.usuario.id
    });
    
    await reserva.save();
    res.status(201).json(reserva);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Utilizar reserva (parcial o total)
router.post('/:id/utilizar', auth, async (req, res) => {
  try {
    const reserva = await ReservaStock.findById(req.params.id);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    if (reserva.estado !== 'activa' && reserva.estado !== 'parcial') {
      return res.status(400).json({ error: 'La reserva no está activa' });
    }

    const { cantidadUtilizar } = req.body;
    
    if (cantidadUtilizar > reserva.cantidadDisponible) {
      return res.status(400).json({ error: 'Cantidad mayor a la disponible en la reserva' });
    }

    reserva.cantidadUtilizada += cantidadUtilizar;
    reserva.cantidadDisponible -= cantidadUtilizar;

    if (reserva.cantidadDisponible === 0) {
      reserva.estado = 'completada';
    } else {
      reserva.estado = 'parcial';
    }

    await reserva.save();
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancelar reserva
router.put('/:id/cancelar', auth, async (req, res) => {
  try {
    const reserva = await ReservaStock.findById(req.params.id);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });
    
    reserva.estado = 'cancelada';
    reserva.canceladoPor = req.usuario.id;
    reserva.fechaCancelacion = new Date();
    reserva.motivoCancelacion = req.body.motivo;
    await reserva.save();
    
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verificar reservas vencidas
router.post('/verificar-vencidas', auth, async (req, res) => {
  try {
    const reservasVencidas = await ReservaStock.updateMany(
      {
        fechaVencimiento: { $lt: new Date() },
        estado: { $in: ['activa', 'parcial'] }
      },
      {
        $set: { estado: 'vencida' }
      }
    );
    
    res.json({ 
      mensaje: 'Reservas vencidas actualizadas',
      cantidad: reservasVencidas.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
