// Middlewares/auditoria.js
const Auditoria = require('../Models/Auditoria');

/**
 * Middleware para registrar auditoría automáticamente
 * @param {string} modulo - Módulo del sistema
 * @param {string} accion - Acción realizada
 */
const registrarAuditoria = (modulo, accion) => {
  return async (req, res, next) => {
    // Guardar el método original de res.json
    const originalJson = res.json.bind(res);

    // Sobrescribir res.json para capturar la respuesta
    res.json = function(body) {
      // Solo registrar si la operación fue exitosa (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Determinar entidad y tipo
        let entidad = null;
        let entidadTipo = modulo;
        let datosNuevos = null;

        if (body && body._id) {
          entidad = body._id.toString();
          datosNuevos = body;
        } else if (req.params.id) {
          entidad = req.params.id;
        }

        // Crear registro de auditoría de forma asíncrona (no bloqueante)
        Auditoria.create({
          usuario: req.usuario?.id || null,
          accion,
          modulo,
          entidad: entidad || 'N/A',
          entidadTipo,
          datosAnteriores: req.datosAnteriores || null,
          datosNuevos,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          descripcion: generarDescripcion(accion, modulo, body),
          exitoso: true
        }).catch(err => {
          console.error('Error al registrar auditoría:', err);
        });
      } else {
        // Registrar error
        Auditoria.create({
          usuario: req.usuario?.id || null,
          accion,
          modulo,
          entidad: req.params.id || 'N/A',
          entidadTipo: modulo,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          descripcion: generarDescripcion(accion, modulo, body),
          exitoso: false,
          mensajeError: body?.error || body?.message || 'Error desconocido'
        }).catch(err => {
          console.error('Error al registrar auditoría:', err);
        });
      }

      // Llamar al método original
      return originalJson(body);
    };

    next();
  };
};

/**
 * Middleware para capturar datos anteriores antes de una actualización
 */
const capturarDatosAnteriores = (Modelo) => {
  return async (req, res, next) => {
    try {
      if (req.params.id && (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE')) {
        const documento = await Modelo.findById(req.params.id);
        if (documento) {
          req.datosAnteriores = documento.toObject();
        }
      }
    } catch (error) {
      console.error('Error al capturar datos anteriores:', error);
    }
    next();
  };
};

/**
 * Generar descripción legible de la acción
 */
function generarDescripcion(accion, modulo, datos) {
  const acciones = {
    crear: 'creó',
    editar: 'editó',
    eliminar: 'eliminó',
    activar: 'activó',
    desactivar: 'desactivó',
    compra: 'registró compra en',
    venta: 'registró venta en',
    ajuste: 'ajustó inventario en',
    traslado: 'realizó traslado en',
    aprobar: 'aprobó',
    rechazar: 'rechazó',
    cancelar: 'canceló'
  };

  const verbo = acciones[accion] || accion;
  const nombre = datos?.nombre || datos?.numeroOrden || datos?.numeroCotizacion || datos?.sku || '';
  
  return `Usuario ${verbo} ${modulo}${nombre ? ': ' + nombre : ''}`;
}

module.exports = { registrarAuditoria, capturarDatosAnteriores };
