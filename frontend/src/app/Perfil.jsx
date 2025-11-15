import React, { useState, useEffect, useRef } from 'react'
import '../css/perfil.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCamera } from 'react-icons/fa'

function Perfil() {
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    rol: '',
    imagen: ''
  });

  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const cargarDatosUsuario = () => {
    try {
      // Obtener datos del usuario desde localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData({
          nombre: user.nombre || '',
          email: user.email || '',
          telefono: user.telefono || 'No especificado',
          rol: user.rol === 'admin' ? 'Administrador' : user.rol || '',
          imagen: user.imagen || ''
        });
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const obtenerUltimoAcceso = () => {
    const ahora = new Date();
    return ahora.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('primaryColor') || '#4f46e5';
  });

  const coloresPreestablecidos = [
    { nombre: 'Índigo', valor: '#4f46e5' },
    { nombre: 'Azul', valor: '#3b82f6' },
    { nombre: 'Verde', valor: '#10b981' },
    { nombre: 'Naranja', valor: '#f59e0b' },
    { nombre: 'Rojo', valor: '#ef4444' },
    { nombre: 'Morado', valor: '#8b5cf6' },
    { nombre: 'Rosa', valor: '#ec4899' },
    { nombre: 'Cian', valor: '#06b6d4' },
  ];

  const handleUserDataChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleColorChange = (color) => {
    setPrimaryColor(color);
    
    // Actualizar las variables CSS
    const root = document.documentElement;
    root.style.setProperty('--primary-color', color);
    
    // Calcular colores derivados
    const darkerColor = adjustColor(color, -20);
    const lighterColor = adjustColor(color, 20);
    
    root.style.setProperty('--primary-dark', darkerColor);
    root.style.setProperty('--primary-light', lighterColor);
    
    // Guardar en localStorage
    localStorage.setItem('primaryColor', color);
  };

  const adjustColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  useEffect(() => {
    // Aplicar el color guardado al cargar
    const savedColor = localStorage.getItem('primaryColor');
    if (savedColor) {
      handleColorChange(savedColor);
    }
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = reader.result;
        setUserData({
          ...userData,
          imagen: newImage
        });
        
        // Actualizar inmediatamente en localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const updatedUser = { ...user, imagen: newImage };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Disparar evento personalizado para que otros componentes se actualicen
          window.dispatchEvent(new Event('userUpdated'));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      // Aquí podrías agregar la llamada a la API para actualizar el perfil
      // await usuariosAPI.updateProfile(userData);
      
      // Actualizar localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUser = { 
          ...user, 
          nombre: userData.nombre, 
          email: userData.email, 
          telefono: userData.telefono,
          imagen: userData.imagen 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      alert('Error al actualizar el perfil');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      // Aquí podrías agregar la llamada a la API para cambiar la contraseña
      // await authAPI.changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      
      alert('Contraseña actualizada exitosamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error actualizando contraseña:', error);
      alert('Error al actualizar la contraseña');
    }
  };

  if (loading) {
    return (
      <div className='perfil-container'>
        <Bar />
        <main className='perfil-main'>
          <Nav />
          <div className='perfil-content'>
            <div className='loading'>Cargando perfil...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='perfil-container'>
      <Bar />
      <main className='perfil-main'>
        <Nav />
        <div className='perfil-content'>
          <div className='perfil-header'>
            <h1>Mi Perfil</h1>
            <p className='subtitle'>Gestiona tu información personal</p>
          </div>

          <div className='perfil-layout'>
            {/* Tarjeta de perfil */}
            <Card className='perfil-sidebar'>
              <div className='perfil-avatar-section'>
                <div className='perfil-avatar' onClick={handleImageClick} style={{ cursor: 'pointer', position: 'relative' }}>
                  {userData.imagen ? (
                    <img src={userData.imagen} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    <FaUser />
                  )}
                  <div className='avatar-overlay'>
                    <FaCamera />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <h3>{userData.nombre}</h3>
                <p className='user-role'>{userData.rol}</p>
                <Button variant='outline' size='small' onClick={handleImageClick}>
                  Cambiar Foto
                </Button>
              </div>
              <div className='perfil-stats'>
                <div className='stat-item'>
                  <span className='stat-label'>Miembro desde</span>
                  <span className='stat-value'>{formatearFecha(JSON.parse(localStorage.getItem('user') || '{}').createdAt) || 'Enero 2024'}</span>
                </div>
                <div className='stat-item'>
                  <span className='stat-label'>Último acceso</span>
                  <span className='stat-value'>{obtenerUltimoAcceso()}</span>
                </div>
              </div>
            </Card>

            {/* Formularios */}
            <div className='perfil-forms'>
              <Card title='Información Personal'>
                <form onSubmit={handleProfileSubmit}>
                  <Input
                    label='Nombre Completo'
                    name='nombre'
                    value={userData.nombre}
                    onChange={handleUserDataChange}
                    icon={<FaUser />}
                    required
                  />
                  <Input
                    label='Email'
                    name='email'
                    type='email'
                    value={userData.email}
                    onChange={handleUserDataChange}
                    icon={<FaEnvelope />}
                    required
                  />
                  <Input
                    label='Teléfono'
                    name='telefono'
                    value={userData.telefono}
                    onChange={handleUserDataChange}
                    icon={<FaPhone />}
                  />
                  <Input
                    label='Rol'
                    name='rol'
                    value={userData.rol}
                    disabled
                  />
                  <div className='form-actions'>
                    <Button variant='primary' type='submit'>
                      Guardar Cambios
                    </Button>
                  </div>
                </form>
              </Card>

              <Card title='Cambiar Contraseña'>
                <form onSubmit={handlePasswordSubmit}>
                  <Input
                    label='Contraseña Actual'
                    name='currentPassword'
                    type='password'
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    icon={<FaLock />}
                    required
                  />
                  <Input
                    label='Nueva Contraseña'
                    name='newPassword'
                    type='password'
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    icon={<FaLock />}
                    required
                  />
                  <Input
                    label='Confirmar Nueva Contraseña'
                    name='confirmPassword'
                    type='password'
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    icon={<FaLock />}
                    required
                  />
                  <div className='form-actions'>
                    <Button variant='warning' type='submit'>
                      Actualizar Contraseña
                    </Button>
                  </div>
                </form>
              </Card>

              <Card title='Color Principal'>
                <div className='color-section'>
                  <p className='color-description'>
                    Personaliza el color predominante de la interfaz
                  </p>
                  <div className='color-grid'>
                    {coloresPreestablecidos.map((color) => (
                      <div
                        key={color.valor}
                        className={`color-option ${primaryColor === color.valor ? 'active' : ''}`}
                        onClick={() => handleColorChange(color.valor)}
                      >
                        <div
                          className='color-circle'
                          style={{ backgroundColor: color.valor }}
                        />
                        <span className='color-name'>{color.nombre}</span>
                      </div>
                    ))}
                  </div>
                  <div className='custom-color'>
                    <label htmlFor='customColor'>Color personalizado:</label>
                    <div className='custom-color-input'>
                      <input
                        type='color'
                        id='customColor'
                        value={primaryColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                      />
                      <span className='color-hex'>{primaryColor.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Perfil
