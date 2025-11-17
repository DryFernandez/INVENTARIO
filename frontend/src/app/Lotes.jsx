// app/Lotes.jsx
import { useState, useEffect } from 'react';
import Nav from '../components/nav/Nav';
import Bar from '../components/bar/Bar';
import lotesService from '../services/lotes';
import { Button, Card, Table, Modal } from '../components/common';
import '../css/lotes.css';

export default function Lotes() {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    cargarLotes();
  }, [filtro]);

  const cargarLotes = async () => {
    try {
      setLoading(true);
      let data;
      if (filtro === 'proximos-vencer') {
        data = await lotesService.getProximosVencer(30);
      } else {
        data = await lotesService.getAll();
      }
      setLotes(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar lotes');
    } finally {
      setLoading(false);
    }
  };

  const getDiasRestantes = (fechaVencimiento) => {
    const dias = Math.ceil((new Date(fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24));
    return dias;
  };

  const getEstadoBadge = (fechaVencimiento) => {
    const dias = getDiasRestantes(fechaVencimiento);
    if (dias < 0) return { class: 'badge-danger', text: 'Vencido' };
    if (dias <= 7) return { class: 'badge-danger', text: `${dias} días` };
    if (dias <= 30) return { class: 'badge-warning', text: `${dias} días` };
    return { class: 'badge-success', text: `${dias} días` };
  };

  return (
    <div className="lotes-container">
      <Bar />
      <main className="lotes-main">
        <Nav />
        <div className="lotes-content">
      <div className="header">
        <h1>📦 Gestión de Lotes</h1>
        <Button onClick={() => setModalOpen(true)} className="btn-primary">
          + Nuevo Lote
        </Button>
      </div>

      <div className="filtros">
        <button 
          className={filtro === 'todos' ? 'active' : ''} 
          onClick={() => setFiltro('todos')}
        >
          Todos los Lotes
        </button>
        <button 
          className={filtro === 'proximos-vencer' ? 'active' : ''} 
          onClick={() => setFiltro('proximos-vencer')}
        >
          Próximos a Vencer (30 días)
        </button>
      </div>

      <Card>
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>N° Lote</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Almacén</th>
                <th>Ubicación</th>
                <th>Fecha Ingreso</th>
                <th>Fecha Vencimiento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lotes.map(lote => {
                const estado = getEstadoBadge(lote.fechaVencimiento);
                return (
                  <tr key={lote._id}>
                    <td><strong>{lote.numeroLote}</strong></td>
                    <td>{lote.producto?.nombre}</td>
                    <td>{lote.cantidad}</td>
                    <td>{lote.almacen?.nombre}</td>
                    <td>
                      {lote.ubicacion?.pasillo && (
                        <span className="ubicacion">
                          P:{lote.ubicacion.pasillo} E:{lote.ubicacion.estante} N:{lote.ubicacion.nivel}
                        </span>
                      )}
                    </td>
                    <td>{new Date(lote.fechaIngreso).toLocaleDateString()}</td>
                    <td>{new Date(lote.fechaVencimiento).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${estado.class}`}>
                        {estado.text}
                      </span>
                    </td>
                    <td className="acciones">
                      <Button size="small">Ver</Button>
                      <Button size="small" className="btn-warning">Editar</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
        </div>
      </main>
    </div>
  );
}
