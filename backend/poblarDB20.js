require('dotenv').config();
const mongoose = require('mongoose');

// Importar modelos
const Usuario = require('./Models/Usuario');
const Categoria = require('./Models/Categorias');
const Almacen = require('./Models/Almacen');
const Proveedor = require('./Models/Proveedor');
const Producto = require('./Models/Producto');
const Cliente = require('./Models/Clientes');
const ProductoAlmacen = require('./Models/ProductoAlmacen');

// Generar datos de ejemplo
const generarCategorias = () => {
  const categorias = [
    { nombre: 'Electrónica', descripcion: 'Dispositivos y componentes electrónicos' },
    { nombre: 'Accesorios', descripcion: 'Accesorios diversos para equipos' },
    { nombre: 'Oficina', descripcion: 'Artículos y suministros de oficina' },
    { nombre: 'Hogar', descripcion: 'Productos para el hogar' },
    { nombre: 'Computación', descripcion: 'Equipos de computación y periféricos' },
    { nombre: 'Audio y Video', descripcion: 'Equipos de audio y video' },
    { nombre: 'Gaming', descripcion: 'Productos para videojuegos' },
    { nombre: 'Networking', descripcion: 'Equipos de red y conectividad' },
    { nombre: 'Telefonía', descripcion: 'Teléfonos y accesorios' },
    { nombre: 'Fotografía', descripcion: 'Cámaras y accesorios fotográficos' },
    { nombre: 'Impresión', descripcion: 'Impresoras y suministros' },
    { nombre: 'Almacenamiento', descripcion: 'Dispositivos de almacenamiento' },
    { nombre: 'Cables y Conectores', descripcion: 'Cables y conectores variados' },
    { nombre: 'Energía', descripcion: 'Baterías y fuentes de poder' },
    { nombre: 'Seguridad', descripcion: 'Equipos de seguridad y vigilancia' },
    { nombre: 'Mobiliario', descripcion: 'Muebles para oficina y hogar' },
    { nombre: 'Iluminación', descripcion: 'Lámparas y sistemas de iluminación' },
    { nombre: 'Herramientas', descripcion: 'Herramientas de trabajo' },
    { nombre: 'Limpieza', descripcion: 'Productos de limpieza y mantenimiento' },
    { nombre: 'Papelería', descripcion: 'Artículos de papelería' },
    { nombre: 'Software', descripcion: 'Licencias y software' },
    { nombre: 'Consumibles', descripcion: 'Productos consumibles variados' }
  ];
  return categorias.slice(0, 22);
};

const generarAlmacenes = () => {
  const almacenes = [
    { nombre: 'Almacén Principal', ubicacion: 'Av. Principal 123, Ciudad', capacidadMaxima: 10000 },
    { nombre: 'Almacén Secundario', ubicacion: 'Calle Secundaria 456, Ciudad', capacidadMaxima: 5000 },
    { nombre: 'Almacén Norte', ubicacion: 'Zona Norte Industrial 789', capacidadMaxima: 7500 },
    { nombre: 'Almacén Sur', ubicacion: 'Zona Sur Comercial 321', capacidadMaxima: 6000 },
    { nombre: 'Almacén Centro', ubicacion: 'Centro Comercial Plaza 111', capacidadMaxima: 4000 },
    { nombre: 'Almacén Este', ubicacion: 'Zona Este Industrial 222', capacidadMaxima: 8000 },
    { nombre: 'Almacén Oeste', ubicacion: 'Zona Oeste Logística 333', capacidadMaxima: 9000 },
    { nombre: 'Almacén Temporal', ubicacion: 'Bodega Temporal 444', capacidadMaxima: 3000 },
    { nombre: 'Almacén Express', ubicacion: 'Centro de Distribución 555', capacidadMaxima: 5500 },
    { nombre: 'Almacén Regional A', ubicacion: 'Región A - Sector 1', capacidadMaxima: 6500 },
    { nombre: 'Almacén Regional B', ubicacion: 'Región B - Sector 2', capacidadMaxima: 7000 },
    { nombre: 'Almacén Regional C', ubicacion: 'Región C - Sector 3', capacidadMaxima: 5800 },
    { nombre: 'Almacén Electrónica', ubicacion: 'Zona Especializada Electrónica', capacidadMaxima: 4500 },
    { nombre: 'Almacén Muebles', ubicacion: 'Zona Especializada Mobiliario', capacidadMaxima: 8500 },
    { nombre: 'Almacén Consumibles', ubicacion: 'Depósito Consumibles', capacidadMaxima: 3500 },
    { nombre: 'Almacén Importación', ubicacion: 'Puerto - Zona Aduanas', capacidadMaxima: 12000 },
    { nombre: 'Almacén Exportación', ubicacion: 'Centro Logístico Internacional', capacidadMaxima: 11000 },
    { nombre: 'Almacén Refrigerado', ubicacion: 'Zona Refrigerada Especial', capacidadMaxima: 2000 },
    { nombre: 'Almacén Seguridad Alta', ubicacion: 'Zona de Alta Seguridad', capacidadMaxima: 1500 },
    { nombre: 'Almacén Tránsito', ubicacion: 'Área de Tránsito Temporal', capacidadMaxima: 4000 },
    { nombre: 'Almacén Virtual', ubicacion: 'Centro de Gestión Virtual', capacidadMaxima: 5000 }
  ];
  return almacenes.slice(0, 21);
};

