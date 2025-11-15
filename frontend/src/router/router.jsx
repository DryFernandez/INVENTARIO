import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from "../app/dashboard";
import Productos from '../app/Productos'
import Login from '../app/Login'
import Proveedores from '../app/Proveedores'
import Categorias from '../app/Categorias'
import Ventas from '../app/Ventas'
import VentasRegistradas from '../app/VentasRegistradas'
import Compras from '../app/Compras'
import ComprasRegistradas from '../app/ComprasRegistradas'
import Perfil from '../app/Perfil'
import Almacenes from '../app/Almacenes'
import Clientes from '../app/Clientes'
import Usuarios from '../app/Usuarios'
import { canAccess } from '../utils/permissions'

// Componente para proteger rutas
const ProtectedRoute = ({ children, permission }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Si se especifica un permiso, verificarlo
  if (permission && !canAccess(permission)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const Path = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        
        {/* Rutas protegidas */}
        <Route path="/" element={
          <ProtectedRoute permission="dashboard">
            <Dashboard/>
          </ProtectedRoute>
        }/>
        <Route path="/productos" element={
          <ProtectedRoute permission="productos_ver">
            <Productos/>
          </ProtectedRoute>
        }/>
        <Route path="/proveedores" element={
          <ProtectedRoute permission="proveedores_ver">
            <Proveedores/>
          </ProtectedRoute>
        }/>
        <Route path="/categorias" element={
          <ProtectedRoute permission="categorias_ver">
            <Categorias/>
          </ProtectedRoute>
        }/>
        <Route path="/ventas" element={
          <ProtectedRoute permission="ventas_ver">
            <Ventas/>
          </ProtectedRoute>
        }/>
        <Route path="/ventas-registradas" element={
          <ProtectedRoute permission="ventas_registradas">
            <VentasRegistradas/>
          </ProtectedRoute>
        }/>
        <Route path="/compras" element={
          <ProtectedRoute permission="compras_ver">
            <Compras/>
          </ProtectedRoute>
        }/>
        <Route path="/compras-registradas" element={
          <ProtectedRoute permission="compras_registradas">
            <ComprasRegistradas/>
          </ProtectedRoute>
        }/>
        <Route path="/perfil" element={
          <ProtectedRoute permission="perfil">
            <Perfil/>
          </ProtectedRoute>
        }/>
        <Route path="/almacenes" element={
          <ProtectedRoute permission="almacenes_ver">
            <Almacenes/>
          </ProtectedRoute>
        }/>
        <Route path="/clientes" element={
          <ProtectedRoute permission="clientes_ver">
            <Clientes/>
          </ProtectedRoute>
        }/>
        <Route path="/usuarios" element={
          <ProtectedRoute permission="usuarios_ver">
            <Usuarios/>
          </ProtectedRoute>
        }/>
        
        <Route
          path="*"
          element={
            <>
              <h1 style={{'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center' ,'textAlign': 'center', 'minHeight': '90vh'}}>404 - Página no encontrada</h1>
            </>
          }
        ></Route>
      </Routes>
    </Router>
  );
};

export default Path;