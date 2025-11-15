// Configuración de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper para obtener el token
const getToken = () => localStorage.getItem('token');

// Headers con autenticación
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// Función helper para manejar respuestas
const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error en el servidor' }));
    if (error.details && Array.isArray(error.details)) {
      throw new Error(`${error.error || 'Error'}: ${error.details.join(', ')}`);
    }
    throw new Error(error.error || error.message || 'Error en la petición');
  }
  return response.json();
};

export const getAll = async () => {
  const response = await fetch(`${API_URL}/usuarios`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const getById = async (id) => {
  const response = await fetch(`${API_URL}/usuarios/${id}`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const create = async (data) => {
  const response = await fetch(`${API_URL}/usuarios/registrar`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const update = async (id, data) => {
  const response = await fetch(`${API_URL}/usuarios/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const remove = async (id) => {
  const response = await fetch(`${API_URL}/usuarios/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
};
