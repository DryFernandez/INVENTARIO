const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../Models/Usuario');
const { validarRegistro } = require('../Validators/Auth');

// POST /auth/login - Autenticación de usuario
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validar campos obligatorios
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    // 2. Buscar usuario
    const usuario = await Usuario.findOne({ email }).select('+password');
    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // 3. Verificar contraseña
    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // 4. Generar JWT
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // 5. Responder sin password
    usuario.password = undefined;

    res.status(200).json({
      success: true,
      token,
      data: usuario
    });

  } catch (error) {
    console.error('Error en POST /auth/login:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor al iniciar sesión'
    });
  }
});

// POST /auth/registrar - Registro de nuevo usuario
router.post('/registrar', validarRegistro, async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // 1. Verificar si el email ya existe
    const existeUsuario = await Usuario.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    // 2. Hashear password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Crear usuario
    const usuario = await Usuario.create({
      nombre,
      email,
      password: hashedPassword,
      rol: rol || 'usuario' // Valor por defecto
    });

    // 4. Generar JWT
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // 5. Responder sin password
    usuario.password = undefined;

    res.status(201).json({
      success: true,
      token,
      data: usuario,
      message: 'Usuario registrado exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /auth/registrar:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error en el servidor al registrar usuario'
    });
  }
});

module.exports = router;