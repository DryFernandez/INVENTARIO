const express = require('express');
const router = express.Router();
const Categoria = require('../Models/Categorias');
const { validarCategoria } = require('../Validators/Categorias');
const { checkAuth, checkRol } = require('../Middlewares/auth');

// GET / - Obtener todas las categorías activas
router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort = 'nombre', order = 'asc' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort]: order === 'asc' ? 1 : -1 },
      collation: { locale: 'es' } // Para ordenar correctamente caracteres especiales
    };

    const categorias = await Categoria.paginate(
      { estado: true }, 
      options
    );

    res.status(200).json({
      success: true,
      data: categorias.docs,
      pagination: {
        total: categorias.totalDocs,
        limit: categorias.limit,
        page: categorias.page,
        pages: categorias.totalPages
      }
    });

  } catch (error) {
    console.error('Error en GET /categorias:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las categorías'
    });
  }
});

// GET /:id - Obtener una categoría por ID
router.get('/:id', async (req, res) => {
  try {
    const categoria = await Categoria.findOne({
      _id: req.params.id,
      estado: true
    });

    if (!categoria) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: categoria
    });

  } catch (error) {
    console.error(`Error en GET /categorias/${req.params.id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID de categoría inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener la categoría'
    });
  }
});

// POST / - Crear nueva categoría (Solo admin)
router.post('/', 
  checkAuth, 
  checkRol(['admin']), 
  validarCategoria, 
  async (req, res) => {
    try {
      const { nombre, descripcion } = req.body;
      
      // Verificar si la categoría ya existe
      const existeCategoria = await Categoria.findOne({ nombre });
      if (existeCategoria) {
        return res.status(400).json({
          success: false,
          error: 'El nombre de categoría ya existe'
        });
      }

      const nuevaCategoria = await Categoria.create({
        nombre,
        descripcion,
        creadoPor: req.user.id
      });

      res.status(201).json({
        success: true,
        data: nuevaCategoria,
        message: 'Categoría creada exitosamente'
      });

    } catch (error) {
      console.error('Error en POST /categorias:', error);
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({
          success: false,
          error: errors
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al crear la categoría'
      });
    }
});

// PUT /:id - Actualizar categoría (Solo admin)
router.put('/:id', 
  checkAuth, 
  checkRol(['admin']), 
  validarCategoria, 
  async (req, res) => {
    try {
      const { nombre, descripcion } = req.body;
      
      const categoriaActualizada = await Categoria.findByIdAndUpdate(
        req.params.id,
        {
          nombre,
          descripcion,
          actualizadoPor: req.user.id,
          fechaActualizacion: Date.now()
        },
        { new: true, runValidators: true }
      );

      if (!categoriaActualizada || !categoriaActualizada.estado) {
        return res.status(404).json({
          success: false,
          error: 'Categoría no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        data: categoriaActualizada,
        message: 'Categoría actualizada exitosamente'
      });

    } catch (error) {
      console.error(`Error en PUT /categorias/${req.params.id}:`, error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          error: 'ID de categoría inválido'
        });
      }
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({
          success: false,
          error: errors
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al actualizar la categoría'
      });
    }
});

// DELETE /:id - Desactivar categoría (Solo admin - Borrado lógico)
router.delete('/:id', 
  checkAuth, 
  checkRol(['admin']), 
  async (req, res) => {
    try {
      const categoriaDesactivada = await Categoria.findByIdAndUpdate(
        req.params.id,
        {
          estado: false,
          actualizadoPor: req.user.id,
          fechaActualizacion: Date.now()
        },
        { new: true }
      );

      if (!categoriaDesactivada) {
        return res.status(404).json({
          success: false,
          error: 'Categoría no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        data: categoriaDesactivada,
        message: 'Categoría desactivada exitosamente'
      });

    } catch (error) {
      console.error(`Error en DELETE /categorias/${req.params.id}:`, error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          error: 'ID de categoría inválido'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al desactivar la categoría'
      });
    }
});

module.exports = router;