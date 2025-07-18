require('dotenv').config(); // Carga variables de entorno desde .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); // Opcional: para logging de requests

const app = express();

// Middlewares
app.use(cors()); // Habilita CORS
app.use(express.json()); // Parsea JSON en las requests
app.use(morgan('dev')); // Logging de requests (opcional)

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventario', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// Rutas
app.use('/api/auth', require('./Routes/Auth'));
app.use('/api/usuarios', require('./Routes/Usuario'));
app.use('/api/categorias', require('./Routes/Categorias'));
app.use('/api/almacenes', require('./Routes/Almacen'));
app.use('/api/proveedores', require('./Routes/Proveedor'));
app.use('/api/clientes', require('./Routes/Clientes'));
app.use('/api/productos', require('./Routes/Producto'));
app.use('/api/compras', require('./Routes/Compras'));
app.use('/api/ventas', require('./Routes/Venta'));
app.use('/api/traslados', require('./Routes/Traslado'));
app.use('/api/inventario/log', require('./Routes/InventarioLog'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('🚀 API de Inventario funcionando');
});

// Manejo de errores centralizado
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🖥️ Servidor escuchando en http://localhost:${PORT}`);
});