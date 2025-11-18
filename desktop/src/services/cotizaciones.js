// services/cotizaciones.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { error: errorText || 'Error en el servidor' };
    }
    throw new Error(error.error || error.message || 'Error en la petición');
  }
  
  return response.json();
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const cotizacionesService = {
  getAll: async (filtros = {}) => {
    const filtrosLimpios = Object.fromEntries(
      Object.entries(filtros).filter(([key, value]) => value && value.trim && value.trim() !== '')
    );
    
    const params = new URLSearchParams(filtrosLimpios).toString();
    const url = `${API_URL}/cotizaciones${params ? `?${params}` : ''}`;
    
    const response = await fetch(url, { 
      headers: {
        ...getHeaders(),
        'Cache-Control': 'no-cache'
      }
    });
    return handleResponse(response);
  },

  getVencidas: async () => {
    const response = await fetch(`${API_URL}/cotizaciones/vencidas`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/cotizaciones/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (cotizacionData) => {
    const response = await fetch(`${API_URL}/cotizaciones`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(cotizacionData)
    });
    return handleResponse(response);
  },

  update: async (id, cotizacionData) => {
    const response = await fetch(`${API_URL}/cotizaciones/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(cotizacionData)
    });
    return handleResponse(response);
  },

  aprobar: async (id) => {
    const response = await fetch(`${API_URL}/cotizaciones/${id}/aprobar`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  rechazar: async (id, motivo) => {
    const response = await fetch(`${API_URL}/cotizaciones/${id}/rechazar`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ motivo })
    });
    return handleResponse(response);
  },

  convertirAVenta: async (id, metodoPago = 'efectivo') => {
    const response = await fetch(`${API_URL}/cotizaciones/${id}/convertir-venta`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ metodoPago })
    });
    return handleResponse(response);
  }
};

export default cotizacionesService;