const generarProveedores = () => {
  const proveedores = [
    {
      nombre: 'TechSupply Global SA',
      nombreComercial: 'TechSupply',
      ruc: '20501234567',
      contactoPrincipal: { nombre: 'Carlos López', telefono: '555-1001', email: 'carlos@techsupply.com', cargo: 'Gerente Comercial' },
      direccion: 'Av. Tecnología 123',
      ciudad: 'Lima'
    },
    {
      nombre: 'Office Solutions Peru',
      nombreComercial: 'OfficeSol',
      ruc: '20501234568',
      contactoPrincipal: { nombre: 'Ana Martínez', telefono: '555-1002', email: 'ana@officesol.com', cargo: 'Jefa de Ventas' },
      direccion: 'Jr. Comercio 456',
      ciudad: 'Lima'
    },
    {
      nombre: 'Electrónica Digital SAC',
      nombreComercial: 'ElectroDigital',
      ruc: '20501234569',
      contactoPrincipal: { nombre: 'Jorge Silva', telefono: '555-1003', email: 'jorge@electrodigital.com', cargo: 'Director Comercial' },
      direccion: 'Av. Industrial 789',
      ciudad: 'Callao'
    },
    {
      nombre: 'Distribuidora MultiTech',
      nombreComercial: 'MultiTech',
      ruc: '20501234570',
      contactoPrincipal: { nombre: 'María Rodríguez', telefono: '555-1004', email: 'maria@multitech.com', cargo: 'Gerente General' },
      direccion: 'Calle Progreso 321',
      ciudad: 'Arequipa'
    },
    {
      nombre: 'Importaciones Tech World',
      nombreComercial: 'TechWorld',
      ruc: '20501234571',
      contactoPrincipal: { nombre: 'Pedro Gómez', telefono: '555-1005', email: 'pedro@techworld.com', cargo: 'Jefe de Importaciones' },
      direccion: 'Av. Internacional 111',
      ciudad: 'Lima'
    },
    {
      nombre: 'Computación Total EIRL',
      nombreComercial: 'CompuTotal',
      ruc: '20501234572',
      contactoPrincipal: { nombre: 'Laura Díaz', telefono: '555-1006', email: 'laura@computotal.com', cargo: 'Gerente Comercial' },
      direccion: 'Jr. Sistemas 222',
      ciudad: 'Trujillo'
    },
    {
      nombre: 'Suministros Empresariales SA',
      nombreComercial: 'SumEmpresas',
      ruc: '20501234573',
      contactoPrincipal: { nombre: 'Roberto Flores', telefono: '555-1007', email: 'roberto@sumempresas.com', cargo: 'Director de Ventas' },
      direccion: 'Av. Empresarial 333',
      ciudad: 'Chiclayo'
    },
    {
      nombre: 'Gaming Pro Supplies',
      nombreComercial: 'GamingPro',
      ruc: '20501234574',
      contactoPrincipal: { nombre: 'Sandra Vega', telefono: '555-1008', email: 'sandra@gamingpro.com', cargo: 'Gerente de Producto' },
      direccion: 'Calle Gamers 444',
      ciudad: 'Lima'
    },
    {
      nombre: 'Network Solutions Peru',
      nombreComercial: 'NetSolutions',
      ruc: '20501234575',
      contactoPrincipal: { nombre: 'Miguel Torres', telefono: '555-1009', email: 'miguel@netsolutions.com', cargo: 'Especialista Técnico' },
      direccion: 'Av. Conectividad 555',
      ciudad: 'Lima'
    },
    {
      nombre: 'Audio Visual Pro SAC',
      nombreComercial: 'AVPro',
      ruc: '20501234576',
      contactoPrincipal: { nombre: 'Carmen Ruiz', telefono: '555-1010', email: 'carmen@avpro.com', cargo: 'Gerente Regional' },
      direccion: 'Jr. Multimedia 666',
      ciudad: 'Cusco'
    },
    {
      nombre: 'Mobiliario Corporativo',
      nombreComercial: 'MobiCorp',
      ruc: '20501234577',
      contactoPrincipal: { nombre: 'Luis Mendoza', telefono: '555-1011', email: 'luis@mobicorp.com', cargo: 'Jefe de Proyectos' },
      direccion: 'Av. Muebles 777',
      ciudad: 'Lima'
    },
    {
      nombre: 'Papelería Central SAC',
      nombreComercial: 'PapelCentral',
      ruc: '20501234578',
      contactoPrincipal: { nombre: 'Rosa Paredes', telefono: '555-1012', email: 'rosa@papelcentral.com', cargo: 'Gerente Comercial' },
      direccion: 'Calle Papeles 888',
      ciudad: 'Piura'
    },
    {
      nombre: 'Iluminación LED Peru',
      nombreComercial: 'LEDPeru',
      ruc: '20501234579',
      contactoPrincipal: { nombre: 'Fernando Castro', telefono: '555-1013', email: 'fernando@ledperu.com', cargo: 'Director Técnico' },
      direccion: 'Av. Luz 999',
      ciudad: 'Lima'
    },
    {
      nombre: 'Cables y Conectores SAC',
      nombreComercial: 'CablesCon',
      ruc: '20501234580',
      contactoPrincipal: { nombre: 'Patricia Ramos', telefono: '555-1014', email: 'patricia@cablescon.com', cargo: 'Jefa de Ventas' },
      direccion: 'Jr. Conexiones 101',
      ciudad: 'Ica'
    },
    {
      nombre: 'Energía y Baterías EIRL',
      nombreComercial: 'EnerBat',
      ruc: '20501234581',
      contactoPrincipal: { nombre: 'Raúl Jiménez', telefono: '555-1015', email: 'raul@enerbat.com', cargo: 'Gerente General' },
      direccion: 'Av. Energía 202',
      ciudad: 'Tacna'
    },
    {
      nombre: 'Seguridad Integral SAC',
      nombreComercial: 'SecIntegral',
      ruc: '20501234582',
      contactoPrincipal: { nombre: 'Diana Morales', telefono: '555-1016', email: 'diana@secintegral.com', cargo: 'Gerente de Seguridad' },
      direccion: 'Calle Segura 303',
      ciudad: 'Lima'
    },
    {
      nombre: 'Fotografía Digital Pro',
      nombreComercial: 'FotoPro',
      ruc: '20501234583',
      contactoPrincipal: { nombre: 'Alberto Vargas', telefono: '555-1017', email: 'alberto@fotopro.com', cargo: 'Especialista en Producto' },
      direccion: 'Av. Imagen 404',
      ciudad: 'Huancayo'
    },
    {
      nombre: 'Impresoras y Más SAC',
      nombreComercial: 'ImpriMas',
      ruc: '20501234584',
      contactoPrincipal: { nombre: 'Lucía Herrera', telefono: '555-1018', email: 'lucia@imprimas.com', cargo: 'Gerente Comercial' },
      direccion: 'Jr. Impresión 505',
      ciudad: 'Lima'
    },
    {
      nombre: 'Almacenamiento Data SAC',
      nombreComercial: 'DataStorage',
      ruc: '20501234585',
      contactoPrincipal: { nombre: 'Ricardo Soto', telefono: '555-1019', email: 'ricardo@datastorage.com', cargo: 'Director de Tecnología' },
      direccion: 'Av. Data 606',
      ciudad: 'Lima'
    },
    {
      nombre: 'Herramientas Pro EIRL',
      nombreComercial: 'ToolsPro',
      ruc: '20501234586',
      contactoPrincipal: { nombre: 'Monica Quispe', telefono: '555-1020', email: 'monica@toolspro.com', cargo: 'Jefa de Ventas' },
      direccion: 'Calle Herramientas 707',
      ciudad: 'Puno'
    },
    {
      nombre: 'Software Corporativo SAC',
      nombreComercial: 'SoftCorp',
      ruc: '20501234587',
      contactoPrincipal: { nombre: 'Javier Rojas', telefono: '555-1021', email: 'javier@softcorp.com', cargo: 'Gerente de Licencias' },
      direccion: 'Av. Software 808',
      ciudad: 'Lima'
    }
  ];
  return proveedores.slice(0, 21);
};

