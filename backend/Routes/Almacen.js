const express = require('express');
const router = express.Router();
const Almacen = require('../Models/Almacen');
const { validarAlmacen } = require('../Validators/Almacen');
const { checkAuth, checkRol } = require('../Middlewares/auth');

// 1. GET / - Obtener todos los almacenes activos
router.get('/', async (req, res) => {
  try {
    const almacenes = await Almacen.find({ activo: true }).sort({ nombre: 1 });
    res.status(200).json(almacenes);
  } catch (error) {
    console.error('Error en GET /almacenes:', error);
    res.status(500).json({ error: 'Error al obtener almacenes' });
  }
});

// 2. GET /:id - Obtener un almacén específico
router.get('/:id', async (req, res) => {
  try {
    const almacen = await Almacen.findOne({
      _id: req.params.id,
      activo: true
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
      const { nombre, ubicacion, capacidad, descripcion } = req.body;
      
      // Verificar si existe un almacén activo con el mismo nombre
      const almacenActivo = await Almacen.findOne({ 
        nombre, 
        activo: true 
      });
      
      if (almacenActivo) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un almacén activo con ese nombre'
        });
      }

      // Si existe un almacén inactivo con el mismo nombre, reactivarlo
      const almacenInactivo = await Almacen.findOne({ 
        nombre, 
        activo: false 
      });

      if (almacenInactivo) {
        almacenInactivo.activo = true;
        almacenInactivo.ubicacion = ubicacion;
        almacenInactivo.capacidad = capacidad;
        almacenInactivo.descripcion = descripcion;
        almacenInactivo.actualizadoPor = req.user.id;
        almacenInactivo.fechaActualizacion = Date.now();
        await almacenInactivo.save();

        return res.status(201).json({
          success: true,
          data: almacenInactivo,
          message: 'Almacén reactivado exitosamente'
        });
      }
      
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
      
      if (!almacenActualizado || !almacenActualizado.activo) {
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
          activo: false,
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