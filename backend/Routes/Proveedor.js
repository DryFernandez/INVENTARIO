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
    const { ruc, email } = req.body;

    // Verificar si el RUC ya existe
    const existeRuc = await Proveedor.findOne({ ruc });
    if (existeRuc) {
      return res.status(400).json({
        success: false,
        error: 'El RUC ya está registrado'
      });
    }

    // Verificar si el email ya existe
    const existeEmail = await Proveedor.findOne({ email });
    if (existeEmail) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    const nuevoProveedor = await Proveedor.create(req.body);

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
    const { ruc, email } = req.body;

    // Verificar si el proveedor existe
    const proveedorExistente = await Proveedor.findById(id);
    if (!proveedorExistente || !proveedorExistente.activo) {
      return res.status(404).json({
        success: false,
        error: 'Proveedor no encontrado'
      });
    }

    // Verificar si el nuevo RUC ya existe en otro proveedor
    if (ruc && ruc !== proveedorExistente.ruc) {
      const rucExiste = await Proveedor.findOne({ 
        ruc,
        _id: { $ne: id }
      });
      if (rucExiste) {
        return res.status(400).json({
          success: false,
          error: 'El RUC ya está registrado en otro proveedor'
        });
      }
    }

    // Verificar si el nuevo email ya existe en otro proveedor
    if (email && email !== proveedorExistente.email) {
      const emailExiste = await Proveedor.findOne({ 
        email,
        _id: { $ne: id }
      });
      if (emailExiste) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está registrado en otro proveedor'
        });
      }
    }

    const proveedorActualizado = await Proveedor.findByIdAndUpdate(
      id,
      req.body,
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
    // Verificar si el proveedor tiene productos asociados
    const proveedorConProductos = await Proveedor.findOne({
      _id: req.params.id,
      productos: { $exists: true, $not: { $size: 0 } }
    });

    if (proveedorConProductos) {
      return res.status(400).json({
        success: false,
        error: 'No se puede desactivar un proveedor con productos asociados',
        productosAsociados: proveedorConProductos.productos.length
      });
    }

    const proveedorDesactivado = await Proveedor.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!proveedorDesactivado) {
      return res.status(404).json({
        success: false,
        error: 'Proveedor no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: proveedorDesactivado,
      message: 'Proveedor desactivado exitosamente'
    });

  } catch (error) {
    console.error(`Error en DELETE /proveedores/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de proveedor inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al desactivar el proveedor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;