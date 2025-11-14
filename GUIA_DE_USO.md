# 📖 Guía de Uso - Sistema de Inventario

## 🎯 Inicio Rápido

### 1. Acceso al Sistema

1. Abre tu navegador y ve a `http://localhost:5173`
2. Verás la pantalla de login
3. Ingresa tus credenciales (para demo, cualquier email y contraseña de 6+ caracteres)
4. Click en "Iniciar Sesión"

### 2. Panel Principal (Dashboard)

Al iniciar sesión, verás:

- **Estadísticas Principales**: Total de productos, ventas del mes, stock bajo, etc.
- **Tarjetas de Resumen**: Información de almacenes, categorías y compras
- **Productos con Stock Bajo**: Lista de productos que requieren reposición
- **Actividad Reciente**: Últimas acciones en el sistema

## 📦 Gestión de Productos

### Crear un Nuevo Producto

1. Click en "PRODUCTOS" en el menú lateral
2. Click en el botón "Nuevo Producto" (esquina superior derecha)
3. Completa el formulario:
   - **SKU**: Código único del producto
   - **Nombre**: Nombre descriptivo
   - **Categoría**: Selecciona una categoría existente
   - **Precio**: Precio de venta
   - **Stock**: Cantidad inicial
   - **Stock Mínimo**: Alerta cuando baje de esta cantidad
   - **Descripción**: (Opcional) Descripción detallada
4. Click en "Crear Producto"

### Buscar y Filtrar Productos

- **Búsqueda rápida**: Usa el campo de búsqueda para encontrar por nombre o SKU
- **Filtro por categoría**: Usa el selector de categorías
- **Vista de tabla**: Todos los productos se muestran en una tabla ordenada

### Editar un Producto

1. En la tabla de productos, click en el ícono de editar (lápiz)
2. Modifica los campos necesarios
3. Click en "Actualizar Producto"

### Eliminar un Producto

1. Click en el ícono de eliminar (papelera)
2. Confirma la acción en el diálogo

## 🛒 Punto de Venta

### Realizar una Venta

1. Click en "VENTAS" en el menú lateral
2. **Agregar productos al carrito**:
   - Busca el producto en la lista
   - Click en el producto para agregarlo al carrito
3. **Información del cliente**:
   - Ingresa el nombre del cliente (requerido)
   - Email opcional para envío de comprobante
4. **Ajustar cantidades**:
   - Usa los botones + / - para cambiar cantidades
   - Click en la papelera para eliminar del carrito
5. **Seleccionar método de pago**:
   - Efectivo
   - Tarjeta
6. **Procesar venta**:
   - Verifica el total
   - Click en "Procesar Venta"

## 🗂️ Categorías

### Crear Categoría

1. Click en "CATEGORIAS" en el menú
2. Click en "Nueva Categoría"
3. Ingresa:
   - Nombre de la categoría
   - Descripción (opcional)
4. Click en "Crear Categoría"

### Gestionar Categorías

- Las categorías muestran cuántos productos contienen
- Puedes editar o eliminar categorías existentes
- Al eliminar una categoría, considera reasignar los productos primero

## 📦 Compras

### Registrar una Compra

1. Click en "COMPRAS" en el menú
2. Click en "Nueva Compra"
3. Completa:
   - Número de factura
   - Proveedor
   - Fecha
   - Total
4. Click en "Crear Compra"

## 🏭 Almacenes

### Crear Almacén

1. Click en "ALMACENES" en el menú
2. Click en "Nuevo Almacén"
3. Ingresa:
   - Nombre del almacén
   - Dirección
   - Teléfono
   - Capacidad máxima
   - Encargado
4. Click en "Crear Almacén"

### Monitor de Ocupación

- Cada almacén muestra una barra de progreso de ocupación
- Color verde: ocupación normal (< 80%)
- Color rojo: ocupación alta (> 80%)

## 🤝 Proveedores

### Agregar Proveedor

1. Click en "PROVEEDORES" en el menú
2. Click en "Nuevo Proveedor"
3. Completa todos los campos:
   - Nombre de la empresa
   - Persona de contacto
   - Teléfono
   - Email
   - RFC
   - Dirección
4. Click en "Crear Proveedor"

## 👤 Perfil de Usuario

### Actualizar Información Personal

1. Click en el ícono de usuario en la barra superior
2. O navega a "PERFIL" desde el menú
3. Edita tu información:
   - Nombre completo
   - Email
   - Teléfono
4. Click en "Guardar Cambios"

### Cambiar Contraseña

1. En tu perfil, desplázate a "Cambiar Contraseña"
2. Ingresa:
   - Contraseña actual
   - Nueva contraseña
   - Confirmación de nueva contraseña
3. Click en "Actualizar Contraseña"

## 🔔 Notificaciones

El sistema muestra notificaciones para:
- Stock bajo de productos
- Nuevas ventas
- Nuevos productos agregados
- Alertas del sistema

## 💡 Consejos Útiles

### Atajos de Teclado
- `Ctrl + K`: Búsqueda rápida (próximamente)
- `ESC`: Cerrar modales

### Mejores Prácticas

1. **Stock Mínimo**: Configura un stock mínimo apropiado para cada producto
2. **Categorías**: Usa categorías claras y específicas
3. **SKU**: Usa un sistema consistente de SKU (ej: CAT-001, CAT-002)
4. **Respaldos**: Exporta datos regularmente
5. **Actualización**: Mantén el stock actualizado después de cada venta

### Resolución de Problemas

**No puedo iniciar sesión**
- Verifica que el backend esté ejecutándose
- Asegúrate de usar un email válido y contraseña de 6+ caracteres

**Los datos no se guardan**
- Verifica la conexión a MongoDB
- Revisa la consola del navegador para errores

**La página no carga**
- Verifica que el frontend esté ejecutándose en el puerto correcto
- Limpia caché del navegador

## 📱 Versión Móvil

El sistema es responsive y funciona en:
- 📱 Smartphones (iOS/Android)
- 📱 Tablets
- 💻 Laptops
- 🖥️ Escritorio

## 🆘 Soporte

Para ayuda adicional:
- Revisa la documentación técnica en README.md
- Contacta al administrador del sistema
- Revisa los logs del backend para errores

---

**¡Disfruta usando el Sistema de Inventario!** 🎉
