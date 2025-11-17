// services/auditoria.js
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

export const auditoriaService = {
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    const response = await fetch(`${API_URL}/auditoria${params ? `?${params}` : ''}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getByEntidad: async (tipo, id) => {
    const response = await fetch(`${API_URL}/auditoria/entidad/${tipo}/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getByUsuario: async (id, filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    const response = await fetch(`${API_URL}/auditoria/usuario/${id}${params ? `?${params}` : ''}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getEstadisticas: async (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    const response = await fetch(`${API_URL}/auditoria/estadisticas${params ? `?${params}` : ''}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export default auditoriaService;
