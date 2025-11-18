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

// Función para generar número de conteo automático
const generarNumeroConteo = async () => {
  const fecha = new Date();
  const year = fecha.getFullYear().toString().slice(-2);
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const prefijo = `CF${year}${month}`;
  
  // Contar conteos del mes actual
  const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
  
  const count = await ConteoFisico.countDocuments({
    createdAt: { $gte: inicioMes, $lte: finMes }
  });
  
  const numero = String(count + 1).padStart(3, '0');
  return `${prefijo}-${numero}`;
};

// Middleware para limpiar campos vacíos
const limpiarCamposVacios = (req, res, next) => {
  const camposOpcionales = ['categoria', 'observaciones'];
  
  // Eliminar campos opcionales que estén vacíos
  camposOpcionales.forEach(campo => {
    if (req.body[campo] === '' || req.body[campo] === null || req.body[campo] === undefined) {
      delete req.body[campo];
    }
  });
  
  next();
};

// Crear conteo físico
router.post('/', auth, limpiarCamposVacios, async (req, res) => {
  try {
    // Validar que si el tipo es 'categoria', se proporcione la categoría
    if (req.body.tipo === 'categoria' && !req.body.categoria) {
      return res.status(400).json({
        success: false,
        error: 'Para un conteo por categoría, debe especificar la categoría'
      });
    }

    // Generar número de conteo
    const numeroConteo = await generarNumeroConteo();

    // Obtener productos para el conteo según el tipo
    let filtroProductos = { activo: true };
    
    if (req.body.tipo === 'categoria' && req.body.categoria) {
      filtroProductos.categoria = req.body.categoria;
    }

    // Si se especifica almacén, filtrar por productos en ese almacén
    if (req.body.almacen) {
      const productosEnAlmacen = await ProductoAlmacen.find({ 
        almacen: req.body.almacen,
        activo: true 
      }).select('producto stock');
      
      const productosIds = productosEnAlmacen.map(pa => pa.producto);
      filtroProductos._id = { $in: productosIds };
    }

    const productos = await Producto.find(filtroProductos)
      .select('_id nombre sku costo categoria')
      .populate('categoria', 'nombre');
    
    if (productos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se encontraron productos para el conteo con los filtros especificados'
      });
    }

    // Crear items del conteo con stock del almacén específico
    const items = [];
    for (const producto of productos) {
      let stockSistema = 0;
      
      if (req.body.almacen) {
        const productoAlmacen = await ProductoAlmacen.findOne({
          producto: producto._id,
          almacen: req.body.almacen
        });
        stockSistema = productoAlmacen ? productoAlmacen.stock : 0;
      } else {
        stockSistema = producto.stock || 0;
      }
      
      items.push({
        producto: producto._id,
        stockSistema: stockSistema
      });
    }

    const conteo = new ConteoFisico({
      ...req.body,
      numeroConteo,
      items,
      creadoPor: req.usuario.id
    });
    
    await conteo.save();
    
    // Poblar referencias para la respuesta
    await conteo.populate([
      { path: 'almacen', select: 'nombre' },
      { path: 'categoria', select: 'nombre' },
      { path: 'creadoPor', select: 'nombre' }
    ]);
    
    console.log(`✅ Conteo físico ${numeroConteo} creado con ${items.length} productos`);
    
    res.status(201).json({
      success: true,
      data: conteo,
      message: 'Conteo físico planificado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error creando conteo físico:', error);
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
      error: error.message || 'Error al crear el conteo físico'
    });
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
