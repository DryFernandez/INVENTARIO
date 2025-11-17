import React, { useState, useEffect, useRef } from 'react'
import './nav.css'
import { IoMdExit } from "react-icons/io";
import { FaUser, FaBell, FaMoon, FaSun, FaSearch } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { productosAPI, clientesAPI, proveedoresAPI } from '../../services/api';

function Nav() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [userData, setUserData] = useState({
    nombre: '',
    email: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    cargarDatosUsuario();
    
    // Cerrar resultados al hacer clic fuera
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar mientras el usuario escribe (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        realizarBusqueda();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const realizarBusqueda = async () => {
    if (!searchTerm.trim()) return;

    try {
      setSearching(true);
      const term = searchTerm.toLowerCase();

      const [productos, clientes, proveedores] = await Promise.all([
        productosAPI.getAll().catch(() => []),
        clientesAPI.getAll().catch(() => []),
        proveedoresAPI.getAll().catch(() => [])
      ]);

      const resultados = [];

      // Buscar productos
      const productosMatch = productos
        .filter(p => 
          p.nombre.toLowerCase().includes(term) ||
          p.sku?.toLowerCase().includes(term) ||
          p.categoria?.nombre?.toLowerCase().includes(term)
        )
        .slice(0, 5)
        .map(p => ({
          tipo: 'Producto',
          titulo: p.nombre,
          subtitulo: `SKU: ${p.sku} - Stock: ${p.stock}`,
          ruta: '/productos',
          id: p._id
        }));

      // Buscar clientes
      const clientesMatch = clientes
        .filter(c => 
          c.nombre.toLowerCase().includes(term) ||
          c.ruc?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term)
        )
        .slice(0, 5)
        .map(c => ({
          tipo: 'Cliente',
          titulo: c.nombre,
          subtitulo: c.ruc || c.email || '',
          ruta: '/clientes',
          id: c._id
        }));

      // Buscar proveedores
      const proveedoresMatch = proveedores
        .filter(p => 
          p.nombre.toLowerCase().includes(term) ||
          p.ruc?.toLowerCase().includes(term) ||
          p.email?.toLowerCase().includes(term)
        )
        .slice(0, 5)
        .map(p => ({
          tipo: 'Proveedor',
          titulo: p.nombre,
          subtitulo: p.ruc || p.email || '',
          ruta: '/proveedores',
          id: p._id
        }));

      resultados.push(...productosMatch, ...clientesMatch, ...proveedoresMatch);

      setSearchResults(resultados);
      setShowResults(resultados.length > 0);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleResultClick = (resultado) => {
    navigate(resultado.ruta);
    setSearchTerm('');
    setShowResults(false);
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

      {/* Búsqueda Global */}
      <div className="navbar-search" ref={searchRef}>
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar productos, clientes, proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm && setShowResults(true)}
          />
        </div>

        {showResults && (
          <div className="search-results">
            {searching ? (
              <div className="search-loading">Buscando...</div>
            ) : searchResults.length > 0 ? (
              <>
                {searchResults.map((resultado, index) => (
                  <div
                    key={`${resultado.tipo}-${index}`}
                    className="search-result-item"
                    onClick={() => handleResultClick(resultado)}
                  >
                    <div className="result-tipo">{resultado.tipo}</div>
                    <div className="result-titulo">{resultado.titulo}</div>
                    <div className="result-subtitulo">{resultado.subtitulo}</div>
                  </div>
                ))}
              </>
            ) : (
              <div className="search-no-results">
                No se encontraron resultados para "{searchTerm}"
              </div>
            )}
          </div>
        )}
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
