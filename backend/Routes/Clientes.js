const express = require('express');
const router = express.Router();
const Cliente = require('../Models/Clientes');
const { validarCliente } = require('../Validators/Clientes');

// GET / - Obtener todos los clientes activos con paginación
router.get('/', async (req, res) => {
  try {
    const { 
      limit = 10, 
      page = 1, 
      search = '',
      sort = 'nombre',
      order = 'asc'
    } = req.query;

    // Construir query de búsqueda
    const query = {
      estado: true,
      $or: [
        { nombre: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { telefono: { $regex: search, $options: 'i' } }
      ]
    };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort]: order === 'asc' ? 1 : -1 },
      collation: { locale: 'es' }
    };

    const clientes = await Cliente.paginate(query, options);

    res.status(200).json({
      success: true,
      data: clientes.docs,
      pagination: {
        total: clientes.totalDocs,
        limit: clientes.limit,
        page: clientes.page,
        pages: clientes.totalPages,
        hasNext: clientes.hasNextPage,
        hasPrev: clientes.hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error en GET /clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los clientes',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /:id - Obtener un cliente específico por ID
router.get('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      _id: req.params.id,
      estado: true
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
    const { email, telefono } = req.body;

    // Verificar si el email ya existe
    const existeEmail = await Cliente.findOne({ email });
    if (existeEmail) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    // Verificar si el teléfono ya existe
    const existeTelefono = await Cliente.findOne({ telefono });
    if (existeTelefono) {
      return res.status(400).json({
        success: false,
        error: 'El teléfono ya está registrado'
      });
    }

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
    const { email, telefono } = req.body;

    // Verificar si el cliente existe y está activo
    const clienteExistente = await Cliente.findOne({
      _id: req.params.id,
      estado: true
    });

    if (!clienteExistente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    // Verificar si el nuevo email ya existe en otro cliente
    if (email && email !== clienteExistente.email) {
      const emailExiste = await Cliente.findOne({ 
        email,
        _id: { $ne: req.params.id }
      });
      if (emailExiste) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está registrado en otro cliente'
        });
      }
    }

    // Verificar si el nuevo teléfono ya existe en otro cliente
    if (telefono && telefono !== clienteExistente.telefono) {
      const telefonoExiste = await Cliente.findOne({ 
        telefono,
        _id: { $ne: req.params.id }
      });
      if (telefonoExiste) {
        return res.status(400).json({
          success: false,
          error: 'El teléfono ya está registrado en otro cliente'
        });
      }
    }

    const clienteActualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

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
      { estado: false },
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