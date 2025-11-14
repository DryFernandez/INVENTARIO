import React, { useState } from 'react'
import '../css/perfil.css'
import Nav from '../components/nav/Nav'
import Bar from '../components/bar/Bar'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa'

function Perfil() {
  const [userData, setUserData] = useState({
    nombre: 'Dary',
    email: 'dary@inventario.com',
    telefono: '555-0123',
    rol: 'Administrador',
    imagen: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    alert('Perfil actualizado exitosamente');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    alert('Contraseña actualizada exitosamente');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

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
                <div className='perfil-avatar'>
                  <FaUser />
                </div>
                <h3>{userData.nombre}</h3>
                <p className='user-role'>{userData.rol}</p>
                <Button variant='outline' size='small'>
                  Cambiar Foto
                </Button>
              </div>
              <div className='perfil-stats'>
                <div className='stat-item'>
                  <span className='stat-label'>Miembro desde</span>
                  <span className='stat-value'>Enero 2024</span>
                </div>
                <div className='stat-item'>
                  <span className='stat-label'>Último acceso</span>
                  <span className='stat-value'>Hoy, 10:30 AM</span>
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
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Perfil
