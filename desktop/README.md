# 🖥️ Sistema de Inventario - Aplicación de Escritorio

Aplicación de escritorio multiplataforma construida con Electron + React + Vite.

## 📋 Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- Backend corriendo en `http://localhost:5000`

## 🚀 Instalación

```bash
# Instalar dependencias
npm install
```

## 💻 Desarrollo

```bash
# Modo desarrollo (inicia Vite + Electron)
npm run dev

# Solo frontend (Vite)
npm run frontend:dev

# Solo Electron (requiere Vite corriendo)
npm run electron:dev
```

La aplicación se conectará al backend en `http://localhost:5000/api`.

## 📦 Construcción

```bash
# Build general (detecta plataforma)
npm run electron:build

# Build para Windows
npm run electron:build:win

# Build para macOS
npm run electron:build:mac

# Build para Linux
npm run electron:build:linux
```

Los instaladores se generarán en la carpeta `release/`.

## 🏗️ Estructura del Proyecto

```
desktop/
├── electron/              # Código de Electron
│   ├── main.js           # Proceso principal
│   └── preload.js        # Script preload (bridge seguro)
├── public/               # Recursos estáticos
├── src/                  # Código fuente React (copiado de frontend)
│   ├── app/             # Páginas/Vistas
│   ├── components/      # Componentes reutilizables
│   ├── services/        # Servicios API
│   ├── context/         # Context providers
│   ├── router/          # Configuración de rutas
│   ├── utils/           # Utilidades
│   └── main.jsx         # Punto de entrada
├── package.json
├── vite.config.js
└── .env
```

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

### Configuración de Build (package.json)

- **Windows**: Genera instalador NSIS (.exe)
- **macOS**: Genera imagen de disco (.dmg)
- **Linux**: Genera AppImage

## 🔧 Características

- ✅ Interfaz idéntica a la versión web
- ✅ Menú nativo de la aplicación
- ✅ Soporte para atajos de teclado
- ✅ Prevención de múltiples instancias
- ✅ Ventana maximizada por defecto
- ✅ DevTools en modo desarrollo
- ✅ Auto-actualización (configurar en producción)

## 🔌 Conexión con Backend

La aplicación se conecta al backend Node.js que debe estar corriendo:

```bash
cd ../backend
npm start
```

El backend debe estar en `http://localhost:5000`.

## 📱 Distribución

### Windows
El instalador permite:
- Elegir directorio de instalación
- Crear acceso directo en escritorio
- Crear acceso directo en menú inicio

### Requisitos del Sistema
- Windows 7+ / macOS 10.10+ / Linux (Ubuntu 18.04+)
- 4GB RAM mínimo
- 500MB espacio en disco

## 🛠️ Scripts Útiles

```bash
# Limpiar cache y reinstalar
rm -rf node_modules dist release
npm install

# Ver logs de Electron
npm run electron:dev
```

## 📄 Licencia

MIT
