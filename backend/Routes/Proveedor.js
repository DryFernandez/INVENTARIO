const express = require('express');
const router = express.Router();
const Proveedor = require('../Models/Proveedor');
const { validarProveedor } = require('../Validators/Proveedor');

// GET / - Obtener todos los proveedores activos
router.get('/', async (req, res) => {
  try {
    const proveedores = await Proveedor.find({ activo: true }).sort({ nombre: 1 });
    res.status(200).json(proveedores);
  } catch (error) {
    console.error('Error en GET /proveedores:', error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
});

// GET /:id - Obtener un proveedor específico con productos asociados
router.get('/:id', async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({
      _id: req.params.id,
      activo: true
    });

    if (!proveedor) {
      return res.status(404).json({
        success: false,
        error: 'Proveedor no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: proveedor
    });

  } catch (error) {
    console.error(`Error en GET /proveedores/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de proveedor inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener el proveedor'
    });
  }
});

// POST / - Crear nuevo proveedor
router.post('/', validarProveedor, async (req, res) => {
  try {
    console.log('📦 Datos recibidos en POST /proveedores:', JSON.stringify(req.body, null, 2));
    
    const { ruc, nombre, contacto } = req.body;

    // Verificar si el RUC ya existe en proveedores activos (solo si se proporciona)
    if (ruc && ruc.trim()) {
      const existeRucActivo = await Proveedor.findOne({ ruc: ruc.trim(), activo: true });
      if (existeRucActivo) {
        return res.status(400).json({
          success: false,
          error: 'El RUC ya está registrado'
        });
      }
    }

    // Verificar si el nombre ya existe en proveedores activos
    const existeNombreActivo = await Proveedor.findOne({ 
      nombre: { $regex: new RegExp('^' + nombre.trim() + '$', 'i') }, 
      activo: true 
    });
    if (existeNombreActivo) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un proveedor con ese nombre'
      });
    }

    // Transformar los datos del frontend al formato del modelo
    const datosProveedor = {
      nombre: req.body.nombre.trim(),
      ruc: req.body.ruc ? req.body.ruc.trim() : undefined,
      direccion: req.body.direccion ? req.body.direccion.trim() : undefined,
      activo: req.body.activo !== undefined ? req.body.activo : true
    };

    // Si hay contacto, agregarlo al contactoPrincipal
    if (req.body.contacto && req.body.contacto.trim()) {
      datosProveedor.contactoPrincipal = {
        telefono: req.body.contacto.trim()
      };
    }

    // Si existe un proveedor inactivo con el mismo RUC, reactivarlo
    if (ruc && ruc.trim()) {
      const proveedorInactivo = await Proveedor.findOne({ ruc: ruc.trim(), activo: false });
      if (proveedorInactivo) {
        // Actualizar datos del proveedor inactivo
        Object.assign(proveedorInactivo, datosProveedor);
        proveedorInactivo.activo = true;
        await proveedorInactivo.save();

        return res.status(201).json({
          success: true,
          data: proveedorInactivo,
          message: 'Proveedor reactivado exitosamente'
        });
      }
    }

    const nuevoProveedor = await Proveedor.create(datosProveedor);

    res.status(201).json({
      success: true,
      data: nuevoProveedor,
      message: 'Proveedor creado exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /proveedores:', error);
    
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
      error: 'Error al crear el proveedor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /:id - Actualizar proveedor existente
router.put('/:id', validarProveedor, async (req, res) => {
  try {
    const { id } = req.params;
    const { ruc, nombre } = req.body;

    // Verificar si el proveedor existe
    const proveedorExistente = await Proveedor.findById(id);
    if (!proveedorExistente || !proveedorExistente.activo) {
      return res.status(404).json({
        success: false,
        error: 'Proveedor no encontrado'
      });
    }

    // Verificar si el nuevo RUC ya existe en otro proveedor
    if (ruc && ruc.trim() && ruc.trim() !== proveedorExistente.ruc) {
      const rucExiste = await Proveedor.findOne({ 
        ruc: ruc.trim(),
        _id: { $ne: id },
        activo: true
      });
      if (rucExiste) {
        return res.status(400).json({
          success: false,
          error: 'El RUC ya está registrado en otro proveedor'
        });
      }
    }

    // Verificar si el nuevo nombre ya existe en otro proveedor
    if (nombre && nombre.trim().toLowerCase() !== proveedorExistente.nombre.toLowerCase()) {
      const nombreExiste = await Proveedor.findOne({ 
        nombre: { $regex: new RegExp('^' + nombre.trim() + '$', 'i') },
        _id: { $ne: id },
        activo: true
      });
      if (nombreExiste) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe otro proveedor con ese nombre'
        });
      }
    }

    // Transformar los datos del frontend al formato del modelo
    const datosActualizados = {
      nombre: req.body.nombre.trim(),
      ruc: req.body.ruc ? req.body.ruc.trim() : proveedorExistente.ruc,
      direccion: req.body.direccion ? req.body.direccion.trim() : proveedorExistente.direccion,
      activo: req.body.activo !== undefined ? req.body.activo : proveedorExistente.activo
    };

    // Si hay contacto, actualizar el contactoPrincipal
    if (req.body.contacto && req.body.contacto.trim()) {
      datosActualizados.contactoPrincipal = {
        ...proveedorExistente.contactoPrincipal,
        telefono: req.body.contacto.trim()
      };
    }

    const proveedorActualizado = await Proveedor.findByIdAndUpdate(
      id,
      datosActualizados,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: proveedorActualizado,
      message: 'Proveedor actualizado exitosamente'
    });

  } catch (error) {
    console.error(`Error en PUT /proveedores/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de proveedor inválido'
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
      error: 'Error al actualizar el proveedor'
    });
  }
});

// DELETE /:id - Desactivar proveedor (borrado lógico)
router.delete('/:id', async (req, res) => {
  try {
    console.log(`🗑️ Intentando eliminar proveedor con ID: ${req.params.id}`);
    
    // Verificar si el proveedor existe y está activo
    const proveedorExistente = await Proveedor.findById(req.params.id);
    
    if (!proveedorExistente) {
      return res.status(404).json({
        success: false,
        error: 'Proveedor no encontrado'
      });
    }

    if (!proveedorExistente.activo) {
      return res.status(400).json({
        success: false,
        error: 'El proveedor ya está desactivado'
      });
    }

    // Desactivar el proveedor
    const proveedorDesactivado = await Proveedor.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    console.log(`✅ Proveedor desactivado exitosamente: ${proveedorDesactivado.nombre}`);

    res.status(200).json({
      success: true,
      data: proveedorDesactivado,
      message: 'Proveedor eliminado exitosamente'
    });

  } catch (error) {
    console.error(`❌ Error en DELETE /proveedores/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de proveedor inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al eliminar el proveedor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;