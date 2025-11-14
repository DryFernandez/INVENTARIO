# 🚀 Instrucciones de Despliegue

## Desarrollo Local

### Primera vez

```bash
# Backend
cd backend
npm install
# Crear archivo .env con las variables necesarias
npm start

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

### Ejecución Diaria

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🌐 Despliegue en Producción

### Opción 1: Vercel (Frontend) + Railway (Backend)

#### Backend en Railway

1. Crear cuenta en [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Seleccionar el repositorio
4. Configurar variables de entorno:
   ```
   MONGODB_URI=tu_mongodb_connection_string
   JWT_SECRET=tu_secret_key
   PORT=5000
   ```
5. Railway desplegará automáticamente

#### Frontend en Vercel

1. Crear cuenta en [Vercel](https://vercel.com)
2. Click "New Project"
3. Importar repositorio de GitHub
4. Configurar:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Variables de entorno:
   ```
   VITE_API_URL=https://tu-backend-railway.app
   ```
6. Deploy

### Opción 2: Heroku (Backend + Frontend)

#### Preparar el proyecto

Crear `Procfile` en la raíz:
```
web: cd backend && npm start
```

Crear `package.json` en la raíz:
```json
{
  "name": "inventario-app",
  "version": "1.0.0",
  "scripts": {
    "start": "cd backend && npm start",
    "build": "cd frontend && npm run build",
    "install": "cd backend && npm install && cd ../frontend && npm install"
  }
}
```

#### Desplegar

```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Crear app
heroku create nombre-de-tu-app

# Configurar variables
heroku config:set MONGODB_URI=tu_mongodb_uri
heroku config:set JWT_SECRET=tu_secret

# Deploy
git push heroku main
```

### Opción 3: VPS (DigitalOcean, AWS, etc.)

#### Requisitos del servidor

- Ubuntu 20.04+
- Node.js 14+
- MongoDB
- Nginx (como reverse proxy)

#### Paso 1: Configurar el servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2 (para mantener la app corriendo)
sudo npm install -g pm2
```

#### Paso 2: Clonar y configurar el proyecto

```bash
# Ir al directorio de aplicaciones
cd /var/www

# Clonar repositorio
git clone tu-repositorio.git inventario
cd inventario

# Backend
cd backend
npm install
# Crear .env
sudo nano .env
# Agregar variables:
# MONGODB_URI=mongodb://localhost:27017/inventario
# JWT_SECRET=tu_secret_muy_seguro
# PORT=5000

# Frontend
cd ../frontend
npm install
npm run build
```

#### Paso 3: Configurar PM2

```bash
cd /var/www/inventario/backend

# Iniciar backend con PM2
pm2 start Server.js --name inventario-backend

# Guardar configuración
pm2 save

# Configurar inicio automático
pm2 startup
```

#### Paso 4: Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/inventario
```

Agregar:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        root /var/www/inventario/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activar sitio:
```bash
sudo ln -s /etc/nginx/sites-available/inventario /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Paso 5: Configurar SSL (Opcional pero recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# Renovación automática
sudo certbot renew --dry-run
```

## 🔧 Configuración de MongoDB Atlas (Recomendado)

1. Ir a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear cuenta gratuita
3. Crear nuevo cluster (gratis hasta 512MB)
4. Configurar Database Access (crear usuario)
5. Configurar Network Access (permitir IPs)
6. Obtener connection string
7. Usar en las variables de entorno

Ejemplo de connection string:
```
mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/inventario?retryWrites=true&w=majority
```

## 📝 Variables de Entorno

### Backend (.env)

```env
# Puerto del servidor
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/inventario
# O para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/inventario

# JWT
JWT_SECRET=cambia_esto_por_algo_super_secreto_y_largo

# Entorno
NODE_ENV=production

# CORS (opcional)
ALLOWED_ORIGINS=https://tu-frontend.com,https://www.tu-frontend.com
```

### Frontend (.env)

```env
# URL del backend
VITE_API_URL=https://tu-backend.com
# O para desarrollo local:
# VITE_API_URL=http://localhost:5000
```

## ✅ Checklist Pre-Despliegue

- [ ] Cambiar JWT_SECRET a valor seguro
- [ ] Configurar CORS correctamente
- [ ] Probar todas las rutas del backend
- [ ] Probar el frontend en build mode (`npm run build`)
- [ ] Verificar variables de entorno
- [ ] Configurar MongoDB (local o Atlas)
- [ ] Crear backup de datos
- [ ] Documentar credenciales de admin
- [ ] Configurar SSL/HTTPS
- [ ] Probar en diferentes navegadores
- [ ] Probar en dispositivos móviles

## 🔍 Monitoreo y Mantenimiento

### Ver logs de PM2

```bash
pm2 logs inventario-backend
```

### Reiniciar aplicación

```bash
pm2 restart inventario-backend
```

### Estado de la aplicación

```bash
pm2 status
```

### Actualizar la aplicación

```bash
cd /var/www/inventario
git pull origin main
cd backend
npm install
cd ../frontend
npm install
npm run build
pm2 restart inventario-backend
```

## 🐛 Solución de Problemas Comunes

### Backend no inicia

```bash
# Ver logs
pm2 logs inventario-backend

# Verificar MongoDB
sudo systemctl status mongod

# Verificar puerto 5000
sudo netstat -tulpn | grep 5000
```

### Frontend muestra pantalla blanca

- Verificar que `npm run build` se ejecutó correctamente
- Verificar permisos de la carpeta `dist`
- Revisar console del navegador para errores
- Verificar que VITE_API_URL esté correcto

### Error de CORS

- Verificar ALLOWED_ORIGINS en backend
- Asegurarse que frontend usa la URL correcta del backend

## 📊 Métricas y Analytics (Opcional)

Considera agregar:
- Google Analytics
- Sentry (para tracking de errores)
- New Relic (para performance)
- LogRocket (para sesiones de usuario)

---

**¡Buena suerte con el despliegue!** 🚀

Si tienes problemas, revisa la documentación oficial de cada plataforma o contacta soporte.