const generarClientes = () => {
  const clientes = [
    { nombre: 'Cliente General', contacto: 'general@clientes.com', telefono: '555-0000', direccion: 'N/A' },
    { nombre: 'Corporación ABC SAC', contacto: 'ventas@abc.com', telefono: '555-2001', direccion: 'Av. Corporativa 100' },
    { nombre: 'Empresa XYZ EIRL', contacto: 'compras@xyz.com', telefono: '555-2002', direccion: 'Jr. Empresarial 200' },
    { nombre: 'Grupo Comercial Delta', contacto: 'adquisiciones@delta.com', telefono: '555-2003', direccion: 'Calle Comercio 300' },
    { nombre: 'Inversiones Gamma SA', contacto: 'logistica@gamma.com', telefono: '555-2004', direccion: 'Av. Inversiones 400' },
    { nombre: 'Distribuidora Omega', contacto: 'pedidos@omega.com', telefono: '555-2005', direccion: 'Jr. Distribución 500' },
    { nombre: 'Tech Solutions SAC', contacto: 'compras@techsol.com', telefono: '555-2006', direccion: 'Av. Tecnología 600' },
    { nombre: 'Comercial Beta EIRL', contacto: 'ventas@beta.com', telefono: '555-2007', direccion: 'Calle Beta 700' },
    { nombre: 'Servicios Integrales SA', contacto: 'adquisiciones@servicios.com', telefono: '555-2008', direccion: 'Av. Servicios 800' },
    { nombre: 'Constructora Sigma', contacto: 'compras@sigma.com', telefono: '555-2009', direccion: 'Jr. Construcción 900' },
    { nombre: 'Industrias Alfa SAC', contacto: 'logistica@alfa.com', telefono: '555-2010', direccion: 'Av. Industrial 1000' },
    { nombre: 'Retail Store Chain', contacto: 'procurement@retail.com', telefono: '555-2011', direccion: 'Calle Retail 1100' },
    { nombre: 'Hospital Central', contacto: 'compras@hospital.com', telefono: '555-2012', direccion: 'Av. Salud 1200' },
    { nombre: 'Universidad Nacional', contacto: 'adquisiciones@universidad.edu', telefono: '555-2013', direccion: 'Campus Universitario' },
    { nombre: 'Gobierno Regional', contacto: 'logistica@gobierno.gob', telefono: '555-2014', direccion: 'Plaza Gobierno' },
    { nombre: 'Hotel Cinco Estrellas', contacto: 'compras@hotel.com', telefono: '555-2015', direccion: 'Av. Turismo 1500' },
    { nombre: 'Restaurante Gourmet', contacto: 'adquisiciones@gourmet.com', telefono: '555-2016', direccion: 'Calle Gastronómica 1600' },
    { nombre: 'Supermercado Express', contacto: 'compras@superexpress.com', telefono: '555-2017', direccion: 'Av. Comercial 1700' },
    { nombre: 'Farmacia Total', contacto: 'logistica@farmacia.com', telefono: '555-2018', direccion: 'Jr. Salud 1800' },
    { nombre: 'Clínica Médica Integral', contacto: 'adquisiciones@clinica.com', telefono: '555-2019', direccion: 'Av. Médica 1900' },
    { nombre: 'Instituto Tecnológico', contacto: 'compras@instituto.edu', telefono: '555-2020', direccion: 'Campus Tecnológico 2000' }
  ];
  return clientes.slice(0, 21);
};

