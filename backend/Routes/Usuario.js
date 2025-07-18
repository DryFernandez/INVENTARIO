const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../Models/Usuario');
const { validarUsuario } = require('../Validators/Usuario');
const { checkAuth, checkRol } = require('../Middlewares/auth');

// Roles permitidos
const ROLES = {
  ADMIN: 'admin',
  USUARIO: 'usuario',
  BODEGUERO: 'bodeguero',
  VENDEDOR: 'vendedor'
};

// POST /usuarios/registrar - Registro público de usuarios
router.post('/registrar', validarUsuario, async (req, res) => {
  try {
    const { email, password, rol = ROLES.USUARIO } = req.body;

    // Validar que el rol sea válido
    if (!Object.values(ROLES).includes(rol)) {
      return res.status(400).json({
        success: false,
        error: 'Rol no válido',
        rolesPermitidos: Object.values(ROLES)
      });
    }

    // Verificar si el email ya existe
    const existeUsuario = await Usuario.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    // Hashear password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      ...req.body,
      password: hashedPassword,
      estado: true
    });

    // Generar JWT
    const token = jwt.sign(
      { id: nuevoUsuario._id, rol: nuevoUsuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Omitir password en la respuesta
    const usuarioResponse = nuevoUsuario.toObject();
    delete usuarioResponse.password;

    res.status(201).json({
      success: true,
      token,
      data: usuarioResponse,
      message: 'Usuario registrado exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /usuarios/registrar:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Error de validación',
        details: errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al registrar el usuario',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /usuarios/login - Autenticación pública
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const usuario = await Usuario.findOne({ email }).select('+password');
    if (!usuario || !usuario.estado) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Omitir password en la respuesta
    const usuarioResponse = usuario.toObject();
    delete usuarioResponse.password;

    res.status(200).json({
      success: true,
      token,
      data: usuarioResponse,
      message: 'Inicio de sesión exitoso'
    });

  } catch (error) {
    console.error('Error en POST /usuarios/login:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor al iniciar sesión',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /usuarios - Obtener todos los usuarios (solo admin)
router.get('/', checkAuth, checkRol([ROLES.ADMIN]), async (req, res) => {
  try {
    const { limit = 20, page = 1, estado = 'true', rol } = req.query;

    // Construir query
    const query = {};
    if (estado !== undefined) query.estado = estado === 'true';
    if (rol) query.rol = rol;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      select: '-password', // Excluir password
      sort: '-fechaCreacion'
    };

    const usuarios = await Usuario.paginate(query, options);

    res.status(200).json({
      success: true,
      data: usuarios.docs,
      pagination: {
        total: usuarios.totalDocs,
        limit: usuarios.limit,
        page: usuarios.page,
        pages: usuarios.totalPages
      },
      rolesDisponibles: Object.values(ROLES)
    });

  } catch (error) {
    console.error('Error en GET /usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los usuarios',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /usuarios/:id - Actualizar usuario (propio o por admin)
router.put('/:id', checkAuth, validarUsuario, async (req, res) => {
  try {
    const { id } = req.params;
    const { password, email, rol } = req.body;
    const usuarioActual = req.user;

    // Verificar permisos (solo admin puede actualizar otros usuarios o cambiar roles)
    if (usuarioActual.id !== id && usuarioActual.rol !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para actualizar este usuario'
      });
    }

    // Solo admin puede cambiar roles
    if (rol && usuarioActual.rol !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        error: 'Solo un administrador puede cambiar roles'
      });
    }

    // Buscar usuario a actualizar
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar email único si se está cambiando
    if (email && email !== usuario.email) {
      const existeEmail = await Usuario.findOne({ email, _id: { $ne: id } });
      if (existeEmail) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está registrado'
        });
      }
    }

    // Hashear nueva contraseña si se proporciona
    let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Actualizar usuario
    const datosActualizacion = {
      ...req.body,
      ...(hashedPassword && { password: hashedPassword }),
      fechaActualizacion: new Date()
    };

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      datosActualizacion,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: usuarioActualizado,
      message: 'Usuario actualizado exitosamente'
    });

  } catch (error) {
    console.error(`Error en PUT /usuarios/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de usuario inválido'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Error de validación',
        details: errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el usuario',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /usuarios/:id - Desactivar usuario (solo admin)
router.delete('/:id', checkAuth, checkRol([ROLES.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir desactivarse a sí mismo
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes desactivar tu propia cuenta'
      });
    }

    const usuarioDesactivado = await Usuario.findByIdAndUpdate(
      id,
      { estado: false, fechaActualizacion: new Date() },
      { new: true }
    ).select('-password');

    if (!usuarioDesactivado) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: usuarioDesactivado,
      message: 'Usuario desactivado exitosamente'
    });

  } catch (error) {
    console.error(`Error en DELETE /usuarios/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de usuario inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al desactivar el usuario',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;