// Configuración de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Función helper para manejar respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error en el servidor' }));
    throw new Error(error.message || 'Error en la petición');
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

  create: async (clienteData) => {
    const response = await fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(clienteData)
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
  clientes: clientesAPI
};
