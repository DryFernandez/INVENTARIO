require('dotenv').config();
const mongoose = require('mongoose');
const Cliente = require('./Models/Clientes');

async function crearClientes() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventario');
    console.log('✅ Conectado a MongoDB\n');

    const clientesEjemplo = [
      {
        nombre: 'Juan Pérez García',
        ruc: '20123456789',
        direccion: 'Av. Principal 123, Lima',
        contacto: 'juan.perez@email.com'
      },
      {
        nombre: 'María López Rodríguez',
        ruc: '20987654321',
        direccion: 'Jr. Los Olivos 456, Lima',
        contacto: '+51 999 888 777'
      },
      {
        nombre: 'Empresa Comercial SAC',
        ruc: '20111222333',
        direccion: 'Av. Comercio 789, Miraflores',
        contacto: 'ventas@comercial.com'
      },
      {
        nombre: 'Carlos Ramírez',
        ruc: '10456789123',
        direccion: 'Calle Las Flores 321, San Isidro',
        contacto: '+51 987 654 321'
      },
      {
        nombre: 'Distribuidora El Sol EIRL',
        ruc: '20555666777',
        direccion: 'Av. Industrial 555, Ate',
        contacto: 'contacto@elsol.pe'
      }
    ];

    console.log('🔄 Creando clientes de ejemplo...\n');

    for (const clienteData of clientesEjemplo) {
      // Verificar si ya existe
      const existe = await Cliente.findOne({ nombre: clienteData.nombre });
      
      if (existe) {
        console.log(`⏭️  Ya existe: ${clienteData.nombre}`);
      } else {
        const cliente = await Cliente.create(clienteData);
        console.log(`✅ Creado: ${cliente.nombre}`);
      }
    }

    console.log('\n✅ Proceso completado\n');

    // Mostrar resumen
    const totalClientes = await Cliente.countDocuments({ activo: true });
    console.log(`📊 Total de clientes activos: ${totalClientes}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

crearClientes();
