require('dotenv').config();
const mongoose = require('mongoose');

// Importar modelos
const Usuario = require('./Models/Usuario');
const Categoria = require('./Models/Categorias');
const Almacen = require('./Models/Almacen');
const Proveedor = require('./Models/Proveedor');
const Producto = require('./Models/Producto');
const Cliente = require('./Models/Clientes');
const Venta = require('./Models/Venta');
const Compra = require('./Models/Compras');

async function contarDocumentos() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas\n');

    // Contar documentos en cada colección
    const usuarios = await Usuario.countDocuments();
    const categorias = await Categoria.countDocuments();
    const almacenes = await Almacen.countDocuments();
    const proveedores = await Proveedor.countDocuments();
    const productos = await Producto.countDocuments();
    const clientes = await Cliente.countDocuments();
    const ventas = await Venta.countDocuments();
    const compras = await Compra.countDocuments();

    // Mostrar resultados
    console.log('📊 CONTEO DE DOCUMENTOS EN LA BASE DE DATOS');
    console.log('='.repeat(50));
    console.log(`👤 Usuarios:     ${usuarios}`);
    console.log(`📁 Categorías:   ${categorias}`);
    console.log(`🏭 Almacenes:    ${almacenes}`);
    console.log(`🤝 Proveedores:  ${proveedores}`);
    console.log(`📦 Productos:    ${productos}`);
    console.log(`👥 Clientes:     ${clientes}`);
    console.log(`💰 Ventas:       ${ventas}`);
    console.log(`🛒 Compras:      ${compras}`);
    console.log('='.repeat(50));
    console.log(`📈 Total:        ${usuarios + categorias + almacenes + proveedores + productos + clientes + ventas + compras} documentos\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
    process.exit();
  }
}

contarDocumentos();
