require('dotenv').config();
const mongoose = require('mongoose');
const Producto = require('./Models/Producto');
const ProductoAlmacen = require('./Models/ProductoAlmacen');

async function migrarInventario() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventario');
    console.log('✅ Conectado a MongoDB\n');

    console.log('📦 Obteniendo productos activos...');
    const productos = await Producto.find({ activo: true });
    console.log(`✅ ${productos.length} productos encontrados\n`);

    let creados = 0;
    let existentes = 0;
    let errores = 0;

    console.log('🔄 Migrando inventario...\n');

    for (const producto of productos) {
      try {
        // Verificar si ya existe el registro
        const existe = await ProductoAlmacen.findOne({
          producto: producto._id,
          almacen: producto.almacen
        });

        if (existe) {
          console.log(`⏭️  Ya existe: ${producto.nombre} en almacén ${producto.almacen}`);
          existentes++;
          continue;
        }

        // Crear registro de inventario
        const inventario = await ProductoAlmacen.create({
          producto: producto._id,
          almacen: producto.almacen,
          stock: producto.stock || 0,
          stockMinimo: producto.stockMinimo || 5,
          stockMaximo: null,
          ubicacionFisica: null,
          lote: null,
          activo: true
        });

        console.log(`✅ Creado: ${producto.nombre} - Stock: ${producto.stock} unidades`);
        creados++;

      } catch (error) {
        console.error(`❌ Error con ${producto.nombre}:`, error.message);
        errores++;
      }
    }

    console.log('\n📊 Resumen de migración:');
    console.log(`   ✅ Registros creados: ${creados}`);
    console.log(`   ⏭️  Ya existían: ${existentes}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📦 Total procesados: ${productos.length}\n`);

    console.log('✅ Migración completada\n');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar migración
migrarInventario();
