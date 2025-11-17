// Routes/ConteoFisico.js
const express = require('express');
const router = express.Router();
const ConteoFisico = require('../Models/ConteoFisico');
const Producto = require('../Models/Producto');
const ProductoAlmacen = require('../Models/ProductoAlmacen');
const InventarioLog = require('../Models/InventarioLog');
const { checkAuth: auth } = require('../Middlewares/auth');

// Obtener todos los conteos
router.get('/', auth, async (req, res) => {
  try {
    const { estado, almacen, tipo } = req.query;
    const filtros = {};
    
    if (estado) filtros.estado = estado;
    if (almacen) filtros.almacen = almacen;
    if (tipo) filtros.tipo = tipo;

    const conteos = await ConteoFisico.find(filtros)
      .populate('almacen', 'nombre')
      .populate('categoria', 'nombre')
      .populate('creadoPor', 'nombre')
      .sort({ fechaPlanificada: -1 });
    
    res.json(conteos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un conteo
router.get('/:id', auth, async (req, res) => {
  try {
    const conteo = await ConteoFisico.findById(req.params.id)
      .populate('almacen')
      .populate('items.producto')
      .populate('items.contadoPor', 'nombre')
      .populate('items.verificadoPor', 'nombre')
      .populate('responsables.usuario', 'nombre')
      .populate('creadoPor', 'nombre');
    
    if (!conteo) return res.status(404).json({ error: 'Conteo no encontrado' });
    res.json(conteo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear conteo físico
router.post('/', auth, async (req, res) => {
  try {
    // Generar número de conteo
    const ultimoConteo = await ConteoFisico.findOne().sort({ numeroConteo: -1 });
    const numeroConteo = ultimoConteo 
      ? `CF-${String(parseInt(ultimoConteo.numeroConteo.split('-')[1]) + 1).padStart(6, '0')}`
      : 'CF-000001';

    // Obtener productos para el conteo
    const filtroProductos = { almacen: req.body.almacen };
    if (req.body.tipo === 'categoria' && req.body.categoria) {
      filtroProductos.categoria = req.body.categoria;
    }

    const productos = await Producto.find(filtroProductos).select('_id stock costo');
    
    const items = productos.map(p => ({
      producto: p._id,
      stockSistema: p.stock
    }));

    const conteo = new ConteoFisico({
      ...req.body,
      numeroConteo,
      items,
      creadoPor: req.usuario.id
    });
    
    await conteo.save();
    res.status(201).json(conteo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar conteo
router.put('/:id/iniciar', auth, async (req, res) => {
  try {
    const conteo = await ConteoFisico.findById(req.params.id);
    if (!conteo) return res.status(404).json({ error: 'Conteo no encontrado' });
    
    conteo.estado = 'en_proceso';
    conteo.fechaInicio = new Date();
    await conteo.save();
    
    res.json(conteo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar conteo de un ítem
router.put('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const conteo = await ConteoFisico.findById(req.params.id);
    if (!conteo) return res.status(404).json({ error: 'Conteo no encontrado' });
    
    const item = conteo.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Ítem no encontrado' });

    item.stockFisico = req.body.stockFisico;
    item.diferencia = req.body.stockFisico - item.stockSistema;
    item.motivoDiferencia = req.body.motivoDiferencia;
    item.contadoPor = req.usuario.id;
    item.fechaConteo = new Date();
    item.observaciones = req.body.observaciones;

    // Calcular valor de la diferencia
    const producto = await Producto.findById(item.producto);
    if (producto) {
      item.valorDiferencia = item.diferencia * (producto.costo || 0);
    }

    await conteo.save();
    res.json(conteo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Completar conteo
router.put('/:id/completar', auth, async (req, res) => {
  try {
    const conteo = await ConteoFisico.findById(req.params.id);
    if (!conteo) return res.status(404).json({ error: 'Conteo no encontrado' });
    
    // Verificar que todos los ítems estén contados
    const todosContados = conteo.items.every(item => item.stockFisico !== null && item.stockFisico !== undefined);
    if (!todosContados) {
      return res.status(400).json({ error: 'Todos los productos deben ser contados' });
    }

    conteo.estado = 'completado';
    conteo.fechaFin = new Date();
    
    // Calcular totales
    conteo.totalDiferencias = conteo.items.filter(i => i.diferencia !== 0).length;
    conteo.totalValorDiferencias = conteo.items.reduce((sum, i) => sum + (i.valorDiferencia || 0), 0);
    
    await conteo.save();
    res.json(conteo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aplicar ajustes del conteo al inventario
router.post('/:id/ajustar', auth, async (req, res) => {
  try {
    const conteo = await ConteoFisico.findById(req.params.id);
    if (!conteo) return res.status(404).json({ error: 'Conteo no encontrado' });
    
    if (conteo.estado !== 'completado') {
      return res.status(400).json({ error: 'El conteo debe estar completado para ajustar' });
    }

    if (conteo.ajusteRealizado) {
      return res.status(400).json({ error: 'Los ajustes ya fueron aplicados' });
    }

    // Aplicar ajustes
    for (const item of conteo.items) {
      if (item.diferencia !== 0) {
        const producto = await Producto.findById(item.producto);
        if (producto) {
          producto.stock = item.stockFisico;
          await producto.save();

          // Registrar en el log
          await InventarioLog.create({
            producto: item.producto,
            almacen: conteo.almacen,
            tipoMovimiento: item.diferencia > 0 ? 'ajuste_entrada' : 'ajuste_salida',
            cantidad: Math.abs(item.diferencia),
            stockAnterior: item.stockSistema,
            stockNuevo: item.stockFisico,
            motivo: `Ajuste por conteo físico ${conteo.numeroConteo}`,
            usuario: req.usuario.id
          });
        }
      }
    }

    conteo.ajusteRealizado = true;
    conteo.estado = 'ajustado';
    conteo.aprobadoPor = req.usuario.id;
    conteo.fechaAprobacion = new Date();
    await conteo.save();

    res.json(conteo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
