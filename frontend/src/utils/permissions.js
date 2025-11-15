// Sistema de permisos por rol

export const ROLES = {
  ADMIN: 'admin',
  GESTOR_VENTAS: 'gestor_ventas',
  GESTOR_COMPRAS: 'gestor_compras',
  ADMIN_INVENTARIO: 'admin_inventario',
  EMPLEADO: 'empleado'
};

// Definir permisos para cada módulo
export const PERMISSIONS = {
  // Dashboard - todos pueden ver
  dashboard: [ROLES.ADMIN, ROLES.GESTOR_VENTAS, ROLES.GESTOR_COMPRAS, ROLES.ADMIN_INVENTARIO, ROLES.EMPLEADO],
  
  // Productos
  productos_ver: [ROLES.ADMIN, ROLES.GESTOR_VENTAS, ROLES.GESTOR_COMPRAS, ROLES.ADMIN_INVENTARIO, ROLES.EMPLEADO],
  productos_crear: [ROLES.ADMIN, ROLES.ADMIN_INVENTARIO],
  productos_editar: [ROLES.ADMIN, ROLES.ADMIN_INVENTARIO],
  productos_eliminar: [ROLES.ADMIN, ROLES.ADMIN_INVENTARIO],
  
  // Categorías
  categorias_ver: [ROLES.ADMIN, ROLES.ADMIN_INVENTARIO],
  categorias_crear: [ROLES.ADMIN, ROLES.ADMIN_INVENTARIO],
  categorias_editar: [ROLES.ADMIN, ROLES.ADMIN_INVENTARIO],
  categorias_eliminar: [ROLES.ADMIN, ROLES.ADMIN_INVENTARIO],
  
  // Almacenes
  almacenes_ver: [ROLES.ADMIN, ROLES.ADMIN_INVENTARIO],
  almacenes_crear: [ROLES.ADMIN, ROLES.ADMIN_INVENTARIO],
  almacenes_editar: [ROLES.ADMIN, ROLES.ADMIN_INVENTARIO],
  almacenes_eliminar: [ROLES.ADMIN, ROLES.ADMIN_INVENTARIO],
  
  // Ventas
  ventas_ver: [ROLES.ADMIN, ROLES.GESTOR_VENTAS, ROLES.EMPLEADO],
  ventas_crear: [ROLES.ADMIN, ROLES.GESTOR_VENTAS, ROLES.EMPLEADO],
  ventas_registradas: [ROLES.ADMIN, ROLES.GESTOR_VENTAS],
  
  // Compras
  compras_ver: [ROLES.ADMIN, ROLES.GESTOR_COMPRAS],
  compras_crear: [ROLES.ADMIN, ROLES.GESTOR_COMPRAS],
  compras_registradas: [ROLES.ADMIN, ROLES.GESTOR_COMPRAS],
  
  // Proveedores
  proveedores_ver: [ROLES.ADMIN, ROLES.GESTOR_COMPRAS],
  proveedores_crear: [ROLES.ADMIN, ROLES.GESTOR_COMPRAS],
  proveedores_editar: [ROLES.ADMIN, ROLES.GESTOR_COMPRAS],
  proveedores_eliminar: [ROLES.ADMIN, ROLES.GESTOR_COMPRAS],
  
  // Clientes
  clientes_ver: [ROLES.ADMIN, ROLES.GESTOR_VENTAS, ROLES.EMPLEADO],
  clientes_crear: [ROLES.ADMIN, ROLES.GESTOR_VENTAS, ROLES.EMPLEADO],
  clientes_editar: [ROLES.ADMIN, ROLES.GESTOR_VENTAS],
  clientes_eliminar: [ROLES.ADMIN, ROLES.GESTOR_VENTAS],
  
  // Usuarios - solo admin
  usuarios_ver: [ROLES.ADMIN],
  usuarios_crear: [ROLES.ADMIN],
  usuarios_editar: [ROLES.ADMIN],
  usuarios_eliminar: [ROLES.ADMIN],
  
  // Perfil - todos
  perfil: [ROLES.ADMIN, ROLES.GESTOR_VENTAS, ROLES.GESTOR_COMPRAS, ROLES.ADMIN_INVENTARIO, ROLES.EMPLEADO]
};

// Función para verificar si un usuario tiene permiso
export const hasPermission = (permission, userRole) => {
  if (!userRole || !permission) return false;
  return PERMISSIONS[permission]?.includes(userRole) || false;
};

// Función para obtener el usuario actual
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
};

// Función para obtener el rol del usuario actual
export const getCurrentUserRole = () => {
  const user = getCurrentUser();
  return user?.rol || null;
};

// Verificar si el usuario actual tiene un permiso específico
export const canAccess = (permission) => {
  const userRole = getCurrentUserRole();
  return hasPermission(permission, userRole);
};

// Obtener las rutas permitidas para el usuario actual
export const getPermittedRoutes = () => {
  const userRole = getCurrentUserRole();
  if (!userRole) return [];
  
  const routes = [];
  
  // Dashboard
  if (hasPermission('dashboard', userRole)) routes.push('/');
  
  // Productos
  if (hasPermission('productos_ver', userRole)) routes.push('/productos');
  
  // Categorías
  if (hasPermission('categorias_ver', userRole)) routes.push('/categorias');
  
  // Almacenes
  if (hasPermission('almacenes_ver', userRole)) routes.push('/almacenes');
  
  // Ventas
  if (hasPermission('ventas_ver', userRole)) routes.push('/ventas');
  if (hasPermission('ventas_registradas', userRole)) routes.push('/ventas-registradas');
  
  // Compras
  if (hasPermission('compras_ver', userRole)) routes.push('/compras');
  if (hasPermission('compras_registradas', userRole)) routes.push('/compras-registradas');
  
  // Proveedores
  if (hasPermission('proveedores_ver', userRole)) routes.push('/proveedores');
  
  // Clientes
  if (hasPermission('clientes_ver', userRole)) routes.push('/clientes');
  
  // Usuarios
  if (hasPermission('usuarios_ver', userRole)) routes.push('/usuarios');
  
  // Perfil
  routes.push('/perfil');
  
  return routes;
};
