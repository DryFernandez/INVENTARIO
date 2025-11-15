import React, { useState, useEffect } from 'react'
import './nav.css'
import { IoMdExit } from "react-icons/io";
import { FaUser, FaBell, FaMoon, FaSun } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

function Nav() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [userData, setUserData] = useState({
    nombre: '',
    email: ''
  });

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const cargarDatosUsuario = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData({
          nombre: user.nombre || 'Usuario',
          email: user.email || ''
        });
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
        <button 
          className="icon-btn theme-toggle" 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {theme === 'dark' ? <FaSun className="icon" /> : <FaMoon className="icon" />}
        </button>
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
