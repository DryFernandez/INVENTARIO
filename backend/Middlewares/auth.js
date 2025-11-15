const jwt = require('jsonwebtoken');
const Usuario = require('../Models/Usuario');

module.exports = {
  checkAuth: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) throw new Error();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const usuario = await Usuario.findOne({ 
        _id: decoded.id, 
        activo: true 
      });
      
      if (!usuario) throw new Error();
      
      req.user = usuario;
      req.usuario = usuario; // Mantener compatibilidad
      next();
    } catch (error) {
      res.status(401).json({ 
        success: false,
        message: 'Autenticación requerida' 
      });
    }
  },

  checkRol: (roles) => (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        success: false,
        message: 'Acceso no autorizado' 
      });
    }
    next();
  }
};