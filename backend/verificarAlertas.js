// verificarAlertas.js - Script para ejecutar verificación de alertas periódicamente
require('dotenv').config();
const mongoose = require('mongoose');
const Alerta = require('./Models/Alerta');
const Producto = require('./Models/Producto');
const Lote = require('./Models/Lote');
const ReservaStock = require('./Models/ReservaStock');

async function verificarAlertas() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    let alertasCreadas = 0;

    // 1. Verificar stock mínimo
    const productosStockBajo = await Producto.find({
      $expr: { $lte: ['$stock', '$stockMinimo'] },
      activo: true
    });

    for (const producto of productosStockBajo) {
      const alertaExistente = await Alerta.findOne({
        tipo: 'stock_minimo',
        producto: producto._id,
        estado: { $in: ['activa', 'leida'] }
      });

      if (!alertaExistente) {
        await Alerta.create({
          tipo: producto.stock === 0 ? 'stock_agotado' : 'stock_minimo',
          prioridad: producto.stock === 0 ? 'critica' : 'alta',
          titulo: producto.stock === 0 ? `Stock agotado: ${producto.nombre}` : `Stock bajo: ${producto.nombre}`,
          mensaje: `El producto ${producto.sku} tiene ${producto.stock} unidades (mínimo: ${producto.stockMinimo})`,
          producto: producto._id,
          almacen: producto.almacen
        });
        alertasCreadas++;
      }
    }

    // 2. Verificar productos próximos a vencer
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
        estado: { $in: ['activa', 'leida'] }
      });

      if (!alertaExistente) {
        const diasRestantes = Math.ceil((lote.fechaVencimiento - new Date()) / (1000 * 60 * 60 * 24));
        await Alerta.create({
          tipo: 'producto_por_vencer',
          prioridad: diasRestantes <= 7 ? 'alta' : 'media',
          titulo: `Lote próximo a vencer: ${lote.producto.nombre}`,
          mensaje: `El lote ${lote.numeroLote} vence en ${diasRestantes} días (${lote.cantidadDisponible} unidades)`,
          producto: lote.producto._id,
          almacen: lote.almacen,
          lote: lote._id
        });
        alertasCreadas++;
      }
    }

    // 3. Verificar lotes vencidos
    const lotesVencidos = await Lote.find({
      fechaVencimiento: { $lt: new Date() },
      estado: 'activo',
      cantidadDisponible: { $gt: 0 }
    }).populate('producto');

    for (const lote of lotesVencidos) {
      // Actualizar estado del lote
      lote.estado = 'vencido';
      await lote.save();

      const alertaExistente = await Alerta.findOne({
        tipo: 'producto_vencido',
        lote: lote._id,
        estado: { $in: ['activa', 'leida'] }
      });

      if (!alertaExistente) {
        await Alerta.create({
          tipo: 'producto_vencido',
          prioridad: 'critica',
          titulo: `Lote vencido: ${lote.producto.nombre}`,
          mensaje: `El lote ${lote.numeroLote} está vencido y tiene ${lote.cantidadDisponible} unidades`,
          producto: lote.producto._id,
          almacen: lote.almacen,
          lote: lote._id
        });
        alertasCreadas++;
      }
    }

    // 4. Verificar reservas vencidas
    const reservasVencidas = await ReservaStock.updateMany(
      {
        fechaVencimiento: { $lt: new Date() },
        estado: { $in: ['activa', 'parcial'] }
      },
      { $set: { estado: 'vencida' } }
    );

    if (reservasVencidas.modifiedCount > 0) {
      await Alerta.create({
        tipo: 'reserva_vencida',
        prioridad: 'media',
        titulo: 'Reservas de stock vencidas',
        mensaje: `${reservasVencidas.modifiedCount} reservas de stock han vencido y fueron liberadas`
      });
      alertasCreadas++;
    }

    // 5. Verificar productos sin movimiento (90 días)
    const fechaSinMovimiento = new Date();
    fechaSinMovimiento.setDate(fechaSinMovimiento.getDate() - 90);

    console.log(`\n✅ Verificación completada`);
    console.log(`📊 Alertas nuevas creadas: ${alertasCreadas}`);
    console.log(`🔄 Lotes vencidos actualizados: ${lotesVencidos.length}`);
    console.log(`⏰ Reservas vencidas: ${reservasVencidas.modifiedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verificarAlertas();
