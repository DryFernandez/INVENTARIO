import React, { useState, useEffect } from 'react'
import '../css/compras.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Table from '../components/common/Table'
import { IoIosAdd } from 'react-icons/io'
import { FaFileInvoice } from 'react-icons/fa'

function Compras() {
  const [compras, setCompras] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    proveedor: '',
    fecha: new Date().toISOString().split('T')[0],
    items: [],
    total: 0,
    numeroFactura: ''
  });

  useEffect(() => {
    const comprasEjemplo = [
      {
        _id: '1',
        numeroFactura: 'FC-001',
        proveedor: 'Proveedor A',
        fecha: '2024-11-10',
        total: 5000,
        estado: 'Completada'
      },
      {
        _id: '2',
        numeroFactura: 'FC-002',
        proveedor: 'Proveedor B',
        fecha: '2024-11-12',
        total: 3200,
        estado: 'Pendiente'
      },
    ];
    setCompras(comprasEjemplo);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCompra = {
      ...formData,
      _id: Date.now().toString(),
      estado: 'Pendiente'
    };
    setCompras([...compras, newCompra]);
    setIsModalOpen(false);
    setFormData({
      proveedor: '',
      fecha: new Date().toISOString().split('T')[0],
      items: [],
      total: 0,
      numeroFactura: ''
    });
  };

  const columns = [
    { header: 'N° Factura', accessor: 'numeroFactura' },
    { header: 'Proveedor', accessor: 'proveedor' },
    { header: 'Fecha', accessor: 'fecha' },
    {
      header: 'Total',
      accessor: 'total',
      render: (row) => `$${row.total.toFixed(2)}`,
    },
    {
      header: 'Estado',
      accessor: 'estado',
      render: (row) => (
        <span className={`status-badge ${row.estado === 'Completada' ? 'active' : 'inactive'}`}>
          {row.estado}
        </span>
      ),
    },
  ];

  return (
    <div className='compras-container'>
      <Bar />
      <main className='compras-main'>
        <Nav />
        <div className='compras-content'>
          <div className='compras-header'>
            <div>
              <h1>Compras</h1>
              <p className='subtitle'>Gestión de órdenes de compra</p>
            </div>
            <Button
              variant="primary"
              icon={<IoIosAdd />}
              onClick={() => setIsModalOpen(true)}
            >
              Nueva Compra
            </Button>
          </div>

          <Card>
            <Table columns={columns} data={compras} />
          </Card>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Orden de Compra"
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Input
              label="Número de Factura"
              name="numeroFactura"
              value={formData.numeroFactura}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Proveedor"
              name="proveedor"
              value={formData.proveedor}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Fecha"
              name="fecha"
              type="date"
              value={formData.fecha}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Total"
              name="total"
              type="number"
              value={formData.total}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Crear Compra
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Compras