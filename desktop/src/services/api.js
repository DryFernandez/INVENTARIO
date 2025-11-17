// Configuración de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Función helper para manejar respuestas
const handleResponse = async (response) => {
  // Si es 401 (No autorizado), limpiar sesión y redirigir al login
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error en el servidor' }));
    // Si hay detalles de validación, incluirlos en el mensaje
    if (error.details && Array.isArray(error.details)) {
      throw new Error(`${error.error || 'Error'}: ${error.details.join(', ')}`);
    }
    throw new Error(error.error || error.message || 'Error en la petición');
  }
  return response.json();
};

// Helper para obtener el token
const getToken = () => localStorage.getItem('token');

// Headers con autenticación
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// ==================== AUTH ====================
export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await handleResponse(response);
    return {
      token: data.token,
      user: data.data
    };
  },

  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  }
};

// ==================== PRODUCTOS ====================
export const productosAPI = {
  // Obtener todos los productos
  getAll: async () => {
    const response = await fetch(`${API_URL}/productos`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Obtener un producto por ID
  getById: async (id) => {
    const response = await fetch(`${API_URL}/productos/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Crear producto
  create: async (productoData) => {
    const response = await fetch(`${API_URL}/productos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productoData)
    });
    return handleResponse(response);
  },

  // Actualizar producto
  update: async (id, productoData) => {
    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productoData)
    });
    return handleResponse(response);
  },

  // Eliminar producto
  delete: async (id) => {
    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// ==================== CATEGORÍAS ====================
export const categoriasAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/categorias`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (categoriaData) => {
    const response = await fetch(`${API_URL}/categorias`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoriaData)
    });
    return handleResponse(response);
  },

  update: async (id, categoriaData) => {
    const response = await fetch(`${API_URL}/categorias/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(categoriaData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/categorias/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// ==================== VENTAS ====================
export const ventasAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/ventas`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (ventaData) => {
    const response = await fetch(`${API_URL}/ventas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(ventaData)
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/ventas/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// ==================== COMPRAS ====================
export const comprasAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/compras`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (compraData) => {
    const response = await fetch(`${API_URL}/compras`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(compraData)
    });
    return handleResponse(response);
  },

  update: async (id, compraData) => {
    const response = await fetch(`${API_URL}/compras/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(compraData)
    });
    return handleResponse(response);
  }
};

// ==================== ALMACENES ====================
export const almacenesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/almacenes`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (almacenData) => {
    const response = await fetch(`${API_URL}/almacenes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(almacenData)
    });
    return handleResponse(response);
  },

  update: async (id, almacenData) => {
    const response = await fetch(`${API_URL}/almacenes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(almacenData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/almacenes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// ==================== PROVEEDORES ====================
export const proveedoresAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/proveedores`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (proveedorData) => {
    const response = await fetch(`${API_URL}/proveedores`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(proveedorData)
    });
    return handleResponse(response);
  },

  update: async (id, proveedorData) => {
    const response = await fetch(`${API_URL}/proveedores/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(proveedorData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/proveedores/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// ==================== CLIENTES ====================
export const clientesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/clientes`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (clienteData) => {
    const response = await fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(clienteData)
    });
    return handleResponse(response);
  },

  update: async (id, clienteData) => {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(clienteData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// ==================== TRASLADOS ====================
export const trasladosAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/traslados`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (trasladoData) => {
    const response = await fetch(`${API_URL}/traslados`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(trasladoData)
    });
    return handleResponse(response);
  },

  completar: async (id) => {
    const response = await fetch(`${API_URL}/traslados/${id}/completar`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// ==================== INVENTARIO POR ALMACÉN ====================
export const inventarioAlmacenAPI = {
  // Obtener todo el inventario
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_URL}/inventario-almacen${queryParams ? `?${queryParams}` : ''}`;
    const response = await fetch(url, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Obtener inventario de un almacén específico
  getByAlmacen: async (almacenId) => {
    const response = await fetch(`${API_URL}/inventario-almacen/almacen/${almacenId}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Agregar producto a almacén
  create: async (data) => {
    const response = await fetch(`${API_URL}/inventario-almacen`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  // Ajustar stock
  ajustarStock: async (id, cantidad, tipo, detalle) => {
    const response = await fetch(`${API_URL}/inventario-almacen/${id}/stock`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ cantidad, tipo, detalle })
    });
    return handleResponse(response);
  },

  // Actualizar configuración
  update: async (id, data) => {
    const response = await fetch(`${API_URL}/inventario-almacen/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  // Eliminar producto del almacén
  delete: async (id) => {
    const response = await fetch(`${API_URL}/inventario-almacen/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Obtener estadísticas
  getEstadisticas: async () => {
    const response = await fetch(`${API_URL}/inventario-almacen/estadisticas/general`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export default {
  auth: authAPI,
  productos: productosAPI,
  categorias: categoriasAPI,
  ventas: ventasAPI,
  compras: comprasAPI,
  almacenes: almacenesAPI,
  proveedores: proveedoresAPI,
  clientes: clientesAPI,
  traslados: trasladosAPI,
  inventarioAlmacen: inventarioAlmacenAPI
};
