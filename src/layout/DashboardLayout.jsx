import './layout.css';

import React from 'react';

import { Outlet } from 'react-router-dom';

import Footer from '../components/Footer';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

function DashboardLayout() {
  const numeroWhatsApp = '573144571556';
  const mensajeWhatsApp = encodeURIComponent('Hola, necesito ayuda con FACTUFAST.');

  return (
    <div className="dashboard-layout">
      <Header />

      <div className="dashboard-body">
        <Sidebar />

        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>

      <a
        href={`https://wa.me/${numeroWhatsApp}?text=${mensajeWhatsApp}`}
        target="_blank"
        rel="noreferrer"
        className="whatsapp-help-button"
        aria-label="Solicitar ayuda por WhatsApp"
      >
        <span className="whatsapp-help-icon">✆</span>
        <span className="whatsapp-help-text">Ayuda</span>
      </a>

      <Footer />
    </div>
  );
}

export default DashboardLayout;