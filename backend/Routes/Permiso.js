// Routes/Permiso.js
const express = require('express');
const router = express.Router();
const Permiso = require('../Models/Permiso');
const { checkAuth: auth } = require('../Middlewares/auth');

// Obtener todos los permisos
router.get('/', auth, async (req, res) => {
  try {
    const permisos = await Permiso.find();
    res.json(permisos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener permisos por rol
router.get('/rol/:rol', auth, async (req, res) => {
  try {
    const permiso = await Permiso.findOne({ rol: req.params.rol });
    if (!permiso) return res.status(404).json({ error: 'Permisos no encontrados para este rol' });
    res.json(permiso);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear permisos para un rol
router.post('/', auth, async (req, res) => {
  try {
    const permiso = new Permiso(req.body);
    await permiso.save();
    res.status(201).json(permiso);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar permisos
router.put('/:id', auth, async (req, res) => {
  try {
    const permiso = await Permiso.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!permiso) return res.status(404).json({ error: 'Permiso no encontrado' });
    res.json(permiso);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verificar permiso específico
router.post('/verificar', auth, async (req, res) => {
  try {
    const { rol, modulo, accion } = req.body;
    
    const permiso = await Permiso.findOne({ rol });
    if (!permiso) return res.json({ permitido: false });
    
    const permitido = permiso.modulos[modulo]?.[accion] || false;
    res.json({ permitido });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
