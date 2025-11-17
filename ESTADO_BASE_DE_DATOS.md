# 🗄️ ESTADO ACTUAL DE LA BASE DE DATOS

## 📊 Conteo de Registros

| Colección | Cantidad | Estado |
|-----------|----------|--------|
| **Usuarios** | 1 | ✅ Admin activo |
| **Categorías** | 8 | ✅ Listas para usar |
| **Almacenes** | 1 | ✅ Almacén Principal |
| **Proveedores** | 0 | ⚪ Vacío |
| **Productos** | 0 | ⚪ Vacío |
| **Clientes** | 0 | ⚪ Vacío |
| **Ventas** | 0 | ⚪ Vacío |
| **Compras** | 0 | ⚪ Vacío |
| **TOTAL** | **10** | ✅ |

---

## 👤 Usuario Administrador

### Credenciales de Acceso

```
Email:    admin@gmail.com
Password: admin
Rol:      administrador
Estado:   Activo
```

### Permisos
- ✅ Gestión completa de usuarios
- ✅ Gestión de categorías
- ✅ Gestión de almacenes
- ✅ Gestión de productos
- ✅ Gestión de proveedores
- ✅ Gestión de clientes
- ✅ Registro de ventas
- ✅ Registro de compras
- ✅ Acceso a reportes
- ✅ Configuración del sistema

---

## 📂 Categorías Disponibles

1. **Electrónica**
   - Descripción: Productos electrónicos y tecnológicos
   - Estado: Activa

2. **Accesorios**
   - Descripción: Accesorios y complementos
   - Estado: Activa

3. **Oficina**
   - Descripción: Artículos de oficina y papelería
   - Estado: Activa

4. **Hogar**
   - Descripción: Productos para el hogar
   - Estado: Activa

5. **Herramientas**
   - Descripción: Herramientas y equipos
   - Estado: Activa

6. **Deportes**
   - Descripción: Artículos deportivos
   - Estado: Activa

7. **Alimentos**
   - Descripción: Productos alimenticios
   - Estado: Activa

8. **Ropa**
   - Descripción: Prendas de vestir
   - Estado: Activa

---

## 🏢 Almacén Disponible

### Almacén Principal

```
Nombre:      Almacén Principal
Ubicación:   Lima, Perú
Capacidad:   10,000 unidades
Estado:      Activo
```

---

## 🔧 Scripts Disponibles

### Gestión de Base de Datos

1. **Crear Admin y Categorías**
   ```bash
   cd backend
   node crearAdmin.js
   ```
   - Crea usuario administrador si no existe
   - Agrega 8 categorías por defecto
   - No duplica si ya existen

2. **Limpiar Base de Datos**
   ```bash
   cd backend
   node limpiarDB.js
   ```
   - ⚠️ **CUIDADO:** Elimina todos los datos excepto:
     - Usuario administrador (preservado)
     - Mantiene estructura de colecciones

3. **Contar Registros**
   ```bash
   cd backend
   node contarDB.js
   ```
   - Muestra conteo de todos los documentos
   - No modifica datos
   - Útil para verificar estado

4. **Probar Reactivación**
   ```bash
   cd backend
   node probarReactivacion.js
   ```
   - Prueba lógica de reactivación en todos los módulos
   - Crea, desactiva y reactiva registros de prueba
   - Limpia al terminar
   - No afecta datos reales

5. **Poblar Base de Datos**
   ```bash
   cd backend
   node poblarDB.js
   ```
   - Agrega datos de ejemplo
   - Útil para desarrollo/testing

---

## 🗺️ Estructura de Colecciones

### usuarios
```javascript
{
  _id: ObjectId,
  nombre: String,
  email: String,
  password: String (hash),
  rol: String, // 'admin', 'gestor_ventas', 'gestor_compras', etc.
  activo: Boolean,
  estado: Boolean,
  fechaCreacion: Date,
  fechaActualizacion: Date
}
```

### categorias
```javascript
{
  _id: ObjectId,
  nombre: String,
  descripcion: String,
  activa: Boolean,
  creadoPor: ObjectId (ref: 'Usuario'),
  actualizadoPor: ObjectId (ref: 'Usuario'),
  fechaCreacion: Date,
  fechaActualizacion: Date
}
```

### almacenes
```javascript
{
  _id: ObjectId,
  nombre: String,
  ubicacion: String,
  capacidad: Number,
  descripcion: String,
  activo: Boolean,
  creadoPor: ObjectId (ref: 'Usuario'),
  actualizadoPor: ObjectId (ref: 'Usuario'),
  fechaCreacion: Date,
  fechaActualizacion: Date
}
```

### clientes
```javascript
{
  _id: ObjectId,
  nombre: String,
  ruc: String (opcional, unique),
  dni: String (opcional),
  email: String,
  telefono: String,
  direccion: String,
  activo: Boolean,
  creadoPor: ObjectId (ref: 'Usuario'),
  fechaCreacion: Date
}
```

