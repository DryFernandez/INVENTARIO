require('dotenv').config();
const mongoose = require('mongoose');

// Importar modelos
const Usuario = require('./Models/Usuario');
const Categoria = require('./Models/Categorias');
const Almacen = require('./Models/Almacen');
const Proveedor = require('./Models/Proveedor');
const Producto = require('./Models/Producto');
const Cliente = require('./Models/Clientes');

// Datos de ejemplo
const datosIniciales = {
  categorias: [
    { nombre: 'Electrónica', descripcion: 'Productos electrónicos' },
    { nombre: 'Accesorios', descripcion: 'Accesorios diversos' },
    { nombre: 'Oficina', descripcion: 'Artículos de oficina' },
    { nombre: 'Hogar', descripcion: 'Productos para el hogar' }
  ],

  almacenes: [
    {
      nombre: 'Almacén Principal',
      ubicacion: 'Av. Principal 123',
      capacidadMaxima: 1000,
      activo: true
    },
    {
      nombre: 'Almacén Secundario',
      ubicacion: 'Calle Secundaria 456',
      capacidadMaxima: 500,
      activo: true
    }
  ],

  proveedores: [
    {
      nombre: 'TechSupply SA',
      contacto: 'Carlos López - 555-1001 - carlos@techsupply.com',
      direccion: 'Zona Industrial 789',
      ruc: 'TSA123456ABC',
      activo: true
    },
    {
      nombre: 'Office Solutions',
      contacto: 'Ana Martínez - 555-1002 - ana@officesolutions.com',
      direccion: 'Centro Comercial 321',
      ruc: 'OSO789012DEF',
      activo: true
    }
  ],

  clientes: [
    {
      nombre: 'Cliente General',
      contacto: 'general@clientes.com - 555-0000',
      direccion: 'N/A',
      activo: true
    }
  ]
};

async function poblarBaseDeDatos() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventario');
    console.log('✅ Conectado a MongoDB');

    // Limpiar colecciones existentes (CUIDADO: esto borra todo)
    console.log('\n🗑️  Limpiando base de datos...');
    await Usuario.deleteMany({});
    await Categoria.deleteMany({});
    await Almacen.deleteMany({});
    await Proveedor.deleteMany({});
    await Producto.deleteMany({});
    await Cliente.deleteMany({});
    console.log('✅ Base de datos limpiada');

    // Insertar Categorías
    console.log('\n📁 Insertando categorías...');
    const categorias = await Categoria.insertMany(datosIniciales.categorias);
    console.log(`✅ ${categorias.length} categorías insertadas`);

    // Insertar Almacenes
    console.log('\n🏭 Insertando almacenes...');
    const almacenes = await Almacen.insertMany(datosIniciales.almacenes);
    console.log(`✅ ${almacenes.length} almacenes insertados`);

    // Insertar Proveedores
    console.log('\n🤝 Insertando proveedores...');
    const proveedores = await Proveedor.insertMany(datosIniciales.proveedores);
    console.log(`✅ ${proveedores.length} proveedores insertados`);

    // Insertar Clientes
    console.log('\n👥 Insertando clientes...');
    const clientes = await Cliente.insertMany(datosIniciales.clientes);
    console.log(`✅ ${clientes.length} clientes insertados`);

    // Insertar Productos de ejemplo
    console.log('\n📦 Insertando productos...');
    const productos = [
      {
        sku: 'ELEC001',
        nombre: 'Laptop Dell XPS 15',
        descripcion: 'Laptop de alto rendimiento',
        categoria: categorias[0]._id,
        precio: 1200,
        stock: 15,
        stockMinimo: 5,
        almacen: almacenes[0]._id,
        proveedor: proveedores[0]._id,
        activo: true
      },
      {
        sku: 'ACC001',
        nombre: 'Mouse Logitech MX',
        descripcion: 'Mouse inalámbrico ergonómico',
        categoria: categorias[1]._id,
        precio: 45,
        stock: 30,
        stockMinimo: 10,
        almacen: almacenes[0]._id,
        proveedor: proveedores[0]._id,
        activo: true
      },
      {
        sku: 'ACC002',
        nombre: 'Teclado Mecánico',
        descripcion: 'Teclado mecánico RGB',
        categoria: categorias[1]._id,
        precio: 89,
        stock: 8,
        stockMinimo: 5,
        almacen: almacenes[0]._id,
        proveedor: proveedores[0]._id,
        activo: true
      },
      {
        sku: 'ELEC002',
        nombre: 'Monitor Samsung 27"',
        descripcion: 'Monitor Full HD',
        categoria: categorias[0]._id,
        precio: 350,
        stock: 12,
        stockMinimo: 5,
        almacen: almacenes[1]._id,
        proveedor: proveedores[0]._id,
        activo: true
      },
      {
        sku: 'OFIC001',
        nombre: 'Silla Ergonómica',
        descripcion: 'Silla de oficina con soporte lumbar',
        categoria: categorias[2]._id,
        precio: 250,
        stock: 20,
        stockMinimo: 8,
        almacen: almacenes[1]._id,
        proveedor: proveedores[1]._id,
        activo: true
      }
    ];

    const productosInsertados = await Producto.insertMany(productos);
    console.log(`✅ ${productosInsertados.length} productos insertados`);

    // Resumen
    console.log('\n' + '='.repeat(50));
    console.log('🎉 BASE DE DATOS POBLADA EXITOSAMENTE');
    console.log('='.repeat(50));
    console.log(`📁 Categorías: ${categorias.length}`);
    console.log(`🏭 Almacenes: ${almacenes.length}`);
    console.log(`🤝 Proveedores: ${proveedores.length}`);
    console.log(`👥 Clientes: ${clientes.length}`);
    console.log(`📦 Productos: ${productosInsertados.length}`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
    process.exit();
  }
}

// Ejecutar
poblarBaseDeDatos();
