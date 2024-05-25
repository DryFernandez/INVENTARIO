import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from "../app/dashboard";
import Nav from '../components/nav/Nav'
import Bar from  '../components/bar/Bar'
import Productos from '../app/Productos'
import Login from '../app/Login'
import Proveedores from '../app/Proveedores'
import Categorias from '../app/Categorias'
import Ventas from '../app/Ventas'
import Compras from '../app/Compras'
import Perfil from '../app/Perfil'
import Almacenes from '../app/Almacenes'
 
const Path = () => {
  return (
    <Router>
      <Routes>
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route path="/nav" element={<Nav/>}/>
      <Route path="/bar" element={<Bar/>}/>
      <Route path="/productos" element={<Productos/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/proveedores" element={<Proveedores/>}/>
      <Route path="/categorias" element={<Categorias/>}/>
      <Route path="/ventas" element={<Ventas/>}/>
      <Route path="/compras" element={<Compras/>}/>
      <Route path="/perfil" element={<Perfil/>}/>
      <Route path="/almacenes" element={<Almacenes/>}/>
         <Route
            path="*"
            element={
              <>
                <h1 style={{'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center' ,'textAlign': 'center', 'minHeight': '90vh'}}>not found this path </h1>
               
              </>
            }
          ></Route>
      </Routes>
    </Router>
  );
};

export default Path;