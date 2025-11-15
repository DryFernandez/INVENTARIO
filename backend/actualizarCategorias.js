require('dotenv').config();
const mongoose = require('mongoose');
const Categoria = require('./Models/Categorias');

async function actualizarCategorias() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas\n');

    // Actualizar todas las categorías que tienen "activo" a "activa"
    const categorias = await Categoria.find({});
    
    console.log(`📁 Actualizando ${categorias.length} categorías...\n`);
    
    for (const cat of categorias) {
      // Si no tiene el campo activa, lo agregamos
      if (cat.activa === undefined) {
        cat.activa = true;
        await cat.save();
        console.log(`✓ ${cat.nombre} - actualizada`);
      } else {
        console.log(`✓ ${cat.nombre} - ya está correcta`);
      }
    }

    console.log('\n✅ Categorías actualizadas correctamente');
    
    // Mostrar todas las categorías
    const todasCategorias = await Categoria.find({ activa: true }).sort({ nombre: 1 });
    console.log('\n📋 Categorías activas:');
    todasCategorias.forEach(cat => {
      console.log(`   - ${cat.nombre}: ${cat.descripcion}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
    process.exit();
  }
}

actualizarCategorias();
