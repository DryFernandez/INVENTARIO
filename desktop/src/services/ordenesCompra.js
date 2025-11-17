// services/ordenesCompra.js
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

export const ordenesCompraService = {
  // Listar órdenes de compra
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    const response = await fetch(`${API_URL}/ordenes-compra${params ? `?${params}` : ''}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Obtener una orden
  getById: async (id) => {
    const response = await fetch(`${API_URL}/ordenes-compra/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Crear orden de compra
  create: async (ordenData) => {
    const response = await fetch(`${API_URL}/ordenes-compra`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(ordenData)
    });
    return handleResponse(response);
  },

  // Actualizar orden
  update: async (id, ordenData) => {
    const response = await fetch(`${API_URL}/ordenes-compra/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(ordenData)
    });
    return handleResponse(response);
  },

  // Recibir mercancía
  recibirMercancia: async (id, recepcionData) => {
    const response = await fetch(`${API_URL}/ordenes-compra/${id}/recepciones`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(recepcionData)
    });
    return handleResponse(response);
  },

  // Convertir a compra
  convertirACompra: async (id) => {
    const response = await fetch(`${API_URL}/ordenes-compra/${id}/convertir-compra`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Cancelar orden
  cancelar: async (id) => {
    const response = await fetch(`${API_URL}/ordenes-compra/${id}/cancelar`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export default ordenesCompraService;
