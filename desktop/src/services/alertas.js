// services/alertas.js
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

export const alertasService = {
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    const response = await fetch(`${API_URL}/alertas${params ? `?${params}` : ''}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getByUsuario: async (usuarioId) => {
    const response = await fetch(`${API_URL}/alertas/usuario/${usuarioId}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  generarAutomaticas: async () => {
    const response = await fetch(`${API_URL}/alertas/generar-automaticas`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  marcarLeida: async (id) => {
    const response = await fetch(`${API_URL}/alertas/${id}/leer`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  resolver: async (id, accionTomada) => {
    const response = await fetch(`${API_URL}/alertas/${id}/resolver`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ accionTomada })
    });
    return handleResponse(response);
  },

  ignorar: async (id) => {
    const response = await fetch(`${API_URL}/alertas/${id}/ignorar`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export default alertasService;