### proveedores
```javascript
{
  _id: ObjectId,
  nombre: String,
  nombreComercial: String,
  ruc: String (unique),
  tipoDocumento: String, // 'RUC', 'DNI', 'CE', 'PASAPORTE'
  contactoPrincipal: {
    nombre: String,
    telefono: String,
    email: String,
    cargo: String
  },
  direccion: String,
  ciudad: String,
  pais: String (default: 'Perú'),
  activo: Boolean,
  fechaRegistro: Date
}
```

### productos
```javascript
{
  _id: ObjectId,
  nombre: String,
  sku: String (unique),
  categoria: ObjectId (ref: 'Categoria'),
  almacen: ObjectId (ref: 'Almacen'),
  precio: Number,
  descripcion: String,
  imagen: String (URL),
  stockMinimo: Number,
  stockMaximo: Number,
  activo: Boolean,
  creadoPor: ObjectId (ref: 'Usuario'),
  actualizadoPor: ObjectId (ref: 'Usuario'),
  fechaCreacion: Date,
  fechaActualizacion: Date
}
```

### productoalmacen
```javascript
{
  _id: ObjectId,
  producto: ObjectId (ref: 'Producto'),
  almacen: ObjectId (ref: 'Almacen'),
  stock: Number,
  stockMinimo: Number,
  stockMaximo: Number,
  ubicacion: String,
  lote: String,
  fechaVencimiento: Date
}
```

### ventas
```javascript
{
  _id: ObjectId,
  folio: String (unique),
  cliente: ObjectId (ref: 'Cliente'),
  vendedor: ObjectId (ref: 'Usuario'),
  almacen: ObjectId (ref: 'Almacen'),
  productos: [{
    producto: ObjectId (ref: 'Producto'),
    cantidad: Number,
    precioUnitario: Number,
    subtotal: Number
  }],
  total: Number,
  estado: String, // 'pendiente', 'completada', 'cancelada'
  metodoPago: String,
  fechaVenta: Date
}
```

### compras
```javascript
{
  _id: ObjectId,
  folio: String (unique),
  proveedor: ObjectId (ref: 'Proveedor'),
  comprador: ObjectId (ref: 'Usuario'),
  almacen: ObjectId (ref: 'Almacen'),
  productos: [{
    producto: ObjectId (ref: 'Producto'),
    cantidad: Number,
    precioUnitario: Number,
    subtotal: Number
  }],
  total: Number,
  estado: String, // 'pendiente', 'recibida', 'cancelada'
  fechaCompra: Date,
  fechaEntregaEstimada: Date
}
```

---

## 🔐 Seguridad

### Passwords
- ✅ Hasheados con bcrypt (salt rounds: 10)
- ✅ Nunca se devuelven en respuestas API
- ✅ Rehasheo automático en reactivación de usuarios

### JWT Tokens
- ✅ Secret key en variables de entorno
- ✅ Expiración configurable (process.env.JWT_EXPIRE)
- ✅ Payload incluye: id, rol

### Validaciones
- ✅ Express-validator en todas las rutas POST/PUT
- ✅ Mongoose schemas con validaciones
- ✅ Checks de rol para rutas protegidas

---

## 📈 Próximos Pasos con la BD

### Datos de Prueba Recomendados

1. **Crear 3-5 Proveedores**
   - Para poder registrar compras
   - Incluir contacto principal completo

2. **Crear 10-15 Productos**
   - Distribuidos en diferentes categorías
   - Con SKU único y precio
   - Asignar al almacén principal

3. **Crear 5-10 Clientes**
   - Para poder registrar ventas
   - Incluir RUC o DNI

4. **Registrar 2-3 Compras**
   - Con diferentes proveedores
   - Para generar stock inicial

5. **Registrar 2-3 Ventas**
   - Con diferentes clientes
   - Para probar flujo completo

---

## 🔍 Verificación del Sistema

### Checklist Pre-Producción

- [x] Usuario admin creado y activo
- [x] Categorías por defecto creadas
- [x] Almacén principal creado
- [x] Lógica de reactivación funcionando
- [x] Sistema de notificaciones funcionando
- [ ] Datos de prueba agregados
- [ ] Respaldos configurados
- [ ] SSL/TLS configurado
- [ ] Rate limiting implementado
- [ ] Logging configurado

---

## 📞 Soporte

### Contacto
- **Email:** admin@gmail.com (temporal)
- **Password:** admin (cambiar en producción)

### Documentación
- `REACTIVACION_IMPLEMENTADA.md` - Guía de reactivación
- `RESUMEN_SESION_COMPLETO.md` - Resumen de implementaciones
- `README.md` - Documentación general
- `DESPLIEGUE.md` - Guía de deployment

---

**Última Actualización:** 2024
**Versión de BD:** 1.0
**Estado:** ✅ Limpia y lista para usar
