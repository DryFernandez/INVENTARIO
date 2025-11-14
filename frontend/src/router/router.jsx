import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from "../app/dashboard";
import Productos from '../app/Productos'
import Login from '../app/Login'
import Proveedores from '../app/Proveedores'
import Categorias from '../app/Categorias'
import Ventas from '../app/Ventas'
import Compras from '../app/Compras'
import Perfil from '../app/Perfil'
import Almacenes from '../app/Almacenes'

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
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
          <ProtectedRoute>
            <Dashboard/>
          </ProtectedRoute>
        }/>
        <Route path="/productos" element={
          <ProtectedRoute>
            <Productos/>
          </ProtectedRoute>
        }/>
        <Route path="/proveedores" element={
          <ProtectedRoute>
            <Proveedores/>
          </ProtectedRoute>
        }/>
        <Route path="/categorias" element={
          <ProtectedRoute>
            <Categorias/>
          </ProtectedRoute>
        }/>
        <Route path="/ventas" element={
          <ProtectedRoute>
            <Ventas/>
          </ProtectedRoute>
        }/>
        <Route path="/compras" element={
          <ProtectedRoute>
            <Compras/>
          </ProtectedRoute>
        }/>
        <Route path="/perfil" element={
          <ProtectedRoute>
            <Perfil/>
          </ProtectedRoute>
        }/>
        <Route path="/almacenes" element={
          <ProtectedRoute>
            <Almacenes/>
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