// services/conteosFisicos.js
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

export const conteosFisicosService = {
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    const response = await fetch(`${API_URL}/conteos-fisicos${params ? `?${params}` : ''}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/conteos-fisicos/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (conteoData) => {
    const response = await fetch(`${API_URL}/conteos-fisicos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(conteoData)
    });
    return handleResponse(response);
  },

  iniciar: async (id) => {
    const response = await fetch(`${API_URL}/conteos-fisicos/${id}/iniciar`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  registrarItem: async (id, itemId, itemData) => {
    const response = await fetch(`${API_URL}/conteos-fisicos/${id}/items/${itemId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(itemData)
    });
    return handleResponse(response);
  },

  completar: async (id) => {
    const response = await fetch(`${API_URL}/conteos-fisicos/${id}/completar`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  ajustar: async (id) => {
    const response = await fetch(`${API_URL}/conteos-fisicos/${id}/ajustar`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export default conteosFisicosService;
