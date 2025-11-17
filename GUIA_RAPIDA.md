# 🚀 GUÍA RÁPIDA DE USO - SISTEMA DE INVENTARIO COMPLETO

## 📋 Tabla de Contenidos
1. [Inicio Rápido](#inicio-rápido)
2. [Flujo de Trabajo Típico](#flujo-de-trabajo-típico)
3. [Ejemplos de Uso API](#ejemplos-de-uso-api)
4. [Mantenimiento](#mantenimiento)

---

## 🏁 Inicio Rápido

### 1. Instalación y Configuración

```bash
# Backend
cd backend
npm install
npm run inicializar-permisos  # Primera vez

# Frontend
cd frontend
npm install
```

### 2. Configurar MongoDB
El archivo `.env` ya está configurado con MongoDB Atlas. Verifica que la conexión funcione:
```
MONGODB_URI=mongodb+srv://daryfernand7_db_user:6haEOLzt2hcWxQdm@cluster0.yjbhog9.mongodb.net/inventario?retryWrites=true&w=majority&appName=Cluster0
```

### 3. Iniciar Aplicación

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

---

## 📊 Flujo de Trabajo Típico

### **Escenario 1: Proceso Completo de Compra**

#### **Paso 1: Crear Orden de Compra**
```
Dashboard → Compras → Órdenes de Compra → Nueva Orden
- Seleccionar proveedor
- Agregar productos y cantidades
- Configurar condiciones de pago
- Estado: Borrador → Enviada
```

#### **Paso 2: Recibir Mercancía**
```
Órdenes de Compra → [Seleccionar orden] → Recibir Mercancía
- Registrar cantidad recibida
- Crear lotes con fechas de vencimiento
- Asignar ubicación (pasillo-estante-nivel)
- Estado cambia a: Parcial/Completa
```

#### **Paso 3: Convertir a Compra**
```
Orden Completa → Convertir a Compra
- Se crea registro de compra
- Se actualiza inventario automáticamente
- Se registra en auditoría
```

---

### **Escenario 2: Proceso de Venta con Cotización**

#### **Paso 1: Crear Cotización**
```
Dashboard → Ventas → Cotizaciones → Nueva Cotización
- Seleccionar cliente
- Agregar productos (verifica reservas disponibles)
- Aplicar descuentos
- Configurar validez (15 días por defecto)
```

#### **Paso 2: Enviar y Aprobar**
```
Cotización → Enviar al Cliente
Cliente aprueba → Marcar como Aprobada
```

#### **Paso 3: Convertir a Venta**
```
Cotización Aprobada → Convertir a Venta
- Se crea venta automáticamente
- Se descuenta inventario
- Se liberan/utilizan reservas si existen
- Se registra en auditoría
```

---

### **Escenario 3: Conteo Físico de Inventario**

#### **Paso 1: Planificar Conteo**
```
Inventario → Conteos Físicos → Nuevo Conteo
- Tipo: Completo / Cíclico / Por Categoría
- Seleccionar almacén
- Asignar responsables
- Estado: Planificado
```

#### **Paso 2: Realizar Conteo**
```
Conteo → Iniciar
- El sistema carga productos con stock del sistema
- Ingresar stock físico contado
- Registrar diferencias y motivos
- Estado: En Proceso
```

#### **Paso 3: Completar y Ajustar**
```
Conteo → Completar
- Revisar diferencias
- Aprobar ajustes
- Aplicar Ajustes → Actualiza inventario real
- Se registra en InventarioLog
```

---

### **Escenario 4: Gestión de Lotes y Vencimientos**

#### **Alertas Automáticas**
```bash
# Ejecutar verificación de alertas (configurar como tarea programada)
npm run verificar-alertas
```

**El sistema genera alertas para:**
- 🔴 Productos vencidos
- 🟡 Productos próximos a vencer (15 días)
- 🟠 Stock mínimo alcanzado
- ⚪ Stock agotado

#### **Gestionar Lotes**
```
Inventario → Lotes → Ver Próximos a Vencer
- Revisar lotes críticos
- Decidir acción: Liquidar / Retirar / Vender rápido
- Actualizar estado del lote
```

---

## 🔌 Ejemplos de Uso API

### **Autenticación**
```javascript
// Login
POST /api/auth/login
{
  "email": "admin@inventario.com",
  "password": "admin123"
}

// Respuesta
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "nombre": "Admin",
    "rol": "admin",
    "email": "admin@inventario.com"
  }
}

// Usar token en headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

### **Crear Producto con Variantes**

```javascript
// 1. Crear producto base
POST /api/productos
{
  "sku": "CAM-001",
  "nombre": "Camiseta Deportiva",
  "categoria": "64f1a2b3c4d5e6f7g8h9i0j1",
  "precio": 50,
  "precioMayoreo": 40,
  "cantidadMayoreo": 10,
  "stockMinimo": 20,
  "stockMaximo": 200,
  "tieneVariantes": true,
  "almacen": "64f1a2b3c4d5e6f7g8h9i0j2",
  "ubicacion": {
    "pasillo": "A",
    "estante": "3",
    "nivel": "2"
  }
}

// 2. Crear variantes
POST /api/variantes
{
  "producto": "64f1a2b3c4d5e6f7g8h9i0j3",
  "sku": "CAM-001-R-M",
  "nombre": "Camiseta Deportiva Roja M",
  "atributos": [
    { "tipo": "color", "valor": "rojo" },
    { "tipo": "talla", "valor": "M" }
  ],
  "precio": 50,
  "precioMayoreo": 40,
  "stock": 10
}
```

---

### **Crear Orden de Compra**

```javascript
POST /api/ordenes-compra
{
  "proveedor": "64f1a2b3c4d5e6f7g8h9i0j4",
  "almacen": "64f1a2b3c4d5e6f7g8h9i0j2",
  "productos": [
    {
      "producto": "64f1a2b3c4d5e6f7g8h9i0j3",
      "cantidad": 100,
      "precioUnitario": 30,
      "subtotal": 3000
    }
  ],
  "subtotal": 3000,
  "impuestos": 540,
  "total": 3540,
  "fechaEntregaEstimada": "2025-12-01",
  "condicionesPago": "30 días crédito",
  "diasCredito": 30
}
```

---

### **Recibir Mercancía**

```javascript
POST /api/ordenes-compra/{ordenId}/recepciones
{
  "productos": [
    {
      "producto": "64f1a2b3c4d5e6f7g8h9i0j3",
      "cantidadRecibida": 95,
      "cantidadRechazada": 5,
      "motivoRechazo": "Productos defectuosos",
      "lote": "LOT-2025-001"  // Crear lote primero
    }
  ],
  "observaciones": "Recibido con algunas unidades dañadas"
}
```

---

### **Crear Cotización**

```javascript
POST /api/cotizaciones
{
  "cliente": "64f1a2b3c4d5e6f7g8h9i0j5",
  "productos": [
    {
      "producto": "64f1a2b3c4d5e6f7g8h9i0j3",
      "cantidad": 50,
      "precioUnitario": 50,
      "descuento": 10,  // 10%
      "subtotal": 2250
    }
  ],
  "subtotal": 2250,
  "impuestos": 405,
  "descuentoGlobal": 100,
  "total": 2555,
  "validezDias": 15,
  "condicionesPago": "50% adelanto, 50% contra entrega",
  "tiempoEntrega": "3-5 días hábiles"
}

// Convertir a venta cuando se apruebe
POST /api/cotizaciones/{cotizacionId}/convertir-venta
{
  "metodoPago": "transferencia"
}
```

---

### **Reservar Stock**

```javascript
POST /api/reservas
{
  "producto": "64f1a2b3c4d5e6f7g8h9i0j3",
  "almacen": "64f1a2b3c4d5e6f7g8h9i0j2",
  "cantidad": 20,
  "tipo": "cotizacion",
  "referencia": "64f1a2b3c4d5e6f7g8h9i0j6",  // ID de cotización
  "cliente": "64f1a2b3c4d5e6f7g8h9i0j5",
  "fechaVencimiento": "2025-11-30",
  "prioridad": "alta"
}
```

---

### **Reportes**

```javascript
// Valorización de inventario
GET /api/reportes/valorizacion?almacen={almacenId}

// Productos más vendidos (últimos 30 días)
GET /api/reportes/mas-vendidos?fechaInicio=2025-10-01&fechaFin=2025-10-31&limit=20

// Rotación de inventario
GET /api/reportes/rotacion?fechaInicio=2025-01-01&fechaFin=2025-10-31

// Productos de rotación lenta (sin movimiento en 90 días)
GET /api/reportes/rotacion-lenta?dias=90

// Márgenes de ganancia
GET /api/reportes/margenes?fechaInicio=2025-10-01&fechaFin=2025-10-31

// Proyección de compras (próximos 30 días)
GET /api/reportes/proyeccion-compras?dias=30&diasHistorico=90
```

---

## 🔧 Mantenimiento

### **Tareas Programadas Recomendadas**

#### **1. Verificar Alertas (Diario)**
```bash
# Linux/Mac - Crontab
0 8 * * * cd /ruta/backend && node verificarAlertas.js

# Windows - Task Scheduler
- Programa: node
- Argumentos: verificarAlertas.js
- Directorio: C:\ruta\backend
- Horario: Diariamente 8:00 AM
```

#### **2. Backup de Base de Datos (Diario)**
```bash
# MongoDB Atlas tiene backups automáticos
# Opcional: Exportar localmente
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)
```

#### **3. Limpieza de Auditoría (Mensual)**
```javascript
// Eliminar registros de auditoría antiguos (>6 meses)
db.auditorias.deleteMany({
  fechaHora: { $lt: new Date(Date.now() - 180*24*60*60*1000) }
})
```

---

### **Monitoreo**

#### **Métricas Clave**
```javascript
// Dashboard debe mostrar:
- Total productos en stock
- Valor total del inventario
- Productos bajo stock mínimo
- Alertas activas (críticas/altas)
- Lotes próximos a vencer (7 días)
- Órdenes de compra pendientes
- Reservas activas
```

#### **Logs del Sistema**
```bash
# Ver logs del servidor
tail -f backend/logs/server.log  # Si implementas logging a archivo

# Ver actividad reciente en auditoría
GET /api/auditoria?limit=50
```

---

## 📱 Roles y Permisos

### **Roles Disponibles**

| Rol | Descripción | Permisos Principales |
|-----|-------------|---------------------|
| **admin** | Acceso total | Todo |
| **gestor_ventas** | Gestión de ventas | Ventas, Cotizaciones, Clientes |
| **gestor_compras** | Gestión de compras | Compras, Órdenes, Proveedores, Productos |
| **admin_inventario** | Gestión de inventario | Inventario, Conteos, Traslados, Ajustes |
| **empleado** | Operaciones básicas | Ver productos, Crear ventas/cotizaciones |
| **auditor** | Solo lectura | Ver todo, Reportes, Auditoría |

---

## 🎯 Mejores Prácticas

### **1. Gestión de Lotes**
- ✅ Siempre registrar lotes para productos perecederos
- ✅ Usar FIFO (First In, First Out) para productos con vencimiento
- ✅ Revisar alertas de vencimiento semanalmente

### **2. Conteos Físicos**
- ✅ Hacer conteo completo: Mensual o trimestral
- ✅ Conteo cíclico: Semanal (productos de alta rotación)
- ✅ Documentar todas las diferencias

### **3. Órdenes de Compra**
- ✅ Usar órdenes de compra para todas las compras >$500
- ✅ Verificar mercancía al recibirla
- ✅ Documentar productos rechazados

### **4. Reservas de Stock**
- ✅ Reservar stock para cotizaciones importantes
- ✅ Configurar vencimiento apropiado (5-15 días)
- ✅ Liberar reservas no utilizadas promptamente

### **5. Reportes**
- ✅ Revisar valorización mensualmente
- ✅ Analizar rotación trimestralmente
- ✅ Usar proyecciones para planificar compras

---

## 📞 Soporte

**Documentación Completa**: Ver `NUEVAS_FUNCIONALIDADES.md`

**API Reference**: Todas las rutas están documentadas en el archivo de funcionalidades

**Issues Comunes**: Ver sección de troubleshooting en documentación principal

---

**Versión del Sistema**: 2.0.0  
**Última Actualización**: Noviembre 2025
