const express = require('express');
const router = express.Router();
const Proveedor = require('../Models/Proveedor');
const { validarProveedor } = require('../Validators/Proveedor');

// GET / - Obtener todos los proveedores activos con filtros
router.get('/', async (req, res) => {
  try {
    const { 
      limit = 20, 
      page = 1, 
      search = '',
      ruc,
      activo,
      sort = 'nombre',
      order = 'asc'
    } = req.query;

    // Construir query de búsqueda
    const query = { estado: true };

    // Filtros de búsqueda
    if (search) {
      query.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { telefono: { $regex: search, $options: 'i' } }
      ];
    }

    if (ruc) query.ruc = ruc;
    if (activo !== undefined) query.activo = activo === 'true';

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort]: order === 'asc' ? 1 : -1 },
      collation: { locale: 'es' }
    };

    const proveedores = await Proveedor.paginate(query, options);

    res.status(200).json({
      success: true,
      data: proveedores.docs,
      pagination: {
        total: proveedores.totalDocs,
        limit: proveedores.limit,
        page: proveedores.page,
        pages: proveedores.totalPages
      }
    });

  } catch (error) {
    console.error('Error en GET /proveedores:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los proveedores',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /:id - Obtener un proveedor específico con productos asociados
router.get('/:id', async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({
      _id: req.params.id,
      estado: true
    }).populate('productos', 'nombre codigo precio stock');

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
    if (!proveedorExistente || !proveedorExistente.estado) {
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
      { estado: false },
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