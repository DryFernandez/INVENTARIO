// inicializarPermisos.js
require('dotenv').config();
const mongoose = require('mongoose');
const Permiso = require('./Models/Permiso');

const permisosPorDefecto = [
  {
    rol: 'admin',
    descripcion: 'Administrador con acceso total al sistema',
    modulos: {
      productos: { ver: true, crear: true, editar: true, eliminar: true },
      inventario: { ver: true, ajustar: true, transferir: true, conteo: true },
      compras: { ver: true, crear: true, aprobar: true, cancelar: true },
      ventas: { ver: true, crear: true, editar: true, cancelar: true },
      cotizaciones: { ver: true, crear: true, aprobar: true, convertir: true },
      clientes: { ver: true, crear: true, editar: true, eliminar: true },
      proveedores: { ver: true, crear: true, editar: true, eliminar: true },
      usuarios: { ver: true, crear: true, editar: true, eliminar: true },
      reportes: { inventario: true, ventas: true, compras: true, financiero: true, auditoria: true },
      configuracion: { almacenes: true, categorias: true, permisos: true, sistema: true }
    }
  },
  {
    rol: 'gestor_ventas',
    descripcion: 'Gestor de ventas con permisos para ventas, cotizaciones y clientes',
    modulos: {
      productos: { ver: true, crear: false, editar: false, eliminar: false },
      inventario: { ver: true, ajustar: false, transferir: false, conteo: false },
      compras: { ver: false, crear: false, aprobar: false, cancelar: false },
      ventas: { ver: true, crear: true, editar: true, cancelar: false },
      cotizaciones: { ver: true, crear: true, aprobar: true, convertir: true },
      clientes: { ver: true, crear: true, editar: true, eliminar: false },
      proveedores: { ver: false, crear: false, editar: false, eliminar: false },
      usuarios: { ver: false, crear: false, editar: false, eliminar: false },
      reportes: { inventario: true, ventas: true, compras: false, financiero: false, auditoria: false },
      configuracion: { almacenes: false, categorias: false, permisos: false, sistema: false }
    }
  },
  {
    rol: 'gestor_compras',
    descripcion: 'Gestor de compras con permisos para compras, órdenes y proveedores',
    modulos: {
      productos: { ver: true, crear: true, editar: true, eliminar: false },
      inventario: { ver: true, ajustar: false, transferir: false, conteo: false },
      compras: { ver: true, crear: true, aprobar: true, cancelar: false },
      ventas: { ver: false, crear: false, editar: false, cancelar: false },
      cotizaciones: { ver: false, crear: false, aprobar: false, convertir: false },
      clientes: { ver: false, crear: false, editar: false, eliminar: false },
      proveedores: { ver: true, crear: true, editar: true, eliminar: false },
      usuarios: { ver: false, crear: false, editar: false, eliminar: false },
      reportes: { inventario: true, ventas: false, compras: true, financiero: false, auditoria: false },
      configuracion: { almacenes: false, categorias: true, permisos: false, sistema: false }
    }
  },
  {
    rol: 'admin_inventario',
    descripcion: 'Administrador de inventario con permisos completos sobre stock',
    modulos: {
      productos: { ver: true, crear: true, editar: true, eliminar: false },
      inventario: { ver: true, ajustar: true, transferir: true, conteo: true },
      compras: { ver: true, crear: false, aprobar: false, cancelar: false },
      ventas: { ver: true, crear: false, editar: false, cancelar: false },
      cotizaciones: { ver: false, crear: false, aprobar: false, convertir: false },
      clientes: { ver: false, crear: false, editar: false, eliminar: false },
      proveedores: { ver: true, crear: false, editar: false, eliminar: false },
      usuarios: { ver: false, crear: false, editar: false, eliminar: false },
      reportes: { inventario: true, ventas: true, compras: true, financiero: false, auditoria: false },
      configuracion: { almacenes: true, categorias: true, permisos: false, sistema: false }
    }
  },
  {
    rol: 'empleado',
    descripcion: 'Empleado con permisos básicos de visualización',
    modulos: {
      productos: { ver: true, crear: false, editar: false, eliminar: false },
      inventario: { ver: true, ajustar: false, transferir: false, conteo: false },
      compras: { ver: false, crear: false, aprobar: false, cancelar: false },
      ventas: { ver: true, crear: true, editar: false, cancelar: false },
      cotizaciones: { ver: true, crear: true, aprobar: false, convertir: false },
      clientes: { ver: true, crear: false, editar: false, eliminar: false },
      proveedores: { ver: false, crear: false, editar: false, eliminar: false },
      usuarios: { ver: false, crear: false, editar: false, eliminar: false },
      reportes: { inventario: false, ventas: false, compras: false, financiero: false, auditoria: false },
      configuracion: { almacenes: false, categorias: false, permisos: false, sistema: false }
    }
  },
  {
    rol: 'auditor',
    descripcion: 'Auditor con acceso de solo lectura a todo el sistema',
    modulos: {
      productos: { ver: true, crear: false, editar: false, eliminar: false },
      inventario: { ver: true, ajustar: false, transferir: false, conteo: false },
      compras: { ver: true, crear: false, aprobar: false, cancelar: false },
      ventas: { ver: true, crear: false, editar: false, cancelar: false },
      cotizaciones: { ver: true, crear: false, aprobar: false, convertir: false },
      clientes: { ver: true, crear: false, editar: false, eliminar: false },
      proveedores: { ver: true, crear: false, editar: false, eliminar: false },
      usuarios: { ver: true, crear: false, editar: false, eliminar: false },
      reportes: { inventario: true, ventas: true, compras: true, financiero: true, auditoria: true },
      configuracion: { almacenes: false, categorias: false, permisos: false, sistema: false }
    }
  }
];

async function inicializarPermisos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Eliminar permisos existentes
    await Permiso.deleteMany({});
    console.log('🗑️  Permisos anteriores eliminados');

    // Crear nuevos permisos
    for (const permiso of permisosPorDefecto) {
      await Permiso.create(permiso);
      console.log(`✅ Permisos creados para rol: ${permiso.rol}`);
    }

    console.log('\n🎉 Permisos inicializados correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

inicializarPermisos();
