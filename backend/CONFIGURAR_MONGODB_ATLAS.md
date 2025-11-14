# 🍃 Configurar MongoDB Atlas

## Paso 1: Crear cuenta en MongoDB Atlas

1. Ve a [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Regístrate con Google, GitHub o email
3. Completa el cuestionario inicial (puedes saltarlo)

## Paso 2: Crear un Cluster (Gratis)

1. Click en **"Build a Database"** o **"Create"**
2. Selecciona **"M0 FREE"** (512MB gratis)
3. Selecciona un proveedor y región:
   - **Provider**: AWS, Google Cloud o Azure
   - **Region**: Elige la más cercana a ti (ej: `us-east-1`, `us-west-1`)
4. **Cluster Name**: déjalo como `Cluster0` o cámbialo a `inventario-cluster`
5. Click en **"Create Cluster"** (toma 1-3 minutos)

## Paso 3: Configurar Database Access (Usuario)

1. En el menú lateral, ve a **"Database Access"** (bajo Security)
2. Click en **"Add New Database User"**
3. Completa:
   - **Authentication Method**: Password
   - **Username**: `inventario_admin` (o el que prefieras)
   - **Password**: Genera una contraseña segura o crea la tuya
   - **¡IMPORTANTE!**: Guarda este usuario y contraseña
4. **Database User Privileges**: Selecciona **"Read and write to any database"**
5. Click en **"Add User"**

## Paso 4: Configurar Network Access (IP Whitelist)

1. En el menú lateral, ve a **"Network Access"** (bajo Security)
2. Click en **"Add IP Address"**
3. Tienes dos opciones:
   
   **Opción A - Permitir desde cualquier IP (para desarrollo):**
   - Click en **"Allow Access from Anywhere"**
   - Esto agrega `0.0.0.0/0`
   - Click en **"Confirm"**
   
   **Opción B - Solo tu IP (más seguro):**
   - Click en **"Add Current IP Address"**
   - Click en **"Confirm"**

## Paso 5: Obtener Connection String

1. Ve a **"Database"** en el menú lateral
2. En tu cluster, click en **"Connect"**
3. Selecciona **"Connect your application"**
4. Asegúrate que esté seleccionado:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
5. Copia el **Connection String**:
   ```
   mongodb+srv://inventario_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Paso 6: Configurar el archivo .env

1. Abre el archivo `.env` en la carpeta `backend`
2. Reemplaza la línea de `MONGODB_URI` con tu connection string
3. **IMPORTANTE**: Reemplaza `<password>` con la contraseña que creaste
4. Agrega el nombre de la base de datos después de `.net/`:

**ANTES:**
```
mongodb+srv://inventario_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**DESPUÉS:**
```
mongodb+srv://inventario_admin:TU_PASSWORD_AQUI@cluster0.xxxxx.mongodb.net/inventario?retryWrites=true&w=majority
```

Ejemplo completo del `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://inventario_admin:MiPassword123@cluster0.abc123.mongodb.net/inventario?retryWrites=true&w=majority
JWT_SECRET=mi_clave_secreta_super_segura_12345
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Paso 7: Probar la conexión

1. Guarda el archivo `.env`
2. En la terminal, ve a la carpeta backend:
   ```bash
   cd backend
   ```
3. Inicia el servidor:
   ```bash
   npm start
   ```
4. Deberías ver:
   ```
   ✅ Conectado a MongoDB
   🖥️ Servidor escuchando en http://localhost:5000
   ```

## 🎉 ¡Listo!

Tu backend ahora está conectado a MongoDB Atlas en la nube.

## 🔧 Verificar en MongoDB Atlas

1. Ve a **"Database"** → **"Browse Collections"**
2. Verás la base de datos `inventario` cuando se creen los primeros documentos
3. Podrás ver y editar datos directamente desde la interfaz web

## ⚠️ Solución de Problemas

### Error: "Authentication failed"
- Verifica que el usuario y contraseña sean correctos
- Asegúrate de no tener caracteres especiales sin codificar en la contraseña

### Error: "Connection timeout"
- Verifica que tu IP esté en la whitelist
- Prueba agregar `0.0.0.0/0` en Network Access

### Error: "ENOTFOUND"
- Verifica que el connection string esté completo
- Asegúrate de tener conexión a internet

## 📝 Notas Importantes

- ✅ El tier gratuito incluye 512MB de almacenamiento
- ✅ Es perfecto para desarrollo y proyectos pequeños
- ✅ Incluye backups automáticos
- ✅ No requiere tarjeta de crédito
- ⚠️ Cambia `JWT_SECRET` en producción por algo más seguro
- ⚠️ El archivo `.env` NO debe subirse a GitHub (ya está en .gitignore)

## 🔐 Seguridad

Para producción:
1. Cambia `ALLOWED_ORIGINS` a tu dominio real
2. Usa IPs específicas en Network Access (no 0.0.0.0/0)
3. Genera un JWT_SECRET largo y aleatorio
4. Usa variables de entorno en tu servicio de hosting

---

**¿Necesitas ayuda?** Revisa la [documentación oficial de MongoDB Atlas](https://docs.atlas.mongodb.com/)
