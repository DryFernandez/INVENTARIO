const express = require('express');
const router = express.Router();
const Venta = require('../Models/Venta');
const Producto = require('../Models/Producto');
const Cliente = require('../Models/Clientes');
const InventarioLog = require('../Models/InventarioLog');
const { validarVenta } = require('../Validators/Venta');
const { checkAuth, checkRol } = require('../Middlewares/auth');
const excelJS = require('exceljs');

// GET /ventas - Obtener todas las ventas con filtros
router.get('/', checkAuth, async (req, res) => {
  try {
    const { 
      limit = 20, 
      page = 1, 
      cliente,
      fechaDesde,
      fechaHasta,
      estado,
      sort = '-fechaCreacion'
    } = req.query;

    // Construir query de filtrado
    const query = {};
    
    if (cliente) query.cliente = cliente;
    if (estado) query.estado = estado;

    // Filtro por rango de fechas
    if (fechaDesde || fechaHasta) {
      query.fechaCreacion = {};
      if (fechaDesde) query.fechaCreacion.$gte = new Date(fechaDesde);
      if (fechaHasta) query.fechaCreacion.$lte = new Date(fechaHasta);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'cliente', select: 'nombre email' },
        { path: 'vendedor', select: 'nombre email' },
        { path: 'productos.producto', select: 'nombre codigo precio' }
      ]
    };

    const ventas = await Venta.paginate(query, options);

    res.status(200).json({
      success: true,
      data: ventas.docs,
      pagination: {
        total: ventas.totalDocs,
        limit: ventas.limit,
        page: ventas.page,
        pages: ventas.totalPages
      }
    });

  } catch (error) {
    console.error('Error en GET /ventas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las ventas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /ventas/:id - Obtener una venta específica
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('cliente', 'nombre email direccion telefono')
      .populate('vendedor', 'nombre email')
      .populate('productos.producto', 'nombre codigo precio imagen');

    if (!venta) {
      return res.status(404).json({
        success: false,
        error: 'Venta no encontrada'
      });
    }

    // Verificar permisos (vendedor solo puede ver sus propias ventas)
    if (req.user.rol !== 'admin' && venta.vendedor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para ver esta venta'
      });
    }

    res.status(200).json({
      success: true,
      data: venta
    });

  } catch (error) {
    console.error(`Error en GET /ventas/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de venta inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener la venta'
    });
  }
});

// POST /ventas - Crear nueva venta
router.post('/', checkAuth, validarVenta, async (req, res) => {
  const session = await Venta.startSession();
  session.startTransaction();

  try {
    const { cliente, productos, metodoPago, notas } = req.body;
    const vendedor = req.user.id;

    // 1. Verificar que el cliente existe
    const clienteExiste = await Cliente.findById(cliente).session(session);
    if (!clienteExiste || !clienteExiste.estado) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: 'Cliente no válido o inactivo'
      });
    }

    // 2. Verificar stock y calcular total
    let total = 0;
    const productosActualizados = [];
    const productosVenta = [];
    
    for (const item of productos) {
      const producto = await Producto.findById(item.producto).session(session);
      
      if (!producto || !producto.estado) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          error: `Producto ${item.producto} no encontrado o inactivo`
        });
      }
      
      if (producto.stock < item.cantidad) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          error: `Stock insuficiente para el producto ${producto.nombre}`,
          producto: producto._id,
          stockDisponible: producto.stock,
          cantidadSolicitada: item.cantidad
        });
      }
      
      // Actualizar stock (en memoria)
      producto.stock -= item.cantidad;
      productosActualizados.push(producto);
      
      // Agregar a productosVenta con precio actual
      productosVenta.push({
        producto: producto._id,
        cantidad: item.cantidad,
        precioUnitario: producto.precio,
        subtotal: producto.precio * item.cantidad
      });
      
      total += producto.precio * item.cantidad;
    }

    // 3. Crear la venta
    const nuevaVenta = new Venta({
      cliente,
      vendedor,
      productos: productosVenta,
      total,
      metodoPago,
      notas,
      estado: 'completada'
    });

    await nuevaVenta.save({ session });

    // 4. Actualizar stock en la base de datos y registrar movimientos
    for (const producto of productosActualizados) {
      await producto.save({ session });
      
      await InventarioLog.create([{
        producto: producto._id,
        cantidad: -producto.cantidadVendida,
        tipo: 'venta',
        referencia: nuevaVenta._id,
        usuario: vendedor,
        stockAnterior: producto.stock + producto.cantidadVendida,
        stockNuevo: producto.stock
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    // 5. Responder con la venta creada
    const ventaCreada = await Venta.findById(nuevaVenta._id)
      .populate('cliente', 'nombre email')
      .populate('vendedor', 'nombre email')
      .populate('productos.producto', 'nombre codigo');

    res.status(201).json({
      success: true,
      data: ventaCreada,
      message: 'Venta registrada exitosamente'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error en POST /ventas:', error);
    
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
      error: 'Error al registrar la venta',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /ventas/reporte/ventas - Generar reporte de ventas
router.get('/reporte/ventas', checkAuth, checkRol(['admin', 'gerente']), async (req, res) => {
  try {
    const { fechaDesde, fechaHasta, formato = 'excel' } = req.query;

    // Construir query de filtrado
    const query = { estado: 'completada' };

    if (fechaDesde || fechaHasta) {
      query.fechaCreacion = {};
      if (fechaDesde) query.fechaCreacion.$gte = new Date(fechaDesde);
      if (fechaHasta) query.fechaCreacion.$lte = new Date(fechaHasta);
    }

    const ventas = await Venta.find(query)
      .populate('cliente', 'nombre email')
      .populate('vendedor', 'nombre email')
      .populate('productos.producto', 'nombre codigo')
      .sort('-fechaCreacion');

    if (formato === 'excel') {
      // Generar reporte en Excel
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reporte de Ventas');

      // Configurar columnas
      worksheet.columns = [
        { header: 'ID Venta', key: 'id', width: 10 },
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Cliente', key: 'cliente', width: 25 },
        { header: 'Vendedor', key: 'vendedor', width: 25 },
        { header: 'Productos', key: 'productos', width: 40 },
        { header: 'Cantidad Total', key: 'cantidad', width: 15 },
        { header: 'Total', key: 'total', width: 15 },
        { header: 'Método de Pago', key: 'metodoPago', width: 20 }
      ];

      // Agregar datos
      ventas.forEach(venta => {
        const productosStr = venta.productos.map(p => 
          `${p.producto.nombre} (${p.cantidad} x $${p.precioUnitario})`
        ).join('\n');

        worksheet.addRow({
          id: venta._id,
          fecha: venta.fechaCreacion.toLocaleDateString(),
          cliente: venta.cliente.nombre,
          vendedor: venta.vendedor.nombre,
          productos: productosStr,
          cantidad: venta.productos.reduce((sum, p) => sum + p.cantidad, 0),
          total: `$${venta.total.toFixed(2)}`,
          metodoPago: venta.metodoPago
        });
      });

      // Estilizar
      worksheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
      });

      // Enviar archivo
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=reporte_ventas.xlsx'
      );

      await workbook.xlsx.write(res);
      res.end();
    } else {
      // Formato JSON
      res.status(200).json({
        success: true,
        data: ventas,
        totalVentas: ventas.length,
        totalIngresos: ventas.reduce((sum, venta) => sum + venta.total, 0),
        periodo: {
          fechaDesde,
          fechaHasta
        }
      });
    }

  } catch (error) {
    console.error('Error en GET /ventas/reporte/ventas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar el reporte de ventas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;