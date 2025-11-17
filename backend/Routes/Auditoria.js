// Routes/Auditoria.js
const express = require('express');
const router = express.Router();
const Auditoria = require('../Models/Auditoria');
const { checkAuth: auth } = require('../Middlewares/auth');

// Obtener registros de auditoría
router.get('/', auth, async (req, res) => {
  try {
    const { usuario, modulo, accion, fechaInicio, fechaFin, limit = 100 } = req.query;
    const filtros = {};
    
    if (usuario) filtros.usuario = usuario;
    if (modulo) filtros.modulo = modulo;
    if (accion) filtros.accion = accion;
    
    if (fechaInicio || fechaFin) {
      filtros.fechaHora = {};
      if (fechaInicio) filtros.fechaHora.$gte = new Date(fechaInicio);
      if (fechaFin) filtros.fechaHora.$lte = new Date(fechaFin);
    }

    const auditorias = await Auditoria.find(filtros)
      .populate('usuario', 'nombre email')
      .sort({ fechaHora: -1 })
      .limit(parseInt(limit));
    
    res.json(auditorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener auditoría de una entidad específica
router.get('/entidad/:tipo/:id', auth, async (req, res) => {
  try {
    const auditorias = await Auditoria.find({
      entidadTipo: req.params.tipo,
      entidad: req.params.id
    })
      .populate('usuario', 'nombre email')
      .sort({ fechaHora: -1 });
    
    res.json(auditorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener actividad de un usuario
router.get('/usuario/:id', auth, async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const filtros = { usuario: req.params.id };
    
    if (fechaInicio || fechaFin) {
      filtros.fechaHora = {};
      if (fechaInicio) filtros.fechaHora.$gte = new Date(fechaInicio);
      if (fechaFin) filtros.fechaHora.$lte = new Date(fechaFin);
    }

    const auditorias = await Auditoria.find(filtros)
      .sort({ fechaHora: -1 })
      .limit(100);
    
    res.json(auditorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Estadísticas de auditoría
router.get('/estadisticas', auth, async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const filtroFecha = {};
    
    if (fechaInicio) filtroFecha.$gte = new Date(fechaInicio);
    if (fechaFin) filtroFecha.$lte = new Date(fechaFin);
    
    const matchStage = Object.keys(filtroFecha).length > 0 
      ? { fechaHora: filtroFecha } 
      : {};

    const stats = await Auditoria.aggregate([
      { $match: matchStage },
      {
        $facet: {
          porModulo: [
            { $group: { _id: '$modulo', total: { $sum: 1 } } },
            { $sort: { total: -1 } }
          ],
          porAccion: [
            { $group: { _id: '$accion', total: { $sum: 1 } } },
            { $sort: { total: -1 } }
          ],
          porUsuario: [
            { $group: { _id: '$usuario', total: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 10 }
          ],
          total: [
            { $count: 'cantidad' }
          ]
        }
      }
    ]);
    
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
