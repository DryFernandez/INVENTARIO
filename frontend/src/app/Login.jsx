import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../css/login.css'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { authAPI } from '../services/api'
import { FaUser, FaLock, FaBoxes } from 'react-icons/fa'

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      const response = await authAPI.login(formData);
      
      // Guardar token y usuario
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setIsLoading(false);
      navigate('/');
    } catch (error) {
      setIsLoading(false);
      setLoginError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      console.error('Error en login:', error);
    }
  };

  return (
    <div className='login-container'>
      <div className='login-background'>
        <div className='background-shape shape-1'></div>
        <div className='background-shape shape-2'></div>
        <div className='background-shape shape-3'></div>
      </div>

      <div className='login-content'>
        <div className='login-card'>
          <div className='login-header'>
            <div className='login-logo'>
              <FaBoxes />
            </div>
            <h1>Sistema de Inventario</h1>
            <p>Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className='login-form'>
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
              icon={<FaUser />}
              error={errors.email}
              required
            />

            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              icon={<FaLock />}
              error={errors.password}
              required
            />

            {loginError && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '8px',
                color: '#c33',
                fontSize: '0.9rem',
                marginTop: '0.5rem'
              }}>
                {loginError}
              </div>
            )}

            <div className='login-options'>
              <label className='checkbox-label'>
                <input type="checkbox" />
                <span>Recordarme</span>
              </label>
              <a href="#" className='forgot-password'>¿Olvidaste tu contraseña?</a>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="large"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className='login-footer'>
            <p>¿No tienes una cuenta? <a href="#">Contacta al administrador</a></p>
          </div>
        </div>

        <div className='login-info'>
          <h2>Gestiona tu inventario de forma eficiente</h2>
          <ul className='features-list'>
            <li>✓ Control total de productos</li>
            <li>✓ Gestión de ventas y compras</li>
            <li>✓ Reportes en tiempo real</li>
            <li>✓ Múltiples almacenes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Login
