require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./Models/Usuario');
const Categoria = require('./Models/Categorias');

async function crearAdminYCategorias() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas\n');

    // Crear usuario administrador
    console.log('👤 Creando usuario administrador...');
    
    // Verificar si ya existe
    const adminExistente = await Usuario.findOne({ email: 'admin@gmail.com' });
    
    if (adminExistente) {
      console.log('⚠️  El usuario admin@gmail.com ya existe');
    } else {
      const admin = new Usuario({
        email: 'admin@gmail.com',
        password: 'admin', // Se hasheará automáticamente por el middleware pre-save
        rol: 'admin',
        nombre: 'Administrador',
        activo: true
      });
      
      await admin.save();
      console.log('✅ Usuario administrador creado exitosamente');
      console.log('   Email: admin@gmail.com');
      console.log('   Contraseña: admin');
      console.log('   Rol: admin\n');
    }

    // Agregar más categorías
    console.log('📁 Agregando categorías...');
    
    const categoriasExistentes = await Categoria.countDocuments();
    console.log(`   Categorías existentes: ${categoriasExistentes}`);

    const nuevasCategorias = [
      { nombre: 'Electrónica', descripcion: 'Productos electrónicos y tecnología', activo: true },
      { nombre: 'Accesorios', descripcion: 'Accesorios diversos', activo: true },
      { nombre: 'Oficina', descripcion: 'Artículos de oficina', activo: true },
      { nombre: 'Hogar', descripcion: 'Productos para el hogar', activo: true },
      { nombre: 'Herramientas', descripcion: 'Herramientas y equipos', activo: true },
      { nombre: 'Deportes', descripcion: 'Artículos deportivos', activo: true },
      { nombre: 'Alimentos', descripcion: 'Productos alimenticios', activo: true },
      { nombre: 'Ropa', descripcion: 'Prendas de vestir', activo: true }
    ];

    let agregadas = 0;
    for (const cat of nuevasCategorias) {
      const existe = await Categoria.findOne({ nombre: cat.nombre });
      if (!existe) {
        await Categoria.create(cat);
        console.log(`   ✓ ${cat.nombre}`);
        agregadas++;
      }
    }

    console.log(`\n✅ ${agregadas} categorías nuevas agregadas`);
    console.log(`📊 Total de categorías: ${await Categoria.countDocuments()}\n`);

    // Resumen final
    console.log('='.repeat(50));
    console.log('🎉 CONFIGURACIÓN COMPLETADA');
    console.log('='.repeat(50));
    console.log('👤 Usuarios:', await Usuario.countDocuments());
    console.log('📁 Categorías:', await Categoria.countDocuments());
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
    process.exit();
  }
}

crearAdminYCategorias();
