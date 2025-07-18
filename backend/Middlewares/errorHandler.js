exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log del error en consola

  // Errores de express-validator
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Error de validación',
      detalles: err.errors 
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }

  // Errores personalizados
  if (err.message === 'Stock insuficiente') {
    return res.status(400).json({ error: err.message });
  }

  // Error genérico
  res.status(500).json({ error: 'Error interno del servidor' });
};