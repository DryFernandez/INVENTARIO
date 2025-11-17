const mongoose = require('mongoose');
require('dotenv').config();

// Importar todos los modelos
const Usuario = require('./Models/Usuario');
const Categoria = require('./Models/Categorias');
const Almacen = require('./Models/Almacen');
const Producto = require('./Models/Producto');
const Proveedor = require('./Models/Proveedor');
const Cliente = require('./Models/Clientes');
const Venta = require('./Models/Venta');
const Compra = require('./Models/Compras');
const ProductoAlmacen = require('./Models/ProductoAlmacen');
const InventarioLog = require('./Models/InventarioLog');
const Traslado = require('./Models/Traslado');

const limpiarBaseDeDatos = async () => {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas\n');

    console.log('🗑️  Iniciando limpieza de la base de datos...\n');

    // Limpiar todas las colecciones en orden (excepto el admin)
    const colecciones = [
      { nombre: 'InventarioLog', modelo: InventarioLog },
      { nombre: 'Traslados', modelo: Traslado },
      { nombre: 'Ventas', modelo: Venta },
      { nombre: 'Compras', modelo: Compra },
      { nombre: 'ProductoAlmacen', modelo: ProductoAlmacen },
      { nombre: 'Productos', modelo: Producto },
      { nombre: 'Clientes', modelo: Cliente },
      { nombre: 'Proveedores', modelo: Proveedor },
      { nombre: 'Almacenes', modelo: Almacen },
      { nombre: 'Categorías', modelo: Categoria }
    ];

    for (const coleccion of colecciones) {
      const resultado = await coleccion.modelo.deleteMany({});
      console.log(`  ✓ ${coleccion.nombre}: ${resultado.deletedCount} documentos eliminados`);
    }

    // Eliminar todos los usuarios EXCEPTO el administrador
    const usuariosEliminados = await Usuario.deleteMany({ rol: { $ne: 'administrador' } });
    console.log(`  ✓ Usuarios: ${usuariosEliminados.deletedCount} documentos eliminados (administrador conservado)`);

    console.log('\n✅ Base de datos limpiada completamente');
    console.log('📝 Usuario administrador conservado');


  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Confirmación de seguridad
console.log('\n⚠️  ¡ADVERTENCIA! Este script eliminará TODOS los datos de la base de datos.');
console.log('Base de datos objetivo:', process.env.MONGODB_URI?.split('@')[1]?.split('?')[0] || 'No especificada');
console.log('\nIniciando limpieza en 3 segundos...\n');

setTimeout(() => {
  limpiarBaseDeDatos();
}, 3000);
