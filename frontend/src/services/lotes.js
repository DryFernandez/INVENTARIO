// services/lotes.js
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

export const lotesService = {
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    const response = await fetch(`${API_URL}/lotes${params ? `?${params}` : ''}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getProximosVencer: async (dias = 30) => {
    const response = await fetch(`${API_URL}/lotes/proximos-vencer?dias=${dias}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (loteData) => {
    const response = await fetch(`${API_URL}/lotes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(loteData)
    });
    return handleResponse(response);
  },

  update: async (id, loteData) => {
    const response = await fetch(`${API_URL}/lotes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(loteData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/lotes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export default lotesService;