const generarProductos = (categorias, almacenes, proveedores) => {
  const nombresProductos = [
    'Laptop HP Pavilion', 'Mouse Inalámbrico', 'Teclado Mecánico', 'Monitor LG 24"', 'Webcam HD',
    'Auriculares Bluetooth', 'Micrófono USB', 'Parlantes 2.1', 'Router WiFi 6', 'Switch Gigabit',
    'Disco Duro 1TB', 'SSD 500GB', 'Memoria RAM 8GB', 'Procesador Intel i5', 'Tarjeta Gráfica',
    'Impresora Láser', 'Scanner Documentos', 'Proyector LED', 'Tablet 10"', 'Smartphone Android',
    'Smartwatch', 'Power Bank 20000mAh', 'Cable USB-C', 'Hub USB 4 Puertos', 'Adaptador HDMI',
    'Cámara Web 4K', 'Silla Ergonómica', 'Escritorio Ejecutivo', 'Archivador Metálico', 'Estante Biblioteca'
  ];

  const productos = [];
  for (let i = 0; i < 30; i++) {
    const cat = categorias[i % categorias.length];
    const alm = almacenes[i % almacenes.length];
    const prov = proveedores[i % proveedores.length];
    
    productos.push({
      sku: `${cat.nombre.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
      nombre: `${nombresProductos[i % nombresProductos.length]} ${i > 29 ? 'Plus' : ''}`,
      descripcion: `Producto de alta calidad categoría ${cat.nombre}`,
      categoria: cat._id,
      precio: Math.floor(Math.random() * 1000) + 50,
      stock: Math.floor(Math.random() * 100) + 10,
      stockMinimo: Math.floor(Math.random() * 10) + 5,
      almacen: alm._id,
      proveedor: prov._id,
      activo: true
    });
  }
  return productos;
};

async function poblarBaseDeDatos() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventario');
    console.log('✅ Conectado a MongoDB');

    // Limpiar colecciones existentes
    console.log('\n🗑️  Limpiando base de datos...');
    await Usuario.deleteMany({});
    await Categoria.deleteMany({});
    await Almacen.deleteMany({});
    await Proveedor.deleteMany({});
    await Producto.deleteMany({});
    await Cliente.deleteMany({});
    await ProductoAlmacen.deleteMany({});
    console.log('✅ Base de datos limpiada');

    // Insertar Categorías (22 registros)
    console.log('\n📁 Insertando categorías...');
    const categorias = await Categoria.insertMany(generarCategorias());
    console.log(`✅ ${categorias.length} categorías insertadas`);

    // Insertar Almacenes (21 registros)
    console.log('\n🏭 Insertando almacenes...');
    const almacenes = await Almacen.insertMany(generarAlmacenes());
    console.log(`✅ ${almacenes.length} almacenes insertados`);

    // Insertar Proveedores (21 registros)
    console.log('\n🤝 Insertando proveedores...');
    const proveedores = await Proveedor.insertMany(generarProveedores());
    console.log(`✅ ${proveedores.length} proveedores insertados`);

    // Insertar Clientes (21 registros)
    console.log('\n👥 Insertando clientes...');
    const clientes = await Cliente.insertMany(generarClientes());
    console.log(`✅ ${clientes.length} clientes insertados`);

    // Insertar Productos (30 registros)
    console.log('\n📦 Insertando productos...');
    const productos = await Producto.insertMany(generarProductos(categorias, almacenes, proveedores));
    console.log(`✅ ${productos.length} productos insertados`);

    // Crear registros en ProductoAlmacen para tracking de stock
    console.log('\n📊 Creando registros de stock por almacén...');
    const productosAlmacen = [];
    for (const producto of productos) {
      productosAlmacen.push({
        producto: producto._id,
        almacen: producto.almacen,
        stock: producto.stock,
        stockMinimo: producto.stockMinimo,
        activo: true
      });
    }
    await ProductoAlmacen.insertMany(productosAlmacen);
    console.log(`✅ ${productosAlmacen.length} registros de stock creados`);

    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('🎉 BASE DE DATOS POBLADA EXITOSAMENTE CON 20+ REGISTROS');
    console.log('='.repeat(60));
    console.log(`📁 Categorías:      ${categorias.length} registros`);
    console.log(`🏭 Almacenes:       ${almacenes.length} registros`);
    console.log(`🤝 Proveedores:     ${proveedores.length} registros`);
    console.log(`👥 Clientes:        ${clientes.length} registros`);
    console.log(`📦 Productos:       ${productos.length} registros`);
    console.log(`📊 Stock Almacenes: ${productosAlmacen.length} registros`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
    process.exit();
  }
}

// Ejecutar
poblarBaseDeDatos();
