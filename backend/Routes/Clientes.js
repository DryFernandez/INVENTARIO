const express = require('express');
const router = express.Router();
const Cliente = require('../Models/Clientes');
const { validarCliente } = require('../Validators/Clientes');

// GET / - Obtener todos los clientes activos
router.get('/', async (req, res) => {
  try {
    const { search = '' } = req.query;

    // Construir query de búsqueda
    const query = {
      activo: true
    };

    if (search) {
      query.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { ruc: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { telefono: { $regex: search, $options: 'i' } }
      ];
    }

    const clientes = await Cliente.find(query).sort({ nombre: 1 });

    res.status(200).json(clientes);

  } catch (error) {
    console.error('Error en GET /clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los clientes'
    });
  }
});

// GET /:id - Obtener un cliente específico por ID
router.get('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      _id: req.params.id,
      activo: true
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: cliente
    });

  } catch (error) {
    console.error(`Error en GET /clientes/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de cliente inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener el cliente',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST / - Crear nuevo cliente
router.post('/', validarCliente, async (req, res) => {
  try {
    const nuevoCliente = await Cliente.create(req.body);

    res.status(201).json({
      success: true,
      data: nuevoCliente,
      message: 'Cliente creado exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /clientes:', error);
    
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
      error: 'Error al crear el cliente',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /:id - Actualizar cliente existente
router.put('/:id', validarCliente, async (req, res) => {
  try {
    const clienteActualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!clienteActualizado || !clienteActualizado.activo) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: clienteActualizado,
      message: 'Cliente actualizado exitosamente'
    });

  } catch (error) {
    console.error(`Error en PUT /clientes/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de cliente inválido'
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
      error: 'Error al actualizar el cliente',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /:id - Desactivar cliente (borrado lógico)
router.delete('/:id', async (req, res) => {
  try {
    const clienteDesactivado = await Cliente.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!clienteDesactivado) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: clienteDesactivado,
      message: 'Cliente desactivado exitosamente'
    });

  } catch (error) {
    console.error(`Error en DELETE /clientes/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de cliente inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al desactivar el cliente',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;