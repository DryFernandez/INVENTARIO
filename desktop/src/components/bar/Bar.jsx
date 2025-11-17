import React, { useState, useEffect } from 'react'
import './bar.css';
import { MdCategory, MdDashboard } from "react-icons/md";
import { FaWindowRestore } from "react-icons/fa6";
import { FaBoxesStacked, FaBoxOpen } from "react-icons/fa6";
import { FaShoppingCart, FaHistory, FaBox } from "react-icons/fa";
import { BsCartCheckFill } from "react-icons/bs";
import { FaUsers, FaFileInvoice, FaUser, FaUserCog, FaBell, FaFileContract, FaChartLine, FaClipboardList } from "react-icons/fa";
import { HiDocumentReport } from "react-icons/hi";
import { TbFileInvoice } from "react-icons/tb";
import { Link, useLocation }from 'react-router-dom'
import { hasPermission, getCurrentUserRole } from '../../utils/permissions'

function Bar() {
  const location = useLocation();
  const [userData, setUserData] = useState({
    nombre: '',
    rol: '',
    imagen: ''
  });

  useEffect(() => {
    cargarDatosUsuario();
    
    // Escuchar cambios en el usuario
    const handleUserUpdate = () => {
      cargarDatosUsuario();
    };
    
    window.addEventListener('userUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const cargarDatosUsuario = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData({
          nombre: user.nombre || 'Usuario',
          rol: user.rol === 'admin' ? 'Administrador' : user.rol || 'Usuario',
          imagen: user.imagen || ''
        });
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    }
  };

  const menuItems = [
    { path: '/', icon: <MdDashboard className='icon-menu' />, label: 'DASHBOARD', permission: 'dashboard' },
    { path: '/productos', icon: <FaBox className='icon-menu' />, label: 'PRODUCTOS', permission: 'productos_ver' },
    { path: '/lotes', icon: <FaBoxOpen className='icon-menu' />, label: 'LOTES', permission: 'productos_ver' },
    { path: '/kardex', icon: <FaHistory className='icon-menu' />, label: 'KARDEX', permission: 'productos_ver' },
    { path: '/categorias', icon: <MdCategory className='icon-menu' />, label: 'CATEGORIAS', permission: 'categorias_ver' },
    { path: '/almacenes', icon: <FaWindowRestore className='icon-menu' />, label: 'ALMACENES', permission: 'almacenes_ver' },
    { path: '/conteos-fisicos', icon: <FaClipboardList className='icon-menu' />, label: 'CONTEOS FÍSICOS', permission: 'productos_ver' },
    { path: '/proveedores', icon: <FaBoxesStacked className='icon-menu' />, label: 'PROVEEDORES', permission: 'proveedores_ver' },
    { path: '/clientes', icon: <FaUsers className='icon-menu' />, label: 'CLIENTES', permission: 'clientes_ver' },
    { path: '/ventas', icon: <BsCartCheckFill className='icon-menu' />, label: 'VENTAS', permission: 'ventas_ver' },
    { path: '/ventas-registradas', icon: <FaFileInvoice className='icon-menu' />, label: 'VENTAS REGISTRADAS', permission: 'ventas_registradas' },
    { path: '/cotizaciones', icon: <FaFileContract className='icon-menu' />, label: 'COTIZACIONES', permission: 'ventas_ver' },
    { path: '/compras', icon: <FaShoppingCart className='icon-menu' />, label: 'COMPRAS', permission: 'compras_ver' },
    { path: '/compras-registradas', icon: <TbFileInvoice className='icon-menu' />, label: 'COMPRAS REGISTRADAS', permission: 'compras_registradas' },
    { path: '/ordenes-compra', icon: <HiDocumentReport className='icon-menu' />, label: 'ÓRDENES DE COMPRA', permission: 'compras_ver' },
    { path: '/alertas', icon: <FaBell className='icon-menu' />, label: 'ALERTAS', permission: 'dashboard' },
    { path: '/reportes', icon: <FaChartLine className='icon-menu' />, label: 'REPORTES', permission: 'dashboard' },
    { path: '/usuarios', icon: <FaUserCog className='icon-menu' />, label: 'USUARIOS', permission: 'usuarios_ver' },
  ];

  const userRole = getCurrentUserRole();
  const menuItemsFiltrados = menuItems.filter(item => hasPermission(item.permission, userRole));

  return (
    <div className="sidebar">
      <div className='sidebar-header'>
        <div className='user-avatar'>
          {userData.imagen ? (
            <img src={userData.imagen} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            <FaUser className='avatar-icon' />
          )}
        </div>
        <div className='user-info'>
          <h3>{userData.nombre}</h3>
          <span className='user-role'>{userData.rol}</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <ul>
          {menuItemsFiltrados.map((item) => (
            <li key={item.path}>
              <Link 
                className={`menu-link ${location.pathname === item.path ? 'active' : ''}`}
                to={item.path}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className='sidebar-footer'>
        <p>© 2025 Inventario</p>
      </div>
    </div>
  )
}

export default Bar
