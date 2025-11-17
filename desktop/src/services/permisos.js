// services/permisos.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error en el servidor' }));
    throw new Error(error.error || 'Error en la petición');
  }
  return response.json();
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const permisosService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/permisos`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getByRol: async (rol) => {
    const response = await fetch(`${API_URL}/permisos/rol/${rol}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (permisoData) => {
    const response = await fetch(`${API_URL}/permisos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(permisoData)
    });
    return handleResponse(response);
  },

  update: async (id, permisoData) => {
    const response = await fetch(`${API_URL}/permisos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(permisoData)
    });
    return handleResponse(response);
  },

  verificar: async (rol, modulo, accion) => {
    const response = await fetch(`${API_URL}/permisos/verificar`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rol, modulo, accion })
    });
    return handleResponse(response);
  }
};

export default permisosService;
