import React from 'react'
import './nav.css'
import { IoMdExit } from "react-icons/io";
import { FaUser, FaBell } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

function Nav() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí irá la lógica de logout
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/perfil');
  };

  return (
    <div className='navbar'>
      <div className='navbar-title'>
        <h1>SISTEMA DE INVENTARIO</h1>
      </div>
      <div className="navbar-actions">
        <div className="notification-icon" title="Notificaciones">
          <FaBell className="icon" />
          <span className="notification-badge">3</span>
        </div>
        <button className="icon-btn" onClick={handleProfile} title="Perfil">
          <FaUser className="icon" />
        </button>
        <button className="icon-btn logout" onClick={handleLogout} title="Cerrar Sesión">
          <IoMdExit className="icon"/>
        </button>
      </div>
    </div>
  )
}

export default Nav
