# 🚀 GUÍA DE INICIO RÁPIDO - ELECTRON

## ✅ Instalación Completada

La estructura del proyecto Electron está lista:

```
INVENTARIO/
├── backend/          ← Backend Node.js (puerto 5000)
├── frontend/         ← Versión web React
└── desktop/          ← ⭐ Nueva app Electron
    ├── electron/
    │   ├── main.js
    │   └── preload.js
    ├── src/          ← Código React (mismo del frontend)
    └── package.json
```

---

## 📋 Pasos para Ejecutar

### 1️⃣ Iniciar el Backend (Terminal 1)

```bash
cd backend
npm start
```

Debe mostrar:
```
🖥️  Servidor escuchando en http://localhost:5000
✅ Conectado a MongoDB
```

### 2️⃣ Iniciar la Aplicación Electron (Terminal 2)

```bash
cd desktop
npm run dev
```

Esto hará:
- ✅ Inicia servidor Vite en puerto 5174
- ✅ Abre ventana de Electron automáticamente
- ✅ Conecta al backend en puerto 5000

---

## 🎯 Características de la App Electron

### Ventana Principal
- **Tamaño inicial**: 1400x900px (maximizada)
- **Tamaño mínimo**: 1024x768px
- **Menú nativo**: Archivo, Editar, Ver, Ayuda
- **DevTools**: Habilitadas en modo desarrollo

### Menú de la Aplicación
- **Archivo**: Recargar, Salir
- **Editar**: Deshacer, Copiar, Pegar, etc.
- **Ver**: Pantalla completa, Zoom
- **Ayuda**: Acerca de

### Seguridad
- ✅ `contextIsolation: true`
- ✅ `nodeIntegration: false`
- ✅ Script `preload.js` como bridge seguro
- ✅ Previene múltiples instancias

---

## 📦 Crear Instalador

### Windows (.exe)

```bash
cd desktop
npm run electron:build:win
```

Genera en `desktop/release/`:
- `Sistema de Inventario Setup X.X.X.exe` (instalador NSIS)

### macOS (.dmg)

```bash
npm run electron:build:mac
```

### Linux (AppImage)

```bash
npm run electron:build:linux
```

---

## 🔧 Configuración

### Conectar a Backend Remoto

Edita `desktop/.env`:

```env
# Servidor local
VITE_API_URL=http://localhost:5000/api

# O servidor remoto
VITE_API_URL=https://tu-servidor.com/api
```

### Cambiar Puerto de Vite

Edita `desktop/vite.config.js`:

```js
server: {
  port: 5174,  // Cambiar aquí
  strictPort: true
}
```

---

## 🐛 Solución de Problemas

### Problema: "Cannot connect to backend"

**Solución**: Verificar que el backend esté corriendo:
```bash
cd backend
npm start
```

### Problema: "Port 5174 already in use"

**Solución**: Matar el proceso:
```bash
# Windows
netstat -ano | findstr :5174
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5174 | xargs kill
```

### Problema: Electron no abre

**Solución**: Reinstalar dependencias:
```bash
cd desktop
rm -rf node_modules
npm install
```

---

## 📊 Diferencias: Web vs Electron

| Característica | Web (frontend/) | Desktop (desktop/) |
|----------------|-----------------|-------------------|
| **Puerto** | 5173 | 5174 |
| **Ejecución** | Navegador | Ventana nativa |
| **Instalación** | No requiere | .exe/.dmg/AppImage |
| **Offline** | ❌ | ✅ (con backend local) |
| **Menú nativo** | ❌ | ✅ |
| **APIs nativas** | Limitadas | Completas |
| **Actualizaciones** | Refresh | Auto-update |

---

## 🎨 Personalización

### Cambiar Icono de la App

1. Reemplazar archivos en `desktop/public/`:
   - `icon.ico` (Windows, 256x256)
   - `icon.icns` (macOS)
   - `icon.png` (Linux, 512x512)

2. Reconstruir:
```bash
npm run electron:build
```

### Cambiar Nombre de la App

Edita `desktop/package.json`:

```json
{
  "name": "mi-inventario",
  "productName": "Mi Sistema de Inventario",
  "build": {
    "appId": "com.miempresa.inventario"
  }
}
```

---

## 📱 Distribución

### Requisitos del Sistema

**Windows:**
- Windows 7 SP1 / 8 / 10 / 11
- 4GB RAM
- 500MB espacio

**macOS:**
- macOS 10.10 (Yosemite) o superior
- 4GB RAM

**Linux:**
- Ubuntu 18.04+ / Debian 9+ / Fedora 28+
- 4GB RAM

### Instalación para Usuarios

1. Descargar instalador desde `desktop/release/`
2. Ejecutar instalador
3. Seguir asistente de instalación
4. Iniciar aplicación desde:
   - **Windows**: Menú Inicio o Escritorio
   - **macOS**: Aplicaciones
   - **Linux**: Menú de aplicaciones

---

## 🔥 Comandos Rápidos

```bash
# Desarrollo
cd desktop && npm run dev

# Build para producción
npm run build

# Crear instalador Windows
npm run electron:build:win

# Limpiar y reinstalar
rm -rf node_modules dist release && npm install

# Ver logs detallados
DEBUG=* npm run dev
```

---

## ✨ Próximos Pasos

1. **Ejecutar la app**: `npm run dev` en `desktop/`
2. **Probar login**: `admin@gmail.com` / `admin`
3. **Verificar funcionalidades**: Todas las del frontend web
4. **Crear instalador**: `npm run electron:build:win`

---

## 📞 Soporte

- **Backend**: Puerto 5000
- **Frontend Web**: Puerto 5173
- **Desktop Electron**: Puerto 5174 (dev)

¡La aplicación de escritorio está lista para usar! 🎉
