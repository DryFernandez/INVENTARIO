// services/reportes.js
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

export const reportesService = {
  getValorizacion: async (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    const response = await fetch(`${API_URL}/reportes/valorizacion${params ? `?${params}` : ''}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getMasVendidos: async (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    const response = await fetch(`${API_URL}/reportes/mas-vendidos${params ? `?${params}` : ''}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getRotacion: async (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    const response = await fetch(`${API_URL}/reportes/rotacion${params ? `?${params}` : ''}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getRotacionLenta: async (dias = 90) => {
    const response = await fetch(`${API_URL}/reportes/rotacion-lenta?dias=${dias}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getMargenes: async (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    const response = await fetch(`${API_URL}/reportes/margenes${params ? `?${params}` : ''}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getProyeccionCompras: async (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    const response = await fetch(`${API_URL}/reportes/proyeccion-compras${params ? `?${params}` : ''}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export default reportesService;
