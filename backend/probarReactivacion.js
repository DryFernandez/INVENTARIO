/**
 * Script para probar la lógica de reactivación
 * Simula el ciclo: crear -> desactivar -> recrear (debe reactivar)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Categoria = require('./Models/Categorias');
const Almacen = require('./Models/Almacen');
const Cliente = require('./Models/Clientes');
const Proveedor = require('./Models/Proveedor');
const Producto = require('./Models/Producto');

async function probarReactivacion() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // 1. PRUEBA CATEGORÍA
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 PRUEBA: Categoría');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Crear categoría de prueba
    let categoria = await Categoria.create({
      nombre: 'Test Reactivación',
      descripcion: 'Categoría de prueba'
    });
    console.log('✅ Categoría creada:', categoria.nombre);

    // Desactivar
    categoria.activa = false;
    await categoria.save();
    console.log('⚠️  Categoría desactivada');

    // Intentar crear otra con mismo nombre (debe reactivar)
    const existeActiva = await Categoria.findOne({ nombre: 'Test Reactivación', activa: true });
    const existeInactiva = await Categoria.findOne({ nombre: 'Test Reactivación', activa: false });
    
    if (existeActiva) {
      console.log('❌ ERROR: Ya existe categoría activa');
    } else if (existeInactiva) {
      existeInactiva.activa = true;
      await existeInactiva.save();
      console.log('✅ Categoría reactivada exitosamente');
    }

    // Limpiar
    await Categoria.deleteOne({ nombre: 'Test Reactivación' });
    console.log('🗑️  Categoría de prueba eliminada\n');

    // 2. PRUEBA ALMACÉN
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏢 PRUEBA: Almacén');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let almacen = await Almacen.create({
      nombre: 'Almacén Test',
      ubicacion: 'Local',
      capacidad: 1000
    });
    console.log('✅ Almacén creado:', almacen.nombre);

    almacen.activo = false;
    await almacen.save();
    console.log('⚠️  Almacén desactivado');

    const almacenActivo = await Almacen.findOne({ nombre: 'Almacén Test', activo: true });
    const almacenInactivo = await Almacen.findOne({ nombre: 'Almacén Test', activo: false });
    
    if (almacenActivo) {
      console.log('❌ ERROR: Ya existe almacén activo');
    } else if (almacenInactivo) {
      almacenInactivo.activo = true;
      await almacenInactivo.save();
      console.log('✅ Almacén reactivado exitosamente');
    }

    await Almacen.deleteOne({ nombre: 'Almacén Test' });
    console.log('🗑️  Almacén de prueba eliminado\n');

    // 3. PRUEBA CLIENTE
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 PRUEBA: Cliente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let cliente = await Cliente.create({
      nombre: 'Cliente Test',
      ruc: '12345678901',
      email: 'test@cliente.com',
      telefono: '999999999'
    });
    console.log('✅ Cliente creado:', cliente.nombre);

    cliente.activo = false;
    await cliente.save();
    console.log('⚠️  Cliente desactivado');

    const clienteActivo = await Cliente.findOne({ ruc: '12345678901', activo: true });
    const clienteInactivo = await Cliente.findOne({ ruc: '12345678901', activo: false });
    
    if (clienteActivo) {
      console.log('❌ ERROR: Ya existe cliente activo');
    } else if (clienteInactivo) {
      clienteInactivo.activo = true;
      await clienteInactivo.save();
      console.log('✅ Cliente reactivado exitosamente');
    }

    await Cliente.deleteOne({ ruc: '12345678901' });
    console.log('🗑️  Cliente de prueba eliminado\n');

    // 4. PRUEBA PROVEEDOR
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏭 PRUEBA: Proveedor');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let proveedor = await Proveedor.create({
      nombre: 'Proveedor Test',
      ruc: '10987654321',
      contactoPrincipal: {
        nombre: 'Juan Pérez',
        telefono: '888888888',
        email: 'test@proveedor.com'
      }
    });
    console.log('✅ Proveedor creado:', proveedor.nombre);

    proveedor.activo = false;
    await proveedor.save();
    console.log('⚠️  Proveedor desactivado');

    const proveedorActivo = await Proveedor.findOne({ ruc: '10987654321', activo: true });
    const proveedorInactivo = await Proveedor.findOne({ ruc: '10987654321', activo: false });
    
    if (proveedorActivo) {
      console.log('❌ ERROR: Ya existe proveedor activo');
    } else if (proveedorInactivo) {
      proveedorInactivo.activo = true;
      await proveedorInactivo.save();
      console.log('✅ Proveedor reactivado exitosamente');
    }

    await Proveedor.deleteOne({ ruc: '10987654321' });
    console.log('🗑️  Proveedor de prueba eliminado\n');

    // 5. PRUEBA PRODUCTO
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 PRUEBA: Producto');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Necesitamos una categoría y almacén para el producto
    const categoriaTemp = await Categoria.findOne({ activa: true });
    const almacenTemp = await Almacen.findOne({ activo: true });
    
    if (!categoriaTemp || !almacenTemp) {
      console.log('⚠️  No hay categorías o almacenes activos, saltando prueba de producto');
    } else {
      let producto = await Producto.create({
        nombre: 'Producto Test',
        sku: 'TEST-0001',
        categoria: categoriaTemp._id,
        almacen: almacenTemp._id,
        precio: 100
      });
      console.log('✅ Producto creado:', producto.nombre);

      producto.activo = false;
      await producto.save();
      console.log('⚠️  Producto desactivado');

      const productoActivo = await Producto.findOne({ sku: 'TEST-0001', activo: true });
      const productoInactivo = await Producto.findOne({ sku: 'TEST-0001', activo: false });
      
      if (productoActivo) {
        console.log('❌ ERROR: Ya existe producto activo');
      } else if (productoInactivo) {
        productoInactivo.activo = true;
        await productoInactivo.save();
        console.log('✅ Producto reactivado exitosamente');
      }

      await Producto.deleteOne({ sku: 'TEST-0001' });
      console.log('🗑️  Producto de prueba eliminado\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TODAS LAS PRUEBAS COMPLETADAS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

probarReactivacion();
