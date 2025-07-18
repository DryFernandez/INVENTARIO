const express = require('express');
const router = express.Router();
const Almacen = require('../Models/Almacen');
const { validarAlmacen } = require('../Validators/Almacen');
const { checkAuth, checkRol } = require('../Middlewares/auth');

// 1. GET / - Obtener todos los almacenes activos
router.get('/', async (req, res) => {
  try {
    const { limit, skip } = req.query;
    
    const query = Almacen.find({ estado: true });
    
    if (limit) {
      const limitNumber = parseInt(limit);
      if (!isNaN(limitNumber)) {
        query.limit(limitNumber);
      }
    }
    
    if (skip) {
      const skipNumber = parseInt(skip);
      if (!isNaN(skipNumber)) {
        query.skip(skipNumber);
      }
    }
    
    const almacenes = await query.exec();
    
    res.status(200).json({
      success: true,
      count: almacenes.length,
      data: almacenes
    });
    
  } catch (error) {
    console.error('Error en GET /almacenes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los almacenes'
    });
  }
});

// 2. GET /:id - Obtener un almacén específico
router.get('/:id', async (req, res) => {
  try {
    const almacen = await Almacen.findOne({
      _id: req.params.id,
      estado: true
    });
    
    if (!almacen) {
      return res.status(404).json({
        success: false,
        error: 'Almacén no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: almacen
    });
    
  } catch (error) {
    console.error(`Error en GET /almacenes/${req.params.id}:`, error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        error: 'ID de almacén inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener el almacén'
    });
  }
});

// 3. POST / - Crear nuevo almacén
router.post('/', 
  checkAuth, 
  checkRol(['admin']), 
  validarAlmacen, 
  async (req, res) => {
    try {
      const nuevoAlmacen = new Almacen({
        ...req.body,
        creadoPor: req.user.id
      });
      
      const almacenGuardado = await nuevoAlmacen.save();
      
      res.status(201).json({
        success: true,
        data: almacenGuardado,
        message: 'Almacén creado exitosamente'
      });
      
    } catch (error) {
      console.error('Error en POST /almacenes:', error);
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({
          success: false,
          error: messages
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al crear el almacén'
      });
    }
});

// 4. PUT /:id - Actualizar almacén
router.put('/:id', 
  checkAuth, 
  checkRol(['admin']), 
  validarAlmacen, 
  async (req, res) => {
    try {
      const almacenActualizado = await Almacen.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          actualizadoPor: req.user.id,
          fechaActualizacion: Date.now()
        },
        { new: true, runValidators: true }
      );
      
      if (!almacenActualizado || !almacenActualizado.estado) {
        return res.status(404).json({
          success: false,
          error: 'Almacén no encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        data: almacenActualizado,
        message: 'Almacén actualizado exitosamente'
      });
      
    } catch (error) {
      console.error(`Error en PUT /almacenes/${req.params.id}:`, error);
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({
          success: false,
          error: messages
        });
      }
      
      if (error.kind === 'ObjectId') {
        return res.status(400).json({
          success: false,
          error: 'ID de almacén inválido'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al actualizar el almacén'
      });
    }
});

// 5. DELETE /:id - Desactivar almacén (borrado lógico)
router.delete('/:id', 
  checkAuth, 
  checkRol(['admin']), 
  async (req, res) => {
    try {
      const almacenDesactivado = await Almacen.findByIdAndUpdate(
        req.params.id,
        {
          estado: false,
          actualizadoPor: req.user.id,
          fechaActualizacion: Date.now()
        },
        { new: true }
      );
      
      if (!almacenDesactivado) {
        return res.status(404).json({
          success: false,
          error: 'Almacén no encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        data: almacenDesactivado,
        message: 'Almacén desactivado exitosamente'
      });
      
    } catch (error) {
      console.error(`Error en DELETE /almacenes/${req.params.id}:`, error);
      
      if (error.kind === 'ObjectId') {
        return res.status(400).json({
          success: false,
          error: 'ID de almacén inválido'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al desactivar el almacén'
      });
    }
});

module.exports = router;