# 📦 Sistema de Inventario - Aplicación Completa

Sistema de gestión de inventario moderno y completo desarrollado con React (Frontend) y Node.js/Express (Backend).

## ✨ Características

### 🎨 Diseño Moderno
- **Interfaz de Usuario Atractiva**: Diseño moderno con componentes reutilizables
- **Paleta de Colores Profesional**: Esquema de colores coherente y atractivo
- **Responsive**: Totalmente adaptable a dispositivos móviles y tablets
- **Animaciones Suaves**: Transiciones y efectos visuales profesionales

### 📊 Módulos Implementados

#### Dashboard
- Tarjetas de estadísticas en tiempo real
- Resumen de inventario, ventas y compras
- Alertas de stock bajo
- Actividad reciente del sistema

#### Productos
- ✅ CRUD completo de productos
- 🔍 Búsqueda y filtrado avanzado
- 📋 Vista de tabla con paginación
- 🏷️ Gestión de categorías y SKU
- ⚠️ Alertas de stock mínimo

#### Ventas (Punto de Venta)
- 🛒 Carrito de compras interactivo
- 💳 Múltiples métodos de pago
- 🧾 Generación de comprobantes
- 👥 Gestión de clientes
- 📊 Historial de ventas

#### Compras
- 📄 Órdenes de compra
- 📦 Recepción de mercancía
- 🏢 Gestión de proveedores
- 💰 Control de costos

#### Categorías
- 🗂️ Organización de productos
- 📊 Contador de productos por categoría
- ✏️ Edición rápida

#### Almacenes
- 🏭 Múltiples ubicaciones
- 📊 Control de capacidad
- 👤 Asignación de encargados
- 📍 Direcciones y contactos

#### Proveedores
- 🤝 Gestión de contactos
- 📞 Información de contacto completa
- 🆔 Registro de RFC
- 📧 Comunicación directa

#### Perfil de Usuario
- 👤 Información personal
- 🔐 Cambio de contraseña
- 📸 Foto de perfil
- 📊 Estadísticas de usuario

### 🔒 Seguridad
- Sistema de autenticación
- Protección de rutas
- Validación de formularios
- Gestión de sesiones

### 🎯 Componentes Reutilizables
- **Button**: Botones con múltiples variantes
- **Input**: Campos de entrada personalizables
- **Modal**: Ventanas modales responsivas
- **Card**: Tarjetas de contenido
- **Table**: Tablas de datos con acciones

## 🚀 Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- MongoDB
- npm o yarn

### Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` en la carpeta backend:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inventario
JWT_SECRET=tu_clave_secreta_aqui
```

Inicia el servidor:
```bash
npm start
```

### Frontend

```bash
cd frontend
npm install
```

Inicia la aplicación:
```bash
npm run dev
```

## 🎨 Paleta de Colores

- **Primary**: `#4f46e5` (Índigo)
- **Secondary**: `#10b981` (Verde)
- **Accent**: `#f59e0b` (Ámbar)
- **Success**: `#10b981`
- **Warning**: `#f59e0b`
- **Error**: `#ef4444`
- **Info**: `#3b82f6`

## 📱 Estructura del Proyecto

```
INVENTARIO/
├── frontend/
│   ├── src/
│   │   ├── app/               # Páginas principales
│   │   ├── components/
│   │   │   ├── common/        # Componentes reutilizables
│   │   │   ├── nav/           # Navegación
│   │   │   └── bar/           # Sidebar
│   │   ├── css/               # Estilos
│   │   ├── router/            # Configuración de rutas
│   │   └── index.css          # Estilos globales
│   └── package.json
├── backend/
│   ├── Models/                # Modelos de MongoDB
│   ├── Routes/                # Rutas de API
│   ├── Validators/            # Validadores
│   ├── Middlewares/           # Middlewares
│   └── Server.js              # Servidor principal
└── README.md
```

## 🔧 Tecnologías Utilizadas

### Frontend
- ⚛️ React 18
- 🎨 CSS3 con Variables
- 🔀 React Router DOM
- 📦 Vite
- 🎯 React Icons

### Backend
- 🟢 Node.js
- 🚂 Express
- 🍃 MongoDB + Mongoose
- 🔐 JWT para autenticación
- ✅ Express Validator

## 🎯 Próximas Características

- [ ] Reportes en PDF
- [ ] Gráficas con Chart.js
- [ ] Exportación a Excel
- [ ] Notificaciones en tiempo real
- [ ] Sistema de roles y permisos
- [ ] Historial de movimientos
- [ ] Códigos de barras
- [ ] Integración con impresoras térmicas

## 👨‍💻 Uso

### Login
- Email: cualquier email válido (demo)
- Contraseña: mínimo 6 caracteres

### Navegación
- Usa el sidebar izquierdo para navegar entre módulos
- El navbar superior muestra notificaciones y perfil
- Cada módulo tiene su propia interfaz CRUD

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría realizar.

## 📧 Contacto

Para cualquier consulta o sugerencia, por favor contacta al equipo de desarrollo.

---

**PARA NUEVAS EMPRESAS Y EN DESARROLLO**

Desarrollado con ❤️ por Dary
