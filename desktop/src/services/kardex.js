// services/kardex.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }
  
  return response.json();
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

const kardexService = {
  // Obtener kardex de un producto
  getByProducto: async (productoId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_URL}/kardex/producto/${productoId}?${queryParams}`,
      {
        headers: getHeaders()
      }
    );
    return handleResponse(response);
  },

  // Obtener kardex de un almacén
  getByAlmacen: async (almacenId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_URL}/kardex/almacen/${almacenId}?${queryParams}`,
      {
        headers: getHeaders()
      }
    );
    return handleResponse(response);
  },

  // Registrar movimiento manual
  registrarMovimiento: async (data) => {
    const response = await fetch(`${API_URL}/kardex`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }
};

export default kardexService;
