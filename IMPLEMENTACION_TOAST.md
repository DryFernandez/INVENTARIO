# Guía de Implementación de Toast y ConfirmDialog

## Archivos ya actualizados:
- ✅ Categorias.jsx
- ✅ Toast.jsx y Toast.css creados
- ✅ ConfirmDialog.jsx y ConfirmDialog.css creados
- ✅ ToastContext.jsx creado
- ✅ main.jsx actualizado con ToastProvider
- ✅ useToast.js creado (hook local, ahora usar ToastContext)

## Para cada archivo .jsx que use alert() o window.confirm():

### 1. Agregar imports:
```javascript
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../context/ToastContext';
```

### 2. En el componente, agregar:
```javascript
const { success, error, warning, info } = useToast();
const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, item: null });
```

### 3. Reemplazar alerts:
```javascript
// Antes:
alert('Operación exitosa');
// Después:
success('Operación exitosa');

// Antes:
alert('Error al cargar datos');
// Después:
error('Error al cargar datos');
```

### 4. Reemplazar window.confirm:
```javascript
// Antes:
if (window.confirm('¿Eliminar?')) {
  await deleteItem();
}

// Después:
const handleDelete = (item) => {
  setConfirmDialog({ isOpen: true, item });
};

const confirmDelete = async () => {
  try {
    await deleteItem(confirmDialog.item._id);
    success('Eliminado exitosamente');
    setConfirmDialog({ isOpen: false, item: null });
  } catch (err) {
    error('Error al eliminar');
  }
};
```

### 5. Agregar ConfirmDialog en el return:
```javascript
<ConfirmDialog
  isOpen={confirmDialog.isOpen}
  title="Confirmar eliminación"
  message={`¿Estás seguro de eliminar "${confirmDialog.item?.nombre}"?`}
  onConfirm={confirmDelete}
  onCancel={() => setConfirmDialog({ isOpen: false, item: null })}
  confirmText="Eliminar"
  cancelText="Cancelar"
  type="danger"
/>
```

## Archivos pendientes de actualizar:
- Productos.jsx (parcialmente actualizado)
- Almacenes.jsx
- Clientes.jsx
- Proveedores.jsx  
- Usuarios.jsx
- Ventas.jsx
- Compras.jsx
- Perfil.jsx
- OrdenesCompra.jsx
- Cotizaciones.jsx
- Alertas.jsx
- ConteosFisicos.jsx
- Kardex.jsx
- Lotes.jsx
- Reportes.jsx
- ComprasRegistradas.jsx
- VentasRegistradas.jsx
