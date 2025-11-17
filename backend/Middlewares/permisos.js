// Middlewares/permisos.js
const Permiso = require('../Models/Permiso');
const Usuario = require('../Models/Usuario');

/**
 * Middleware para verificar permisos
 * @param {string} modulo - Módulo del sistema
 * @param {string} accion - Acción a verificar (ver, crear, editar, eliminar, etc.)
 */
const verificarPermiso = (modulo, accion) => {
  return async (req, res, next) => {
    try {
      // Admin siempre tiene todos los permisos
      if (req.usuario.rol === 'admin') {
        return next();
      }

      // Buscar permisos del rol del usuario
      const permiso = await Permiso.findOne({ rol: req.usuario.rol });
      
      if (!permiso) {
        return res.status(403).json({ 
          error: 'No se encontraron permisos para este rol' 
        });
      }

      // Verificar si tiene el permiso específico
      const tienePermiso = permiso.modulos[modulo]?.[accion];

      if (!tienePermiso) {
        return res.status(403).json({ 
          error: 'No tienes permisos para realizar esta acción',
          modulo,
          accion
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (cualquiera)
 */
const verificarAlgunPermiso = (permisos) => {
  return async (req, res, next) => {
    try {
      if (req.usuario.rol === 'admin') {
        return next();
      }

      const permiso = await Permiso.findOne({ rol: req.usuario.rol });
      if (!permiso) {
        return res.status(403).json({ error: 'No se encontraron permisos para este rol' });
      }

      const tieneAlgunPermiso = permisos.some(p => 
        permiso.modulos[p.modulo]?.[p.accion]
      );

      if (!tieneAlgunPermiso) {
        return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

/**
 * Middleware para verificar que el usuario solo acceda a sus propios datos
 */
const verificarPropietario = async (req, res, next) => {
  try {
    if (req.usuario.rol === 'admin') {
      return next();
    }

    // Verificar si está accediendo a sus propios datos
    if (req.params.id && req.params.id !== req.usuario.id) {
      return res.status(403).json({ 
        error: 'No tienes permisos para acceder a estos datos' 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  verificarPermiso, 
  verificarAlgunPermiso, 
  verificarPropietario 
};
