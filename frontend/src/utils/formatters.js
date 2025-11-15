// Función para formatear números grandes
export const formatearNumero = (numero) => {
  if (!numero && numero !== 0) return '0.00';
  
  const num = parseFloat(numero);
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(2);
};

// Función para formatear moneda con K/M
export const formatearMoneda = (numero) => {
  return `$${formatearNumero(numero)}`;
};

// Función para formatear moneda completa (sin K/M)
export const formatearMonedaCompleta = (numero) => {
  if (!numero && numero !== 0) return '$0.00';
  return `$${parseFloat(numero).toFixed(2)}`;
};
