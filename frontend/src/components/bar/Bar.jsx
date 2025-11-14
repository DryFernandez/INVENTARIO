import React from 'react'
import './bar.css';
import { AiFillProduct } from "react-icons/ai";
import { MdCategory, MdDashboard } from "react-icons/md";
import { FaWindowRestore } from "react-icons/fa6";
import { FaBoxesStacked } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";
import { BsCartCheckFill } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { HiDocumentReport } from "react-icons/hi";
import persona from './persona.png'
import { Link, useLocation }from 'react-router-dom'

function Bar() {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: <MdDashboard className='icon-menu' />, label: 'DASHBOARD' },
    { path: '/productos', icon: <AiFillProduct className='icon-menu' />, label: 'PRODUCTOS' },
    { path: '/categorias', icon: <MdCategory className='icon-menu' />, label: 'CATEGORIAS' },
    { path: '/almacenes', icon: <FaWindowRestore className='icon-menu' />, label: 'ALMACENES' },
    { path: '/proveedores', icon: <FaBoxesStacked className='icon-menu' />, label: 'PROVEEDORES' },
    { path: '/ventas', icon: <BsCartCheckFill className='icon-menu' />, label: 'VENTAS' },
    { path: '/compras', icon: <FaShoppingCart className='icon-menu' />, label: 'COMPRAS' },
  ];

  return (
    <div className="sidebar">
      <div className='sidebar-header'>
        <div className='user-avatar'>
          <img src={persona} alt="Usuario" />
        </div>
        <div className='user-info'>
          <h3>Dary</h3>
          <span className='user-role'>Administrador</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <ul>
          {menuItems.map((item) => (
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
