const express = require('express');
const router = express.Router();
const Cliente = require('../Models/Clientes');
const { validarCliente } = require('../Validators/Clientes');

// GET / - Obtener todos los clientes activos
router.get('/', async (req, res) => {
  try {
    const { search = '' } = req.query;

    // Construir query de búsqueda
    const query = {
      activo: true
    };

    if (search) {
      query.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { ruc: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { telefono: { $regex: search, $options: 'i' } }
      ];
    }

    const clientes = await Cliente.find(query).sort({ nombre: 1 });

    res.status(200).json(clientes);

  } catch (error) {
    console.error('Error en GET /clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los clientes'
    });
  }
});

// GET /:id - Obtener un cliente específico por ID
router.get('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      _id: req.params.id,
      activo: true
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: cliente
    });

  } catch (error) {
    console.error(`Error en GET /clientes/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de cliente inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener el cliente',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST / - Crear nuevo cliente
router.post('/', validarCliente, async (req, res) => {
  try {
    const { ruc, dni } = req.body;
    
    // Verificar si existe un cliente activo con el mismo RUC o DNI
    const identificador = ruc || dni;
    if (identificador) {
      const clienteActivo = await Cliente.findOne({
        $or: [{ ruc: identificador }, { dni: identificador }],
        activo: true
      });
      
      if (clienteActivo) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un cliente activo con ese RUC/DNI'
        });
      }

      // Si existe un cliente inactivo con el mismo RUC/DNI, reactivarlo
      const clienteInactivo = await Cliente.findOne({
        $or: [{ ruc: identificador }, { dni: identificador }],
        activo: false
      });

      if (clienteInactivo) {
        // Actualizar datos del cliente inactivo
        Object.assign(clienteInactivo, req.body);
        clienteInactivo.activo = true;
        await clienteInactivo.save();

        return res.status(201).json({
          success: true,
          data: clienteInactivo,
          message: 'Cliente reactivado exitosamente'
        });
      }
    }

    const nuevoCliente = await Cliente.create(req.body);

    res.status(201).json({
      success: true,
      data: nuevoCliente,
      message: 'Cliente creado exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /clientes:', error);
    
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
      error: 'Error al crear el cliente',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /:id - Actualizar cliente existente
router.put('/:id', validarCliente, async (req, res) => {
  try {
    const clienteActualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!clienteActualizado || !clienteActualizado.activo) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: clienteActualizado,
      message: 'Cliente actualizado exitosamente'
    });

  } catch (error) {
    console.error(`Error en PUT /clientes/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de cliente inválido'
      });
    }
    
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
      error: 'Error al actualizar el cliente',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /:id - Desactivar cliente (borrado lógico)
router.delete('/:id', async (req, res) => {
  try {
    const clienteDesactivado = await Cliente.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!clienteDesactivado) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: clienteDesactivado,
      message: 'Cliente desactivado exitosamente'
    });

  } catch (error) {
    console.error(`Error en DELETE /clientes/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de cliente inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al desactivar el cliente',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /:id/historial - Obtener historial de compras del cliente
router.get('/:id/historial', async (req, res) => {
  try {
    const Venta = require('../Models/Venta');
    const Cotizacion = require('../Models/Cotizacion');
    
    const { limite = 20, tipo = 'all' } = req.query;

    // Verificar que el cliente existe
    const cliente = await Cliente.findOne({
      _id: req.params.id,
      activo: true
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    let historial = {};

    // Obtener ventas
    if (tipo === 'all' || tipo === 'ventas') {
      const ventas = await Venta.find({ cliente: req.params.id })
        .populate('productos.producto', 'nombre sku precio')
        .populate('almacen', 'nombre')
        .sort({ fechaVenta: -1 })
        .limit(parseInt(limite));
      
      historial.ventas = ventas;
      
      // Calcular estadísticas de ventas
      const totalVentas = await Venta.countDocuments({ cliente: req.params.id });
      const montoTotal = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
      const ultimaCompra = ventas.length > 0 ? ventas[0].fechaVenta : null;
      
      historial.estadisticasVentas = {
        totalVentas,
        montoTotal,
        ultimaCompra,
        promedioCompra: totalVentas > 0 ? montoTotal / totalVentas : 0
      };
    }

    // Obtener cotizaciones
    if (tipo === 'all' || tipo === 'cotizaciones') {
      const cotizaciones = await Cotizacion.find({ cliente: req.params.id })
        .populate('productos.producto', 'nombre sku precio')
        .sort({ fechaCotizacion: -1 })
        .limit(parseInt(limite));
      
      historial.cotizaciones = cotizaciones;
      
      historial.estadisticasCotizaciones = {
        total: await Cotizacion.countDocuments({ cliente: req.params.id }),
        aprobadas: await Cotizacion.countDocuments({ cliente: req.params.id, estado: 'aprobada' }),
        pendientes: await Cotizacion.countDocuments({ cliente: req.params.id, estado: 'pendiente' }),
        rechazadas: await Cotizacion.countDocuments({ cliente: req.params.id, estado: 'rechazada' })
      };
    }

    res.status(200).json({
      success: true,
      data: historial
    });

  } catch (error) {
    console.error(`Error en GET /clientes/${req.params.id}/historial:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de cliente inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener historial del cliente',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /:id/estadisticas - Obtener estadísticas detalladas del cliente
router.get('/:id/estadisticas', async (req, res) => {
  try {
    const Venta = require('../Models/Venta');
    const Cotizacion = require('../Models/Cotizacion');
    
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente || !cliente.activo) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    // Estadísticas de ventas
    const ventas = await Venta.find({ cliente: req.params.id });
    const totalVentas = ventas.length;
    const montoTotal = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
    
    // Productos más comprados
    const productosFrecuentes = {};
    ventas.forEach(venta => {
      venta.productos.forEach(item => {
        const prodId = item.producto.toString();
        if (!productosFrecuentes[prodId]) {
          productosFrecuentes[prodId] = {
            producto: prodId,
            cantidad: 0,
            veces: 0
          };
        }
        productosFrecuentes[prodId].cantidad += item.cantidad;
        productosFrecuentes[prodId].veces += 1;
      });
    });

    const topProductos = Object.values(productosFrecuentes)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    // Estadísticas por mes (últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
    
    const ventasPorMes = await Venta.aggregate([
      {
        $match: {
          cliente: cliente._id,
          fechaVenta: { $gte: seisMesesAtras }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$fechaVenta' },
            month: { $month: '$fechaVenta' }
          },
          total: { $sum: '$total' },
          cantidad: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalVentas,
        montoTotal,
        promedioCompra: totalVentas > 0 ? montoTotal / totalVentas : 0,
        ultimaCompra: ventas.length > 0 ? ventas[ventas.length - 1].fechaVenta : null,
        topProductos,
        ventasPorMes,
        antiguedadDias: Math.floor((Date.now() - cliente.fechaRegistro) / (1000 * 60 * 60 * 24))
      }
    });

  } catch (error) {
    console.error(`Error en GET /clientes/${req.params.id}/estadisticas:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas del cliente'
    });
  }
});

module.exports = router;