/* eslint-disable */
import React from 'react';

import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';

import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import PrivateRouteCliente from './components/PrivateRouteCliente';
import DashboardLayout from './layout/DashboardLayout';
import Ayuda from './pages/Ayuda';
import ClienteFacturaDetalle from './pages/ClienteFacturaDetalle';
import ClienteFacturas from './pages/ClienteFacturas';
import ClienteLogin from './pages/ClienteLogin';
import Clientes from './pages/Clientes';
import Configuracion from './pages/Configuracion';
import FacturaAnular from './pages/FacturaAnular';
import Facturas from './pages/Facturas';
import FacturaVista from './pages/FacturaVista';
import Gerente from './pages/Gerente';
import Home from './pages/Home';
import Inventario from './pages/Inventario';
import ListadoFacturas from './pages/ListadoFacturas';
import Productos from './pages/Productos';
import Proveedores from './pages/Proveedores';
import RecuperarClave from './pages/RecuperarClave';
import Reportes from './pages/Reportes';
import CrearContrasena from './pages/CrearContrasena';

import SessionTimeout from "./components/SessionTimeout";

function App() {
  return (
    <BrowserRouter>

      <SessionTimeout />

      <Routes>

        {/* 🔓 PÚBLICAS */}
        <Route path="/"                  element={<Home />} />
        <Route path="/ayuda"             element={<Ayuda />} />
        <Route path="/login"             element={<Login />} />
        <Route path="/recuperar-clave"   element={<RecuperarClave />} />
        <Route path="/crear-contrasena"  element={<CrearContrasena />} />

        {/* 🚫 Sin permiso */}
        <Route path="/sin-permiso" element={
          <div style={{ textAlign:"center", marginTop:"100px" }}>
            <h2>🚫 No tienes permiso para ver esta página</h2>
            <a href="/login">← Volver al inicio</a>
          </div>
        }/>

        {/* 👤 PORTAL CLIENTE */}
        <Route path="/cliente/login" element={<ClienteLogin />} />

        <Route path="/cliente/facturas" element={
          <PrivateRouteCliente>
            <ClienteFacturas />
          </PrivateRouteCliente>
        }/>

        <Route path="/cliente/factura/:id" element={
          <PrivateRouteCliente>
            <ClienteFacturaDetalle />
          </PrivateRouteCliente>
        }/>

        {/* 🧾 FACTURAS FUERA DEL PANEL */}
        <Route path="/factura/:id" element={<FacturaVista />} />

        <Route path="/factura/anular/:id" element={
          <PrivateRoute rolPermitido="Gerente 1">
            <FacturaAnular />
          </PrivateRoute>
        } />

        {/* 🧑‍💼 PANEL GERENTE */}
        <Route path="/gerente" element={
          <PrivateRoute rolPermitido="Gerente 1">
            <DashboardLayout />
          </PrivateRoute>
        }>

          <Route index element={<Gerente />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="productos" element={<Productos />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="facturas" element={<Facturas />} />
          <Route path="listado-facturas" element={<ListadoFacturas />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="configuracion" element={<Configuracion />} />

        </Route>

        {/* 🧑‍💻 PANEL ADMINISTRADOR */}
        <Route path="/admin" element={
          <PrivateRoute rolPermitido="Administrador">
            <DashboardLayout />
          </PrivateRoute>
        }>

          <Route index element={<Reportes />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="productos" element={<Productos />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="facturas" element={<Facturas />} />
          <Route path="listado-facturas" element={<ListadoFacturas />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="configuracion" element={<Configuracion />} />

        </Route>

        {/* 👨‍🔧 PANEL EMPLEADO */}
        <Route path="/empleado" element={
          <PrivateRoute rolPermitido="Empleado">
            <DashboardLayout />
          </PrivateRoute>
        }>

          <Route index element={<Facturas />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="facturas" element={<Facturas />} />
          <Route path="listado-facturas" element={<ListadoFacturas />} />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;